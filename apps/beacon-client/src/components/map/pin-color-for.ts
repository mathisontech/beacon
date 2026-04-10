// Map category + severity → pin color.
// Colors chosen from the design tokens (status palette).

import type { FeedCategory, FeedSeverity } from "@beacon/data-sources";

const CATEGORY_BASE: Record<FeedCategory, string> = {
  natural: "#ef4444",
  human: "#f97316",
  volcano: "#dc2626",
  cameras: "#8b5cf6",
  travel: "#3b82f6",
};

export function pinColorFor(
  category: FeedCategory,
  severity: FeedSeverity,
): string {
  if (severity === "extreme") return "#7f1d1d";
  if (severity === "severe") return CATEGORY_BASE[category];
  if (severity === "moderate") return CATEGORY_BASE[category];
  if (severity === "minor") return "#f59e0b";
  return CATEGORY_BASE[category];
}

export function pinRadiusFor(severity: FeedSeverity): number {
  switch (severity) {
    case "extreme":
      return 5;
    case "severe":
      return 4;
    case "moderate":
      return 3.5;
    case "minor":
      return 3;
    default:
      return 2.5;
  }
}
