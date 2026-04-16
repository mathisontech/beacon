export interface ReverseGeoResult {
  city: string;
  state: string;
  short: string;
}

const BASE = "https://nominatim.openstreetmap.org/reverse";

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeoResult | null> {
  try {
    const url = `${BASE}?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=10`;
    const res = await fetch(url, {
      headers: { "User-Agent": "BeaconDev/1.0" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const a = data.address || {};
    const city =
      a.city || a.town || a.village || a.hamlet || a.county || "";
    const state = a.state || "";
    const stateCode = a["ISO3166-2-lvl4"]?.split("-")[1] || state;
    const short = city && stateCode ? `${city}, ${stateCode}` : city || state || "Unknown";
    return { city, state, short };
  } catch {
    return null;
  }
}
