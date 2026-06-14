'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';

export function LocationBanner() {
  const location = useUserStore((state) => state.location);
  const locationLabel = useUserStore((state) => state.locationLabel);
  const setLocation = useUserStore((state) => state.setLocation);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    // If we already have location, skip
    if (location) return;

    // Try to get location on mount
    if ('geolocation' in navigator) {
      setRequesting(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const label = getLocationLabel(latitude, longitude);
          setLocation(latitude, longitude, label);
          setRequesting(false);
        },
        () => {
          // Permission denied or error — set default
          setLocation(12.9352, 77.6245, 'Koramangala, Bangalore');
          setRequesting(false);
        },
        { timeout: 5000 }
      );
    } else {
      setLocation(12.9352, 77.6245, 'Koramangala, Bangalore');
    }
  }, [location, setLocation]);

  function handleTap() {
    if ('geolocation' in navigator) {
      setRequesting(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const label = getLocationLabel(latitude, longitude);
          setLocation(latitude, longitude, label);
          setRequesting(false);
        },
        () => {
          setRequesting(false);
        },
        { timeout: 5000 }
      );
    }
  }

  const displayLabel = locationLabel || 'Tap to set location';

  return (
    <button
      onClick={handleTap}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium hover:bg-white/20 transition-colors"
      aria-label="Set delivery location"
    >
      <MapPin className="h-3.5 w-3.5 text-amazon-orange" />
      {requesting ? (
        <span className="animate-pulse">Locating...</span>
      ) : (
        <span>📍 Delivering to: {displayLabel}</span>
      )}
    </button>
  );
}

/**
 * Simple reverse geocode using lat ranges for demo purposes.
 */
function getLocationLabel(lat: number, lng: number): string {
  // Bangalore area
  if (lat >= 12.8 && lat <= 13.1 && lng >= 77.4 && lng <= 77.8) {
    if (lat >= 12.92 && lat <= 12.95) return 'Koramangala, Bangalore';
    if (lat >= 12.95 && lat <= 12.99) return 'Indiranagar, Bangalore';
    if (lat >= 12.99 && lat <= 13.02) return 'Whitefield, Bangalore';
    return 'Bangalore';
  }
  // Mumbai area
  if (lat >= 18.9 && lat <= 19.3 && lng >= 72.7 && lng <= 73.0) {
    return 'Mumbai';
  }
  // Delhi area
  if (lat >= 28.4 && lat <= 28.8 && lng >= 76.8 && lng <= 77.4) {
    return 'Delhi NCR';
  }
  // Chennai area
  if (lat >= 12.9 && lat <= 13.2 && lng >= 80.1 && lng <= 80.4) {
    return 'Chennai';
  }
  return 'Koramangala, Bangalore';
}
