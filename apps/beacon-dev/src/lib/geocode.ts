export interface GeoResult {
  label: string;
  lat: number;
  lng: number;
  bbox: [number, number, number, number] | null;
}

const BASE = "https://nominatim.openstreetmap.org/search";

export async function geocode(query: string): Promise<GeoResult[]> {
  const url = `${BASE}?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "BeaconDev/1.0" },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.map(
    (r: {
      display_name: string;
      lat: string;
      lon: string;
      boundingbox?: string[];
    }) => ({
      label: r.display_name,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      bbox: r.boundingbox
        ? (r.boundingbox.map(Number) as [number, number, number, number])
        : null,
    })
  );
}
