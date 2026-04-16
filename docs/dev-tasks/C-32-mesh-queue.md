# C-32: Mesh Message Queue
Priority: P2
Depends on: C-27
Estimated complexity: high

## What to build
Offline message queue for mesh networking. Messages queued locally when offline. Synced when online via mesh relay. Conflict resolution using deterministic ordering (timestamp + sender ID). Retry logic with exponential backoff.

## Files to create/modify
- lib/mesh/queueMessage.ts
- lib/mesh/syncQueue.ts
- lib/mesh/conflictResolution.ts
- lib/mesh/retryLogic.ts
- app/api/mesh/sync/route.ts
- database migration (mesh_queue table)

## Inputs
- Message to send (when offline)
- Current connection status

## Outputs
- mesh_queue record: message_id, relay_status, hops, delivered_at
- Messages synced on reconnect
- Conflict-free message ordering

## UI Components
- QueueStatus (show queued message count)
- SyncProgress (upload progress indicator)
- OfflineIndicator (show when offline)
- RetryIndicator (retry count display)

## Acceptance criteria
- Messages queued locally when offline
- Automatic sync on reconnect
- Deterministic conflict resolution
- Retry logic with exponential backoff (max 10 retries)
- Messages don't duplicate on sync
- Works with encrypted messages (C-27)
- Performance: queue operations < 10ms

## Run this AFTER
C-27 complete

## Can run IN PARALLEL with
C-28, C-29, C-30, C-31, C-33, C-34

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. Messages queued when offline flag set
3. Queue drains when online flag restored
4. Queue persists across component remounts
