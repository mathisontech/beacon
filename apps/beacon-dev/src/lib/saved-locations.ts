import type { IconSource } from "@/lib/icons";

export interface SavedLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zoom: number;
  icon: IconSource;
  subscript?: number;
}

const STORAGE_KEY = "beacon_saved_locations";

export function loadLocations(): SavedLocation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocations(locs: SavedLocation[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(locs));
}

export function addLocation(
  locs: SavedLocation[],
  loc: Omit<SavedLocation, "id">
): SavedLocation[] {
  const next = [...locs, { ...loc, id: Date.now().toString() }];
  saveLocations(next);
  return next;
}

export function removeLocation(
  locs: SavedLocation[],
  id: string
): SavedLocation[] {
  const next = locs.filter((l) => l.id !== id);
  saveLocations(next);
  return next;
}

export function updateLocation(
  locs: SavedLocation[],
  id: string,
  patch: Partial<Omit<SavedLocation, "id">>
): SavedLocation[] {
  const next = locs.map((l) => (l.id === id ? { ...l, ...patch } : l));
  saveLocations(next);
  return next;
}
