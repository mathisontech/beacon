"use client";

import { useState, useCallback, useEffect } from "react";
import type { IconSource } from "@/lib/icons";
import {
  type SavedLocation,
  loadLocations,
  addLocation,
  removeLocation,
  updateLocation,
} from "@/lib/saved-locations";

export type { SavedLocation } from "@/lib/saved-locations";

export function useSavedLocations() {
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setLocations(loadLocations());
  }, []);

  const add = useCallback(
    (loc: { name: string; lat: number; lng: number; zoom: number; icon: IconSource; subscript?: number }) => {
      setLocations((prev) => addLocation(prev, loc));
    },
    []
  );

  const remove = useCallback((id: string) => {
    setLocations((prev) => removeLocation(prev, id));
    setActiveId((prev) => (prev === id ? null : prev));
  }, []);

  const update = useCallback(
    (id: string, patch: Partial<Omit<SavedLocation, "id">>) => {
      setLocations((prev) => updateLocation(prev, id, patch));
    },
    []
  );

  const select = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  return { locations, activeId, add, remove, update, select };
}
