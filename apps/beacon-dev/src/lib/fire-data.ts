import type { ActiveFire } from "@/types/fire";

export async function fetchAllFires(): Promise<ActiveFire[]> {
  const res = await fetch("/api/fires");
  if (!res.ok) {
    console.warn("Fire API responded", res.status);
    return [];
  }
  const data = await res.json();
  if (data.meta?.error) console.warn("Fire API error:", data.meta.error);
  if (data.meta) {
    console.log(
      `Fires: ${data.meta.totalFires} total (${data.meta.perimCount} perimeters, ${data.meta.pointCount} points)`
    );
  }
  return (data.fires || []) as ActiveFire[];
}

export function fireColor(acres: number): string {
  if (acres >= 50000) return "#7f1d1d";
  if (acres >= 10000) return "#dc2626";
  if (acres >= 1000) return "#f97316";
  if (acres >= 100) return "#facc15";
  return "#fb923c";
}

export function formatAcres(a: number): string {
  if (a >= 1000) return `${(a / 1000).toFixed(1)}k`;
  return Math.round(a).toString();
}
