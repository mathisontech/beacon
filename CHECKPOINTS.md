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
- `apps/beacon-client` Next.js app scaffolded on port 3100 with a 4-tab shell (Map / Feed / Help / Community), Start Button, Notifications Bell.

### Commits on `beacon-client-v1`

- `C0` — `023cc0e` — monorepo scaffold baseline (pushed to origin).
- `C1` — `6c76edf` — public feed ingestions on thin map (local only — push manually).

### Sandbox gotchas picked up this pass

- `.git/index.lock` comes back after every git write because the sandbox cannot unlink it. Cowork worked around this for C1 by using `GIT_INDEX_FILE=/tmp/beacon-index` for every write and copying the result back onto `.git/index` at the end. If you run a local git command and get "index.lock already exists", `rm -f .git/index.lock` clears it — same fix as the C0 pass.
- Workspace `node_modules` are not installed inside the sandbox (npm registry is 403-blocked). Typechecks ran by pointing `apps/beacon-client/node_modules` at `worldview_oss/node_modules` via a symlink (covered by `.gitignore`). Run `npm install` at repo root on your machine before the first `next dev`.

## Build order (Kristin's plan — pick up here)

### Client-side app

**C1 — Public data feed ingestions on a thin map — DONE (`6c76edf`)**
- `@beacon/data-sources` now ships 7 feeds across all 5 categories, one file each:
  - natural: `usgs-earthquakes` (M2.5+ past day), `nws-alerts`, `nifc-fires` (WFIGS points)
  - human: `gdelt-events` (GDELT geo GeoJSON, protest/attack/shooting query)
  - volcano: `usgs-volcanoes` (HANS elevated list)
  - cameras: `caltrans-d4-cams` (Bay Area CCTV)
  - travel: `opensky-flights` (sampled 300 live aircraft states)
- Every feed conforms to the `Feed` contract (`{ id, name, category, pollIntervalMs, fetch() }`) and returns `FeedEvent[]` with normalized `lat`, `lng`, `severity`, `timestamp`. Errors are caught per-feed so one bad source can't poison the whole view.
- `@beacon/event-engine/store/event-cache.ts` — process-level in-memory cache keyed by feed id, with `lastFetchedAt` and `lastError` per entry.
- `@beacon/event-engine/poll/` — `poll-one`, `poll-all`, `poll-stale`, `should-repoll`. `/api/events` in `beacon-client` calls `pollStale` so repeated client polls don't hammer upstreams.
- `beacon-client` map tab now renders `ThinMap` — no base tiles, plain equirectangular SVG grid with pins sized and colored by severity/category. A footer legend strip shows every registered feed id, its live pin count, and an `err` chip if its last fetch failed. Client refreshes on a 30s interval.
- Checkpoint verify (must run on your machine, sandbox has no network): `npm install && npm run dev:client`, open http://localhost:3100, Map tab. Expect pins for every green feed chip. Any red `err` chip means the upstream rejected or timed out — the feed file and the error are printed in the `/api/events` response for debugging.
- Known gaps to revisit: (a) NWS alerts currently skip zone-only alerts that have no geometry — the previous beacon-dev map resolved zone geometry on demand; that work lives in `apps/beacon-dev/src/lib/nws-alerts.ts` if we want to port it. (b) GDELT's tone-based severity is a rough proxy; revisit once we have a real event taxonomy. (c) The "cameras" slot only has Caltrans D4 as a starter — volcano/fire cams are a backlog item.

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
2. Verify C1 locally: `rm -f .git/index.lock`, `npm install`, `npm run dev:client`, open http://localhost:3100 → Map tab, confirm pins render and the feed-status chips are green (one chip per feed id). Push the branch: `git push origin beacon-client-v1`.
3. Start C2 — user creation + contact management. Architectural decisions still owed (they were the reason Cowork stopped here):
   - Auth: NextAuth with email+password, or magic-link, or defer to a managed provider (Clerk / WorkOS)?
   - User store: Postgres via Prisma, SQLite for dev, or local JSON file until C2 is usable end-to-end?
   - Where does session state live (cookie + DB, JWT, etc)?
   Pick one option, write it in this section, then start building. `@beacon/ui-primitives` is the natural home for shared form/input components once C2 lands.
4. Design reference: `apps/design_system/tokens.ts`.
5. Live-map look reference: `apps/beacon-dev/src/components/map/live-world-map.tsx` + `apps/beacon-dev/src/app/admin/dashboard/live-map/page.tsx`.
