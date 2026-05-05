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

import { supabase } from '../lib/supabase';

const SUPERDISPATCH_API_URL = 'https://pricing-insights.superdispatch.com/api/v1/recommended-price';

async function getSetting(key: string, envFallback: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .maybeSingle();
    if (data?.setting_value) return data.setting_value;
  } catch {
    // fall through
  }
  return import.meta.env[envFallback] || null;
}

export async function getCarrierRate(request: SuperDispatchRequest): Promise<SuperDispatchResponse> {
  const apiKey = await getSetting('superdispatch_api_key', 'VITE_SUPERDISPATCH_API_KEY');

  if (!apiKey) {
    console.warn('SuperDispatch API key not configured, using mock data');
    return getMockCarrierRate(request);
  }

  try {
    const response = await fetch(SUPERDISPATCH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`,
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

async function getMockCarrierRate(request: SuperDispatchRequest): Promise<SuperDispatchResponse> {
  let distance: number;

  try {
    distance = await calculateDistanceWithGoogle(request.origin.zip, request.destination.zip);
  } catch (error) {
    console.warn('Google Maps API error, using fallback calculation:', error);
    const originCoords = getZipCoordinates(request.origin.zip, request.origin.state);
    const destCoords = getZipCoordinates(request.destination.zip, request.destination.state);
    distance = calculateDistance(originCoords, destCoords);
  }

  const baseRate = 300;
  const perMileRate = 0.58;
  const vehicleCount = request.vehicles.length;

  let price = baseRate + (distance * perMileRate);

  if (vehicleCount > 1) {
    price = price + ((vehicleCount - 1) * 150);
  }

  request.vehicles.forEach(vehicle => {
    if (!vehicle.is_operable) {
      price += 150;
    }
  });

  return {
    carrier_price: Math.round(price),
    distance: Math.round(distance),
    estimated_days: Math.max(1, Math.ceil(distance / 450)),
    confidence: 75,
  };
}

async function calculateDistanceWithGoogle(originZip: string, destinationZip: string): Promise<number> {
  const apiKey = await getSetting('google_maps_api_key', 'VITE_GOOGLE_MAPS_API_KEY');

  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
  url.searchParams.append('origins', originZip);
  url.searchParams.append('destinations', destinationZip);
  url.searchParams.append('units', 'imperial');
  url.searchParams.append('key', apiKey);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Google Maps API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`Google Maps API status: ${data.status}`);
  }

  const element = data.rows[0]?.elements[0];

  if (!element || element.status !== 'OK') {
    throw new Error('Unable to calculate distance');
  }

  const distanceInMeters = element.distance.value;
  const distanceInMiles = distanceInMeters * 0.000621371;

  return distanceInMiles;
}

function calculateDistance(coords1: { lat: number; lon: number }, coords2: { lat: number; lon: number }): number {
  const R = 3959;
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lon - coords1.lon);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function getZipCoordinates(zip: string, state: string): { lat: number; lon: number } {
  const stateCoords: { [key: string]: { lat: number; lon: number } } = {
    'AL': { lat: 32.806671, lon: -86.791130 },
    'AK': { lat: 61.370716, lon: -152.404419 },
    'AZ': { lat: 33.729759, lon: -111.431221 },
    'AR': { lat: 34.969704, lon: -92.373123 },
    'CA': { lat: 36.116203, lon: -119.681564 },
    'CO': { lat: 39.059811, lon: -105.311104 },
    'CT': { lat: 41.597782, lon: -72.755371 },
    'DE': { lat: 39.318523, lon: -75.507141 },
    'FL': { lat: 27.766279, lon: -81.686783 },
    'GA': { lat: 33.040619, lon: -83.643074 },
    'HI': { lat: 21.094318, lon: -157.498337 },
    'ID': { lat: 44.240459, lon: -114.478828 },
    'IL': { lat: 40.349457, lon: -88.986137 },
    'IN': { lat: 39.849426, lon: -86.258278 },
    'IA': { lat: 42.011539, lon: -93.210526 },
    'KS': { lat: 38.526600, lon: -96.726486 },
    'KY': { lat: 37.668140, lon: -84.670067 },
    'LA': { lat: 31.169546, lon: -91.867805 },
    'ME': { lat: 44.693947, lon: -69.381927 },
    'MD': { lat: 39.063946, lon: -76.802101 },
    'MA': { lat: 42.230171, lon: -71.530106 },
    'MI': { lat: 43.326618, lon: -84.536095 },
    'MN': { lat: 45.694454, lon: -93.900192 },
    'MS': { lat: 32.741646, lon: -89.678696 },
    'MO': { lat: 38.456085, lon: -92.288368 },
    'MT': { lat: 46.921925, lon: -110.454353 },
    'NE': { lat: 41.125370, lon: -98.268082 },
    'NV': { lat: 38.313515, lon: -117.055374 },
    'NH': { lat: 43.452492, lon: -71.563896 },
    'NJ': { lat: 40.298904, lon: -74.521011 },
    'NM': { lat: 34.840515, lon: -106.248482 },
    'NY': { lat: 42.165726, lon: -74.948051 },
    'NC': { lat: 35.630066, lon: -79.806419 },
    'ND': { lat: 47.528912, lon: -99.784012 },
    'OH': { lat: 40.388783, lon: -82.764915 },
    'OK': { lat: 35.565342, lon: -96.928917 },
    'OR': { lat: 44.572021, lon: -122.070938 },
    'PA': { lat: 40.590752, lon: -77.209755 },
    'RI': { lat: 41.680893, lon: -71.511780 },
    'SC': { lat: 33.856892, lon: -80.945007 },
    'SD': { lat: 44.299782, lon: -99.438828 },
    'TN': { lat: 35.747845, lon: -86.692345 },
    'TX': { lat: 31.054487, lon: -97.563461 },
    'UT': { lat: 40.150032, lon: -111.862434 },
    'VT': { lat: 44.045876, lon: -72.710686 },
    'VA': { lat: 37.769337, lon: -78.169968 },
    'WA': { lat: 47.400902, lon: -121.490494 },
    'WV': { lat: 38.491226, lon: -80.954453 },
    'WI': { lat: 44.268543, lon: -89.616508 },
    'WY': { lat: 42.755966, lon: -107.302490 },
  };

  return stateCoords[state.toUpperCase()] || { lat: 39.8283, lon: -98.5795 };
}

export type { SuperDispatchRequest, SuperDispatchResponse, SuperDispatchVehicle };
