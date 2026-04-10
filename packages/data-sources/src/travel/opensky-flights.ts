// OpenSky Network — live aircraft positions worldwide. Public, no auth.
// https://opensky-network.org/api/states/all
// Unauthenticated access is rate-limited; we cap the returned sample.

import type { Feed, FeedEvent } from "../types";

const URL = "https://opensky-network.org/api/states/all";
const FEED_ID = "opensky-flights";
const MAX_STATES = 300;

type OpenSkyState = [
  string,          // 0  icao24
  string | null,   // 1  callsign
  string,          // 2  origin_country
  number | null,   // 3  time_position
  number,          // 4  last_contact
  number | null,   // 5  longitude
  number | null,   // 6  latitude
  number | null,   // 7  baro_altitude
  boolean,         // 8  on_ground
  number | null,   // 9  velocity
  number | null,   // 10 true_track
  number | null,   // 11 vertical_rate
  number[] | null, // 12 sensors
  number | null,   // 13 geo_altitude
  string | null,   // 14 squawk
  boolean,         // 15 spi
  number,          // 16 position_source
];

async function fetchFlights(): Promise<FeedEvent[]> {
  const res = await fetch(URL, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`OpenSky ${res.status}`);
  const data = (await res.json()) as { time: number; states?: OpenSkyState[] };
  const states = data.states ?? [];
  const out: FeedEvent[] = [];
  // Sample evenly across the array so the pin distribution looks global.
  const step = Math.max(1, Math.floor(states.length / MAX_STATES));
  for (let i = 0; i < states.length && out.length < MAX_STATES; i += step) {
    const s = states[i];
    const lng = s[5];
    const lat = s[6];
    if (lat == null || lng == null) continue;
    const callsign = (s[1] ?? "").trim() || s[0];
    out.push({
      id: `${FEED_ID}:${s[0]}`,
      feedId: FEED_ID,
      category: "travel",
      lat,
      lng,
      title: `${callsign} — ${s[2]}`,
      severity: "info",
      timestamp: new Date((s[4] ?? data.time) * 1000).toISOString(),
      meta: {
        altitudeM: s[7],
        velocityMs: s[9],
        onGround: s[8],
        track: s[10],
      },
    });
  }
  return out;
}

export const openskyFlights: Feed = {
  id: FEED_ID,
  name: "OpenSky Live Flights (sampled)",
  category: "travel",
  pollIntervalMs: 2 * 60_000,
  fetch: fetchFlights,
};
