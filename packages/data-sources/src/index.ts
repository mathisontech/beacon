// @beacon/data-sources
// Registry of every public feed ingester used by Beacon.
// One file per source, grouped by category. Every feed conforms to the Feed contract.

export * from "./types";
export { centroidOf } from "./geo/centroid-of";

import { naturalFeeds } from "./natural";
import { humanFeeds } from "./human";
import { volcanoFeeds } from "./volcano";
import { cameraFeeds } from "./cameras";
import { travelFeeds } from "./travel";
import type { Feed } from "./types";

export * from "./natural";
export * from "./human";
export * from "./volcano";
export * from "./cameras";
export * from "./travel";

export const ALL_FEEDS: Feed[] = [
  ...naturalFeeds,
  ...humanFeeds,
  ...volcanoFeeds,
  ...cameraFeeds,
  ...travelFeeds,
];
