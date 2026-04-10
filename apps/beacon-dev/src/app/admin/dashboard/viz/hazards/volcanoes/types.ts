export type AlertLevel =
  | "warning"
  | "watch"
  | "advisory"
  | "normal"
  | "unknown";

export interface Volcano {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  level: AlertLevel;
  elevation_m: number;
  last_eruption: string;
  obs: string;
}

export interface LevelMeta {
  id: AlertLevel;
  label: string;
  blurb: string;
}
