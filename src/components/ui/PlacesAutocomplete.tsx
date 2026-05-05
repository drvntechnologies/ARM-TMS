import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

export interface AddressComponents {
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
    __mapsKeyPromise?: Promise<string | null>;
    __mapsScriptPromise?: Promise<void>;
  }
}

function getMapsKey(): Promise<string | null> {
  if (!window.__mapsKeyPromise) {
    window.__mapsKeyPromise = supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'google_maps_api_key')
      .maybeSingle()
      .then(({ data }) => data?.setting_value || (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || null)
      .catch(() => (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || null);
  }
  return window.__mapsKeyPromise;
}

function loadMapsScript(apiKey: string): Promise<void> {
  if (window.google?.maps?.places) return Promise.resolve();
  if (window.__mapsScriptPromise) return window.__mapsScriptPromise;

  window.__mapsScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });

  return window.__mapsScriptPromise;
}

export default function PlacesAutocomplete({ value, onChange, onAddressSelect, placeholder, className }: Props) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapsReady, setMapsReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const sessionTokenRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMapsKey().then(key => {
      if (!key || cancelled) return;
      loadMapsScript(key).then(() => {
        if (cancelled) return;
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        geocoderRef.current = new window.google.maps.Geocoder();
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        setMapsReady(true);
      }).catch(err => console.warn('Google Maps failed to load:', err));
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchSuggestions = (input: string) => {
    if (!mapsReady || !autocompleteServiceRef.current || input.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    autocompleteServiceRef.current.getPlacePredictions(
      {
        input,
        sessionToken: sessionTokenRef.current,
        componentRestrictions: { country: 'us' },
        types: ['address'],
      },
      (predictions: any[] | null, status: string) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 200);
  };

  const handleSelect = (prediction: any) => {
    setShowSuggestions(false);
    setSuggestions([]);

    if (!geocoderRef.current) return;

    geocoderRef.current.geocode(
      { placeId: prediction.place_id },
      (results: any[], status: string) => {
        if (status !== 'OK' || !results[0]) return;

        const components = results[0].address_components as any[];
        const get = (type: string) =>
          components.find((c: any) => c.types.includes(type))?.long_name || '';
        const getShort = (type: string) =>
          components.find((c: any) => c.types.includes(type))?.short_name || '';

        const street = [get('street_number'), get('route')].filter(Boolean).join(' ');
        const parsed: AddressComponents = {
          street,
          city: get('locality') || get('sublocality') || get('postal_town'),
          state: getShort('administrative_area_level_1'),
          zip: get('postal_code'),
          country: get('country'),
        };

        onChange(street || prediction.structured_formatting?.main_text || prediction.description);
        onAddressSelect(parsed);

        // Rotate session token after a completed selection
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
      }
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder || 'Start typing an address...'}
        className={className}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto text-xs">
          {suggestions.map(s => (
            <li
              key={s.place_id}
              onMouseDown={e => { e.preventDefault(); handleSelect(s); }}
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
