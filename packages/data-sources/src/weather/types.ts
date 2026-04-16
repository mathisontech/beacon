// Shared types for weather data sources.
// These are separate from the generic FeedEvent contract because weather
// overlays need richer geometry (tracks, cones, forecast positions)
// and time-varying samples.

export interface HurricaneForecastPoint {
  /** ISO-8601 timestamp for this forecast position */
  time: string;
  lat: number;
  lng: number;
  /** Maximum sustained wind speed (kt) */
  maxWindKt?: number;
  /** Minimum central pressure (mb) */
  minPressureMb?: number;
  /** Saffir-Simpson category 0-5, 0 = tropical storm/depression */
  category?: number;
}

export interface HurricaneStorm {
  id: string;                       // e.g. "AL052025"
  name: string;                     // e.g. "LEE"
  basin: "AL" | "EP" | "CP" | "WP" | "IO" | "SH";
  classification: string;           // "TD", "TS", "HU", "MH", etc
  currentLat: number;
  currentLng: number;
  currentWindKt?: number;
  currentPressureMb?: number;
  movement?: string;                // e.g. "NW at 12 kt"
  advisoryTime: string;             // ISO-8601
  /** Forecast positions, T+0 through typically T+120h */
  forecastTrack: HurricaneForecastPoint[];
  /** Best-track (observed path) points, earliest → now */
  bestTrack?: HurricaneForecastPoint[];
  /** Forecast cone as GeoJSON polygon, if published */
  cone?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

export interface WeatherSample {
  lat: number;
  lng: number;
  time: string;
  temperatureC?: number;
  windSpeedMs?: number;
  windDirectionDeg?: number;
  precipitationMmH?: number;
  cloudCoverPct?: number;
  pressureMb?: number;
  humidityPct?: number;
}
