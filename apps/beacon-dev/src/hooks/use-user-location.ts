"use client";

import { useState, useEffect } from "react";
import { reverseGeocode } from "@/lib/reverse-geocode";

export interface UserLocation {
  lat: number;
  lng: number;
  name: string;
  loading: boolean;
}

const DEFAULT: UserLocation = {
  lat: 39.8,
  lng: -98.5,
  name: "",
  loading: true,
};

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation>(DEFAULT);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({ ...prev, loading: false }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const geo = await reverseGeocode(lat, lng);
        setLocation({
          lat,
          lng,
          name: geo?.short || "",
          loading: false,
        });
      },
      () => {
        setLocation((prev) => ({ ...prev, loading: false }));
      },
      { timeout: 8000 }
    );
  }, []);

  return location;
}
