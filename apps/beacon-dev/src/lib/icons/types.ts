/** Central icon type system shared across map markers, saved locations, etc. */

export type IconSource =
  | { kind: "builtin"; id: BuiltinIconId }
  | { kind: "custom"; url: string };

export type BuiltinIconId =
  | "home"
  | "office"
  | "school"
  | "hospital"
  | "church"
  | "gym"
  | "store"
  | "restaurant"
  | "park"
  | "airport"
  | "hotel"
  | "warehouse"
  | "pin"
  | "star"
  | "heart"
  | "flag"
  | "shelter"
  | "fire-station"
  | "police"
  | "family";

export interface IconEntry {
  source: IconSource;
  label: string;
  subscript?: number;
}

export interface IconCategory {
  label: string;
  ids: BuiltinIconId[];
}
