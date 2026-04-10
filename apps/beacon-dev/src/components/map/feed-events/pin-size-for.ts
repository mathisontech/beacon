import type { FeedSeverity } from "@beacon/data-sources";

const SIZES: Record<FeedSeverity, number> = {
  info: 6,
  minor: 8,
  moderate: 10,
  severe: 12,
  extreme: 14,
};

export function pinSizeFor(severity: FeedSeverity): number {
  return SIZES[severity];
}
