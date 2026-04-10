// Equirectangular projection — lng/lat → (x, y) inside a given pixel box.
// Thin map only. Base-map builder replaces this in C6.

export interface Box {
  width: number;
  height: number;
}

export function projectLonLat(
  lat: number,
  lng: number,
  box: Box,
): { x: number; y: number } {
  const x = ((lng + 180) / 360) * box.width;
  const y = ((90 - lat) / 180) * box.height;
  return { x, y };
}
