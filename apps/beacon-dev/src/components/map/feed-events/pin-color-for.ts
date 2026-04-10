import type { FeedCategory, FeedSeverity } from "@beacon/data-sources";

const BASE: Record<FeedCategory, string> = {
  natural: "#ef4444",
  human: "#f97316",
  volcano: "#dc2626",
  cameras: "#8b5cf6",
  travel: "#3b82f6",
};

export function pinColorFor(category: FeedCategory, severity: FeedSeverity): string {
  if (severity === "extreme") return "#7f1d1d";
  return BASE[category];
}
