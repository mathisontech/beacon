import type { LevelMeta } from "./types";

export const LEVELS: LevelMeta[] = [
  { id: "warning",  label: "Warning",  blurb: "Hazardous eruption imminent or underway" },
  { id: "watch",    label: "Watch",    blurb: "Heightened / escalating unrest" },
  { id: "advisory", label: "Advisory", blurb: "Elevated unrest above background" },
  { id: "normal",   label: "Normal",   blurb: "Typical background activity" },
  { id: "unknown",  label: "Unknown",  blurb: "Not assigned" },
];
