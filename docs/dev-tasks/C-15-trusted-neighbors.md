# C-15: Trusted Neighbor System
Priority: P1
Depends on: C-02, C-09
Estimated complexity: medium

## What to build
Request/accept flow for neighborhood-level trust. Requires ID verified users. Building-level matching by address. Display pending requests and accept/decline buttons. Track mutual trust relationships.

## Files to create/modify
- app/community/contacts/neighbors/page.tsx
- lib/neighbors/sendRequest.ts
- lib/neighbors/respondRequest.ts
- lib/neighbors/findNearby.ts
- app/api/contacts/neighbors/route.ts
- database migration (trusted_neighbors table)

## Inputs
- Trust request from another user (address-based matching)
- Accept/decline response

## Outputs
- trusted_neighbors table: user_id, neighbor_id, building_id, status, requested_at, accepted_at
- Mutual connections tracked
- Used for group discovery (neighbors group)

## UI Components
- PendingRequestList (show incoming requests)
- AcceptDeclineButtons
- TrustedNeighborList (show confirmed neighbors)
- FindNearbyButton (trigger building matching)

## Acceptance criteria
- Requires both users ID verified
- Address matching within same building
- Requests expire after 30 days
- Can decline without notification
- Mutual trust logged as connected
- Can revoke trust anytime

## Run this AFTER
C-02, C-09 complete

## Can run IN PARALLEL with
C-13, C-14, C-16

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. POST /api/trusted-neighbors/request creates pending request
3. PUT /api/trusted-neighbors/[id]/accept changes status
4. Only ID-verified users can be trusted neighbors
