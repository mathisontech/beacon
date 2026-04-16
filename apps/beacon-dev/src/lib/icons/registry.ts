import type { BuiltinIconId, IconCategory } from "./types";

/** SVG path data for each built-in icon (24x24 viewBox). */
export const BUILTIN_PATHS: Record<BuiltinIconId, string> = {
  home: "M3 12l9-8 9 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8z M9 22V12h6v10",
  office:
    "M3 21V5a2 2 0 0 1 2-2h6v20H3zm8-18h6a2 2 0 0 1 2 2v16h-8V3zm2 3h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zm-6-8h2v2H7zm0 4h2v2H7zm0 4h2v2H7z",
  school:
    "M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 13.18L4 11.35V16l8 4 8-4v-4.65l-8 4.83z",
  hospital: "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm8 3v3H8v2h3v3h2v-3h3v-2h-3V8h-2z",
  church: "M12 2v4m-3 0h6m-3 0v4m-5 4l5-4 5 4v8H7v-8zm2 4v4h6v-4",
  gym: "M2 12h2m16 0h2M6 8v8m12-8v8M6 12h12M4 10v4m16-4v4",
  store: "M3 9l1.5-6h15L21 9m-18 0v11h18V9m-18 0h18M9 9v6h6V9",
  restaurant: "M5 3v18m6-18v6a3 3 0 0 1-6 0V3m10 0v7a4 4 0 0 0 4 4h-4v7",
  park: "M12 2l4 8H8l4-8zm0 6l4 8H8l4-8zm-2 8h4v6h-4v-6z",
  airport:
    "M12 2L8 8h3v5l-7 4v2l7-2v3l-2 1v1l3-1 3 1v-1l-2-1v-3l7 2v-2l-7-4V8h3L12 2z",
  hotel: "M3 21V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14M3 11h18M7 11V7m10 4V7m-8 6a2 2 0 1 0 0 4h6a2 2 0 1 0 0-4",
  warehouse: "M3 21V9l9-6 9 6v12H3zm4-8h10m-10 4h10",
  pin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z",
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z",
  flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v22",
  shelter:
    "M3 21h18M5 21V11l7-6 7 6v10M9 21v-6h6v6M3 11l9-8 9 8",
  "fire-station":
    "M12 2c1 3 4 5 4 9a4 4 0 1 1-8 0c0-4 3-6 4-9zm0 13a1.5 1.5 0 0 0 1.5-1.5c0-1.5-1.5-2.5-1.5-2.5s-1.5 1-1.5 2.5A1.5 1.5 0 0 0 12 15zM4 21h16",
  police:
    "M12 2l8 4v5c0 5.5-3.5 10-8 11.5C7.5 21.5 4 17 4 11.5V6l8-4zm-1 8h2v5h-2zm0-3h2v2h-2z",
  family:
    "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6-1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 21v-2c0-2.2 2.7-4 6-4s6 1.8 6 4v2m3-3v3m0-3c1.7-.3 3-1.7 3-3.5S19.7 11 18 11",
};

/** Grouped categories for the icon picker UI. */
export const ICON_CATEGORIES: IconCategory[] = [
  { label: "Places", ids: ["home", "office", "school", "church", "park"] },
  { label: "Services", ids: ["hospital", "store", "restaurant", "gym", "hotel"] },
  { label: "Emergency", ids: ["shelter", "fire-station", "police", "warehouse"] },
  { label: "Travel", ids: ["airport", "pin", "flag"] },
  { label: "Personal", ids: ["star", "heart", "family"] },
];

/** Human-readable labels for built-in icons. */
export const ICON_LABELS: Record<BuiltinIconId, string> = {
  home: "Home",
  office: "Office",
  school: "School",
  hospital: "Hospital",
  church: "Church",
  gym: "Gym",
  store: "Store",
  restaurant: "Restaurant",
  park: "Park",
  airport: "Airport",
  hotel: "Hotel",
  warehouse: "Warehouse",
  pin: "Pin",
  star: "Star",
  heart: "Heart",
  flag: "Flag",
  shelter: "Shelter",
  "fire-station": "Fire Station",
  police: "Police",
  family: "Family",
};
