'use client';
import { useCallback, useState } from 'react';

export type GeolocationCoordinates = {
  lat: number;
  lng: number;
};

export type UseGeolocationResult = {
  coordinates: GeolocationCoordinates | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
};

export function useGeolocation(): UseGeolocationResult {
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('GEOLOCATION_UNSUPPORTED');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLoading(false);
      },
      () => {
        setError('GEOLOCATION_DENIED');
        setLoading(false);
      }
    );
  }, []);

  return { coordinates, loading, error, requestLocation };
}
