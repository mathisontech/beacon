import type { Volcano } from "./types";

// Pulls the worldwide Holocene volcano list from Beacon's own cache
// proxy (see /api/data/volcanoes), which normalizes and caches the
// upstream Smithsonian GVP feed server-side. The browser gets a small
// pre-shaped Volcano[] JSON with long-lived Cache-Control + ETag.
const URL = "/api/data/volcanoes";

export async function fetchGvpHoloceneVolcanoes(
  signal?: AbortSignal
): Promise<Volcano[]> {
  const res = await fetch(URL, { signal });
  if (!res.ok) throw new Error(`volcano cache fetch failed: ${res.status}`);
  return (await res.json()) as Volcano[];
}
