import { supabase } from '../lib/supabase';
import { getCarrierRate, SuperDispatchVehicle } from './superdispatch';

interface PricingEngineRules {
  margin_divisor: number;
  enclosed_multiplier: number;
  minivan_premium: number;
  lifted_vehicle_fee: number;
  oversized_tires_fee: number;
  processing_fee_percent: number;
  d1_discount_percent: number;
  fvp_base_percent: number;
  fvp_deductible_500_fee: number;
  fvp_deductible_0_fee: number;
}

interface SeasonalSurcharge {
  id: string;
  surcharge_name: string;
  origin_states: string[];
  destination_states: string[];
  direction: 'outbound' | 'inbound' | 'both';
  start_month: number;
  start_day: number;
  end_month: number;
  end_day: number;
  single_vehicle_cost: number;
  multiple_vehicle_cost: number;
}

interface VehicleDetails extends SuperDispatchVehicle {
  is_minivan?: boolean;
  is_lifted?: boolean;
  has_oversized_tires?: boolean;
  value?: number;
  fvp_deductible?: 0 | 500 | null;
}

interface PricingRequest {
  engine_id?: string;
  origin_zip: string;
  origin_state: string;
  destination_zip: string;
  destination_state: string;
  vehicles: VehicleDetails[];
  transport_type: 'open' | 'enclosed';
  payment_method?: 'credit_card' | 'team_code';
  quote_date?: Date;
  request_source?: string;
  api_key_id?: string;
}

interface PricingBreakdown {
  carrier_rate: number;
  base_transport_rate: number;
  minivan_premium: number;
  modification_charges: number;
  seasonal_surcharge: number;
  seasonal_surcharge_type: string | null;
  processing_fee: number;
  base_price: number;
  d1_discount: number;
  fvp_cost: number;
  total_price: number;
  distance_miles: number;
  delivery_days: number;
  confidence_score: number;
  calculation_details: {
    per_vehicle_breakdown?: any[];
    rules_applied: string[];
  };
}

export async function calculatePrice(request: PricingRequest): Promise<PricingBreakdown> {
  const engineId = request.engine_id || await getDefaultEngineId();

  const rules = await getEngineRules(engineId);
  const surcharges = await getSeasonalSurcharges(engineId);

  const carrierResponse = await getCarrierRate({
    origin: {
      zip: request.origin_zip,
      state: request.origin_state,
    },
    destination: {
      zip: request.destination_zip,
      state: request.destination_state,
    },
    vehicles: request.vehicles,
    trailer_type: 'open',
  });

  let transportRate = carrierResponse.carrier_price;

  if (request.transport_type === 'enclosed') {
    transportRate = transportRate * rules.enclosed_multiplier;
  }

  transportRate = transportRate / rules.margin_divisor;

  let minivanPremium = 0;
  let modificationCharges = 0;

  request.vehicles.forEach((vehicle) => {
    if (vehicle.is_minivan) {
      minivanPremium += rules.minivan_premium;
    }
    if (vehicle.is_lifted) {
      modificationCharges += rules.lifted_vehicle_fee;
    }
    if (vehicle.has_oversized_tires) {
      modificationCharges += rules.oversized_tires_fee;
    }
  });

  const appliedSurcharge = calculateSeasonalSurcharge(
    request.origin_state,
    request.destination_state,
    request.vehicles.length,
    request.quote_date || new Date(),
    surcharges
  );

  const subtotal = transportRate + minivanPremium + modificationCharges + appliedSurcharge.amount;

  let processingFee = 0;
  if (request.payment_method === 'credit_card') {
    processingFee = subtotal * (rules.processing_fee_percent / 100);
  }

  const basePrice = Math.ceil(subtotal + processingFee);

  const d1Discount = basePrice * (rules.d1_discount_percent / 100);

  let fvpCost = 0;
  request.vehicles.forEach((vehicle) => {
    if (vehicle.fvp_deductible !== null && vehicle.fvp_deductible !== undefined) {
      const baseCost = (vehicle.value || 0) * (rules.fvp_base_percent / 100);
      const deductibleFee = vehicle.fvp_deductible === 0
        ? rules.fvp_deductible_0_fee
        : rules.fvp_deductible_500_fee;
      fvpCost += baseCost + deductibleFee;
    }
  });

  const totalPrice = Math.ceil(basePrice - d1Discount + fvpCost);

  const breakdown: PricingBreakdown = {
    carrier_rate: Math.round(carrierResponse.carrier_price),
    base_transport_rate: Math.round(transportRate),
    minivan_premium: Math.round(minivanPremium),
    modification_charges: Math.round(modificationCharges),
    seasonal_surcharge: Math.round(appliedSurcharge.amount),
    seasonal_surcharge_type: appliedSurcharge.type,
    processing_fee: Math.round(processingFee),
    base_price: basePrice,
    d1_discount: Math.round(d1Discount),
    fvp_cost: Math.round(fvpCost),
    total_price: totalPrice,
    distance_miles: carrierResponse.distance,
    delivery_days: carrierResponse.estimated_days,
    confidence_score: carrierResponse.confidence,
    calculation_details: {
      rules_applied: [
        `Margin Divisor: ${rules.margin_divisor}`,
        request.transport_type === 'enclosed' ? `Enclosed Multiplier: ${rules.enclosed_multiplier}` : 'Open Transport',
        appliedSurcharge.type ? `Seasonal: ${appliedSurcharge.type}` : 'No Seasonal Surcharge',
        `D1 Discount: ${rules.d1_discount_percent}%`,
      ],
    },
  };

  await logPricingCalculation(engineId, request, breakdown);

  return breakdown;
}

function calculateSeasonalSurcharge(
  originState: string,
  destinationState: string,
  vehicleCount: number,
  quoteDate: Date,
  surcharges: SeasonalSurcharge[]
): { amount: number; type: string | null } {
  const month = quoteDate.getMonth() + 1;
  const day = quoteDate.getDate();

  for (const surcharge of surcharges) {
    const isInDateRange = checkDateInRange(
      month,
      day,
      surcharge.start_month,
      surcharge.start_day,
      surcharge.end_month,
      surcharge.end_day
    );

    if (!isInDateRange) continue;

    const matchesRoute = checkRouteMatch(
      originState,
      destinationState,
      surcharge.origin_states,
      surcharge.destination_states,
      surcharge.direction
    );

    if (matchesRoute) {
      const cost = vehicleCount === 1
        ? surcharge.single_vehicle_cost
        : surcharge.multiple_vehicle_cost * vehicleCount;

      return {
        amount: cost,
        type: surcharge.surcharge_name,
      };
    }
  }

  return { amount: 0, type: null };
}

function checkDateInRange(
  currentMonth: number,
  currentDay: number,
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number
): boolean {
  const current = currentMonth * 100 + currentDay;
  const start = startMonth * 100 + startDay;
  const end = endMonth * 100 + endDay;

  if (start <= end) {
    return current >= start && current <= end;
  } else {
    return current >= start || current <= end;
  }
}

function checkRouteMatch(
  originState: string,
  destinationState: string,
  originStates: string[] | null,
  destinationStates: string[] | null,
  direction: string
): boolean {
  if (direction === 'outbound' || direction === 'both') {
    if (originStates && originStates.includes(originState)) {
      return true;
    }
  }

  if (direction === 'inbound' || direction === 'both') {
    if (destinationStates && destinationStates.includes(destinationState)) {
      return true;
    }
  }

  return false;
}

async function getDefaultEngineId(): Promise<string> {
  const { data, error } = await supabase
    .from('pricing_engines')
    .select('id')
    .eq('is_default', true)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data) {
    throw new Error('No default pricing engine found');
  }

  return data.id;
}

async function getEngineRules(engineId: string): Promise<PricingEngineRules> {
  const { data, error } = await supabase
    .from('pricing_engine_rules')
    .select('*')
    .eq('engine_id', engineId)
    .maybeSingle();

  if (error || !data) {
    throw new Error('Pricing engine rules not found');
  }

  return data as PricingEngineRules;
}

async function getSeasonalSurcharges(engineId: string): Promise<SeasonalSurcharge[]> {
  const { data, error } = await supabase
    .from('seasonal_surcharges')
    .select('*')
    .eq('engine_id', engineId)
    .eq('is_active', true)
    .order('single_vehicle_cost', { ascending: false });

  if (error) {
    console.error('Error fetching seasonal surcharges:', error);
    return [];
  }

  return data as SeasonalSurcharge[];
}

async function logPricingCalculation(
  engineId: string,
  request: PricingRequest,
  breakdown: PricingBreakdown
): Promise<void> {
  const { error } = await supabase.from('pricing_calculations').insert({
    engine_id: engineId,
    api_key_id: request.api_key_id || null,
    request_source: request.request_source || 'internal',
    origin_zip: request.origin_zip,
    origin_state: request.origin_state,
    destination_zip: request.destination_zip,
    destination_state: request.destination_state,
    vehicle_count: request.vehicles.length,
    transport_type: request.transport_type,
    carrier_rate: breakdown.carrier_rate,
    base_transport_rate: breakdown.base_transport_rate,
    minivan_premium: breakdown.minivan_premium,
    modification_charges: breakdown.modification_charges,
    seasonal_surcharge: breakdown.seasonal_surcharge,
    seasonal_surcharge_type: breakdown.seasonal_surcharge_type,
    processing_fee: breakdown.processing_fee,
    base_price: breakdown.base_price,
    d1_discount: breakdown.d1_discount,
    fvp_cost: breakdown.fvp_cost,
    total_price: breakdown.total_price,
    distance_miles: breakdown.distance_miles,
    delivery_days: breakdown.delivery_days,
    confidence_score: breakdown.confidence_score,
    calculation_breakdown: breakdown.calculation_details,
  });

  if (error) {
    console.error('Error logging pricing calculation:', error);
  }
}

export type { PricingRequest, PricingBreakdown, VehicleDetails };
