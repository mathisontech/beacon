// @beacon/event-engine
// Server-side event pipeline: ingestion, topics, baselines, state-change, ranking.
// C1 implements the store + poller. Later checkpoints add topics, ranking, etc.

export * from "./store";
export * from "./poll";

export const version = "0.0.1";
