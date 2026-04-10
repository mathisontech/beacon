// Shared types for every feed ingester in @beacon/data-sources.
// Every feed file exports a Feed object. Every fetch() returns FeedEvent[].

export type FeedCategory =
  | "natural"
  | "human"
  | "volcano"
  | "cameras"
  | "travel";

export type FeedSeverity =
  | "info"
  | "minor"
  | "moderate"
  | "severe"
  | "extreme";

export interface FeedEvent {
  id: string;              // globally unique across feeds: `${feedId}:${sourceId}`
  feedId: string;          // which feed produced this event
  category: FeedCategory;
  lat: number;
  lng: number;
  title: string;
  severity: FeedSeverity;
  timestamp: string;       // ISO-8601
  url?: string;
  meta?: Record<string, unknown>;
}

export interface Feed {
  id: string;              // stable slug, e.g. "usgs-earthquakes"
  name: string;            // human label for UI / logs
  category: FeedCategory;
  pollIntervalMs: number;  // hint to the poller; not enforced inside fetch()
  fetch: () => Promise<FeedEvent[]>;
}
