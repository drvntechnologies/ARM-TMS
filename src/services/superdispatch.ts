interface SuperDispatchVehicle {
  year: number;
  make: string;
  model: string;
  type: string;
  is_operable: boolean;
}

interface SuperDispatchRequest {
  origin: {
    zip: string;
    state: string;
  };
  destination: {
    zip: string;
    state: string;
  };
  vehicles: SuperDispatchVehicle[];
  trailer_type: 'open' | 'enclosed';
}

interface SuperDispatchResponse {
  carrier_price: number;
  distance: number;
  estimated_days: number;
  confidence: number;
}

const SUPERDISPATCH_API_URL = 'https://api.superdispatch.com/v1/pricing';

export async function getCarrierRate(request: SuperDispatchRequest): Promise<SuperDispatchResponse> {
  const apiKey = import.meta.env.VITE_SUPERDISPATCH_API_KEY;

  if (!apiKey) {
    console.warn('SuperDispatch API key not configured, using mock data');
    return getMockCarrierRate(request);
  }

  try {
    const response = await fetch(SUPERDISPATCH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(request),
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
    console.error('SuperDispatch API error:', error);
    return getMockCarrierRate(request);
  }
}

function getMockCarrierRate(request: SuperDispatchRequest): SuperDispatchResponse {
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

export type { SuperDispatchRequest, SuperDispatchResponse, SuperDispatchVehicle };
