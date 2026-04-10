// Rough centroid of any GeoJSON geometry. Good enough for a thin map pin.
// Not area-weighted — just averages whatever coordinates are present.

type Coord = [number, number];

function collect(geom: unknown): Coord[] {
  if (!geom || typeof geom !== "object") return [];
  const g = geom as { type?: string; coordinates?: unknown };
  switch (g.type) {
    case "Point":
      return [g.coordinates as Coord];
    case "MultiPoint":
    case "LineString":
      return (g.coordinates as Coord[]) ?? [];
    case "MultiLineString":
      return ((g.coordinates as Coord[][]) ?? []).flat();
    case "Polygon":
      return ((g.coordinates as Coord[][]) ?? []).flat();
    case "MultiPolygon":
      return ((g.coordinates as Coord[][][]) ?? []).flat(2);
    default:
      return [];
  }
}

export function centroidOf(geometry: unknown): [number, number] | null {
  const coords = collect(geometry);
  if (coords.length === 0) return null;
  let lng = 0;
  let lat = 0;
  for (const c of coords) {
    lng += c[0];
    lat += c[1];
  }
  return [lat / coords.length, lng / coords.length];
}
