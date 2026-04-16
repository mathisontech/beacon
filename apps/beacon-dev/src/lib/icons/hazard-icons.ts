/** SVG path data for major hazard types (24x24 viewBox). */

export interface HazardType {
  id: string;
  label: string;
  path: string;
  color: string;
  dimColor: string;
}

export const HAZARD_TYPES: HazardType[] = [
  {
    id: "wildfire",
    label: "Wildfire",
    path: "M12 2c1.5 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-4.5 3.5-6.5 5-10zm0 13a2 2 0 0 0 2-2c0-2-2-3.5-2-3.5s-2 1.5-2 3.5a2 2 0 0 0 2 2z",
    color: "#e65100",
    dimColor: "#e6510055",
  },
  {
    id: "flood",
    label: "Flood",
    path: "M2 16c1.5-1.5 3-2 4.5-2s3 .5 4.5 2c1.5-1.5 3-2 4.5-2s3 .5 4.5 2M2 20c1.5-1.5 3-2 4.5-2s3 .5 4.5 2c1.5-1.5 3-2 4.5-2s3 .5 4.5 2M2 12c1.5-1.5 3-2 4.5-2s3 .5 4.5 2c1.5-1.5 3-2 4.5-2s3 .5 4.5 2M8 4l4 4 4-4",
    color: "#1565c0",
    dimColor: "#1565c055",
  },
  {
    id: "earthquake",
    label: "Earthquake",
    path: "M2 12h3l2-4 3 8 3-6 2 4 3-2h4M4 20h16M6 16h12",
    color: "#8d6e63",
    dimColor: "#8d6e6355",
  },
  {
    id: "hurricane",
    label: "Hurricane",
    path: "M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0M12 2a10 10 0 0 1 7 3M12 22a10 10 0 0 1-7-3M2 12a10 10 0 0 1 3-7M22 12a10 10 0 0 1-3 7",
    color: "#7b1fa2",
    dimColor: "#7b1fa255",
  },
  {
    id: "tornado",
    label: "Tornado",
    path: "M6 4h12M8 8h10M7 12h8M9 16h6M11 20h2",
    color: "#546e7a",
    dimColor: "#546e7a55",
  },
  {
    id: "volcano",
    label: "Volcano",
    path: "M4 22l5-11 3 3 3-3 5 11H4zM10 6l2-4 2 4M8 3h1M15 3h1M12 6v2",
    color: "#d32f2f",
    dimColor: "#d32f2f55",
  },
  {
    id: "tsunami",
    label: "Tsunami",
    path: "M2 18c2-4 4-6 7-6 2 0 3 2 5 2s4-3 8-3M2 12c2-4 4-6 7-6 2 0 3 2 5 2s4-3 8-3M12 3v3",
    color: "#0277bd",
    dimColor: "#0277bd55",
  },
  {
    id: "winter_storm",
    label: "Winter Storm",
    path: "M12 2v20M4 12h16M7 5l10 14M17 5L7 19M2 9l5 3-5 3M22 9l-5 3 5 3",
    color: "#4fc3f7",
    dimColor: "#4fc3f755",
  },
  {
    id: "extreme_heat",
    label: "Extreme Heat",
    path: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z",
    color: "#ff6f00",
    dimColor: "#ff6f0055",
  },
  {
    id: "air_quality",
    label: "Air Quality",
    path: "M8 16a4 4 0 0 1 0-8h8a4 4 0 0 1 0 8M6 8a3 3 0 0 1 0-6h6a3 3 0 0 1 0 6M10 22a3 3 0 0 1 0-6h6a3 3 0 0 1 0 6",
    color: "#78909c",
    dimColor: "#78909c55",
  },
  {
    id: "hazmat",
    label: "Hazmat",
    path: "M12 2l9 18H3L12 2zm0 6v5m0 2v1",
    color: "#f9a825",
    dimColor: "#f9a82555",
  },
  {
    id: "power_grid",
    label: "Power Grid",
    path: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    color: "#fdd835",
    dimColor: "#fdd83555",
  },
];
