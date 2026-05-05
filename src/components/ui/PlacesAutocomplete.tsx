import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

interface AddressComponents {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (components: AddressComponents) => void;
  placeholder?: string;
  className?: string;
}

declare global {
  interface Window {
    google: any;
    __mapsLoading?: Promise<void>;
  }
}

async function getMapsKey(): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'google_maps_api_key')
      .maybeSingle();
    return data?.setting_value || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || null;
  } catch {
    return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || null;
  }
}

function loadMapsScript(apiKey: string): Promise<void> {
  if (window.google?.maps?.places) return Promise.resolve();

  if (window.__mapsLoading) return window.__mapsLoading;

  window.__mapsLoading = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-maps-key]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-maps-key', '1');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });

  return window.__mapsLoading;
}

export default function PlacesAutocomplete({ value, onChange, onAddressSelect, placeholder, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sessionToken, setSessionToken] = useState<any>(null);
  const serviceRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    getMapsKey().then(key => {
      if (!key || cancelled) return;
      loadMapsScript(key).then(() => {
        if (cancelled) return;
        serviceRef.current = new window.google.maps.places.AutocompleteService();
        geocoderRef.current = new window.google.maps.Geocoder();
        setSessionToken(new window.google.maps.places.AutocompleteSessionToken());
        setReady(true);
      }).catch(err => console.warn('Google Maps failed to load:', err));
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback((input: string) => {
    if (!ready || !serviceRef.current || input.length < 3) {
      setSuggestions([]);
      return;
    }
    serviceRef.current.getPlacePredictions(
      {
        input,
        sessionToken,
        componentRestrictions: { country: 'us' },
        types: ['address'],
      },
      (predictions: any[], status: string) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      }
    );
  }, [ready, sessionToken]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v);
    fetchSuggestions(v);
  };

  const handleSelect = (prediction: any) => {
    setShowSuggestions(false);
    setSuggestions([]);

    if (!geocoderRef.current) return;

    geocoderRef.current.geocode(
      { placeId: prediction.place_id },
      (results: any[], status: string) => {
        if (status !== 'OK' || !results[0]) return;

        const result = results[0];
        const components = result.address_components as any[];

        const get = (type: string) =>
          components.find((c: any) => c.types.includes(type))?.long_name || '';
        const getShort = (type: string) =>
          components.find((c: any) => c.types.includes(type))?.short_name || '';

        const streetNumber = get('street_number');
        const route = get('route');
        const street = [streetNumber, route].filter(Boolean).join(' ');

        const parsed: AddressComponents = {
          street,
          city: get('locality') || get('sublocality') || get('postal_town'),
          state: getShort('administrative_area_level_1'),
          zip: get('postal_code'),
          country: get('country'),
        };

        onChange(street || prediction.description);
        onAddressSelect(parsed);

        // rotate session token after selection
        setSessionToken(new window.google.maps.places.AutocompleteSessionToken());
      }
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInput}
        onFocus={() => value.length >= 3 && suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder || 'Start typing an address...'}
        className={className}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto text-xs">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onMouseDown={() => handleSelect(s)}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
            >
              <span className="font-medium text-gray-900">
                {s.structured_formatting?.main_text}
              </span>
              <span className="text-gray-500 ml-1">
                {s.structured_formatting?.secondary_text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export type { AddressComponents };
