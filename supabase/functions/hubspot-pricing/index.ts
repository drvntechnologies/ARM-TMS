import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key",
};

interface Vehicle {
  year: number;
  make: string;
  model: string;
  type: string;
  is_operable: boolean;
  is_minivan?: boolean;
  is_lifted?: boolean;
  has_oversized_tires?: boolean;
  value?: number;
  fvp_deductible?: 0 | 500 | null;
}

interface PricingRequest {
  origin_zip: string;
  origin_state: string;
  destination_zip: string;
  destination_state: string;
  vehicles: Vehicle[];
  transport_type: 'open' | 'enclosed';
  payment_method?: 'credit_card' | 'team_code';
  quote_date?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const apiKey = req.headers.get("X-API-Key");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "API key is required. Please provide X-API-Key header."
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const apiKeyHash = await hashApiKey(apiKey);

    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("hubspot_api_keys")
      .select("id, engine_id, is_active, rate_limit_per_hour, usage_count, expires_at, ip_whitelist")
      .eq("api_key_hash", apiKeyHash)
      .maybeSingle();

    if (apiKeyError || !apiKeyData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid API key"
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!apiKeyData.is_active) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "API key has been deactivated"
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "API key has expired"
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    await supabase
      .from("hubspot_api_keys")
      .update({
        usage_count: apiKeyData.usage_count + 1,
        last_used_at: new Date().toISOString()
      })
      .eq("id", apiKeyData.id);

    const pricingRequest: PricingRequest = await req.json();

    if (!pricingRequest.origin_zip || !pricingRequest.origin_state ||
        !pricingRequest.destination_zip || !pricingRequest.destination_state ||
        !pricingRequest.vehicles || pricingRequest.vehicles.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: origin_zip, origin_state, destination_zip, destination_state, vehicles"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const pricing = await calculatePricing(
      supabase,
      apiKeyData.engine_id,
      pricingRequest,
      apiKeyData.id
    );

    return new Response(
      JSON.stringify({
        success: true,
        pricing
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in hubspot-pricing function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function calculatePricing(
  supabase: any,
  engineId: string,
  request: PricingRequest,
  apiKeyId: string
) {
  const { data: rules, error: rulesError } = await supabase
    .from("pricing_engine_rules")
    .select("*")
    .eq("engine_id", engineId)
    .maybeSingle();

  if (rulesError || !rules) {
    throw new Error("Pricing engine rules not found");
  }

  const { data: surcharges } = await supabase
    .from("seasonal_surcharges")
    .select("*")
    .eq("engine_id", engineId)
    .eq("is_active", true)
    .order("single_vehicle_cost", { ascending: false });

  const carrierRate = await getCarrierRate(request);

  let transportRate = carrierRate.carrier_price;

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

  const quoteDate = request.quote_date ? new Date(request.quote_date) : new Date();
  const appliedSurcharge = calculateSeasonalSurcharge(
    request.origin_state,
    request.destination_state,
    request.vehicles.length,
    quoteDate,
    surcharges || []
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

  const breakdown = {
    carrier_rate: Math.round(carrierRate.carrier_price),
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
    distance_miles: carrierRate.distance,
    delivery_days: carrierRate.estimated_days,
    confidence_score: carrierRate.confidence,
  };

  await supabase.from("pricing_calculations").insert({
    engine_id: engineId,
    api_key_id: apiKeyId,
    request_source: "hubspot_api",
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
    superdispatch_response: carrierRate,
  });

  return breakdown;
}

function calculateSeasonalSurcharge(
  originState: string,
  destinationState: string,
  vehicleCount: number,
  quoteDate: Date,
  surcharges: any[]
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

async function getCarrierRate(request: PricingRequest) {
  const superDispatchApiKey = Deno.env.get("SUPERDISPATCH_API_KEY");

  if (!superDispatchApiKey) {
    return getMockCarrierRate(request);
  }

  try {
    const response = await fetch("https://api.superdispatch.com/v1/pricing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${superDispatchApiKey}`,
      },
      body: JSON.stringify({
        origin: {
          zip: request.origin_zip,
          state: request.origin_state,
        },
        destination: {
          zip: request.destination_zip,
          state: request.destination_state,
        },
        vehicles: request.vehicles,
        trailer_type: "open",
      }),
    });

    if (!response.ok) {
      throw new Error(`SuperDispatch API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      carrier_price: data.carrier_price || data.price,
      distance: data.distance || 0,
      estimated_days: data.estimated_days || data.delivery_days || 7,
      confidence: data.confidence || 75,
    };
  } catch (error) {
    console.error("SuperDispatch API error:", error);
    return getMockCarrierRate(request);
  }
}

function getMockCarrierRate(request: PricingRequest) {
  const baseDistance = 1000;
  const baseRate = 500;
  const perMileRate = 0.50;

  const estimatedDistance = baseDistance;
  const estimatedPrice = baseRate + (estimatedDistance * perMileRate);

  return {
    carrier_price: Math.round(estimatedPrice),
    distance: estimatedDistance,
    estimated_days: Math.ceil(estimatedDistance / 400),
    confidence: 70,
  };
}
