# @beacon/event-engine

Server-side event pipeline.

## Scope

- `src/ingestion/` — workers that pull from the data sources registry
- `src/store/` — normalized event store (write + query)
- `src/baseline/` — per-cell historical stats for anomaly scoring
- `src/topics/` — topic manager (Campi Flegrei, etc.) + anomaly trend fusion
- `src/state-change/` — detects alert-level changes, cone shifts, IPC escalations
- `src/ranker/` — interest ranker (v1 hand-crafted, v3 ML)

Every subfolder should expose one function per file with a descriptive name.
