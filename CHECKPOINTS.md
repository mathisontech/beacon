# Beacon build plan

Branch: `beacon-client-v1`. Revert = `git checkout main`.
Style guide: `apps/design_system/tokens.ts`.
Reference for look: current live test account at `apps/beacon-dev/src/app/admin/dashboard/live-map` + `apps/beacon-dev/src/components/map/*`.

## Rules

- Smallest functional piece first. Ship it, verify it, then move on.
- One descriptive file per function. Short files. No icons in console output.
- Every checkpoint is its own commit so any one can be reverted.
- Bottom-up: data and logic before UI chrome. No placeholders left unverified.

## Current state (done — don't redo)

- `beacon-client-v1` branch exists, off `main`.
- Monorepo skeleton at repo root: root `package.json` with npm workspaces on `apps/*` + `packages/*`.
- Stub packages with `package.json` + `src/index.ts` + `README.md`:
  - `@beacon/event-engine`
  - `@beacon/data-sources`
  - `@beacon/base-map`
  - `@beacon/ui-primitives`
  - (`@beacon/design-system` already lives at `apps/design_system`)
- `apps/beacon-client` Next.js app scaffolded on port 3100 with a 4-tab shell (Map / Feed / Help / Community), Start Button, Notifications Bell. Tabs currently render placeholder cards.
- Nothing committed yet on this branch (git index was locked; leave the commit for the next pass).

## Build order (Kristin's plan — pick up here)

### Client-side app

**C1 — Public data feed ingestions on a thin map**
- Build every public feed ingester in `@beacon/data-sources` (natural, human, volcano, cameras, travel).
- Thin map display: no base map tiles, just a coordinate plane / outline where pins render. Lives in the Map tab of `beacon-client`.
- Each feed = one file exporting `{ id, name, category, pollIntervalMs, fetch() }`.
- Server-side cache in `@beacon/event-engine/src/store/`.
- Checkpoint verify: pins appear on the thin map from every live feed.

**C2 — User creation + contact management**
- Signup, login, profile.
- Contacts list, add/remove, request/accept.
- Lives in Community tab + Start Button cockpit.

**C3 — Group management**
- Groups inside user management.
- Create group, invite, roles, leave.
- Group types (family / friends / work / neighborhood / custom).

**C4 — People helping people**
- Requests, resource offers, task queue.
- Lives in Help tab.

**C5 — User reports**
- Sighting report form, verification status, attach photo.
- Feeds into the event store like public feeds do.

### Dev-side + deeper systems

**C6 — Base map builder**
- Real base map: 2D / Satellite / 3D Clay / 3D Google Tiles, layers manager.
- Replaces the thin map from C1.
- Lives in `@beacon/base-map` + Beacon Dev "Base Map Management" tab.

**C7 — Hazard risk models**
- Pre-event probability: risk of something happening that hasn't started.
- Static + dynamic risk layers.

**C8 — Hazard trigger conditions**
- Thresholds and rules that flip a risk into an active event.

**C9 — Hazard model trainer (Beacon Dev)**
- Dev-side surface for training and iterating on surrogate models.
- Dataset browser, training run manager, surrogate evaluator.

**C10 — Event manager**
- Joins related raw events into one cohesive larger event/topic.
- Campi Flegrei as canonical test case (quakes + uplift + gas + alert level → one topic).

**C11 — Personalized hazard alert logic**
- Per-user rules: scope, risk tolerance, mute list, quiet hours, budget.
- Produces the decision "alert this user / don't."

**C12 — Notification manager**
- Unified surface that mixes: user reports, official alerts, Beacon custom alerts, contact + group status updates, requests that require a response.
- Two related-but-distinct siblings:
  - **Event Status Overview manager** — per-event live state for everyone watching it.
  - **Person Location Status manager** — per-person live state for people watching them.

**C13 — Auto sensor manager**
- Ingests from device sensors (phone, wearable, home sensors).
- Feeds the hazard monitors, event manager, and alerts pipeline the same way public feeds and user reports do.

**C14 — Location sharing manager**
- Who sees whose location, when, at what resolution.
- Per-contact + per-group rules, timed shares, emergency override.

**C15 — User settings manager**
- One place for every preference.

**C16 — Legal releases manager**
- TOS, privacy, per-feature consents (location, sensors, notifications, data sharing), revision history, re-consent flow.

## Next action when context is cleared

1. Read this file.
2. Read `apps/design_system/tokens.ts` for styling.
3. Read `apps/beacon-dev/src/components/map/live-world-map.tsx` + `apps/beacon-dev/src/app/admin/dashboard/live-map/page.tsx` for the live test account reference.
4. Start C1 — public data feed ingestions on a thin map. Build `@beacon/data-sources` one file at a time, then the thin map view in `apps/beacon-client/src/tabs/map-tab.tsx`.
