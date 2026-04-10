# Live World Map - Current Bug

## PROBLEM: Globe drifts on open
When the Live World Map loads at `/admin/dashboard/live-map`, the Cesium globe slowly drifts/rotates instead of staying still. Multiple attempts to fix have failed.

## What's been tried (all in `src/lib/cesium-init.ts`)
- `viewer.clock.shouldAnimate = false`
- `viewer.clock.multiplier = 0`
- `viewer.clock.canAnimate = false`
- `ssccc.enableLook = false`
- `ssccc.inertiaSpin = 0` / `inertiaZoom = 0` / `inertiaTranslate = 0`
- `viewer.scene.requestRenderMode = true`
- `viewer.scene.maximumRenderTimeChange = Infinity`
- `viewer.camera.cancelFlight()`

None of these stopped the drift.

## What to investigate next
1. Check if `applyViewStyle()` is the cause — it calls `v.scene.primitives.removeAll()` and `v.scene.requestRender()` which may trigger animation loops
2. Check if the photo view's `Cesium3DTileset.fromIonAssetId(2275207)` triggers continuous camera movement
3. Check if `cesium-globe.tsx` useEffect with `[view]` dependency is re-mounting/re-creating the viewer in a loop
4. Try commenting out `applyViewStyle()` entirely to see if the base viewer drifts on its own
5. Try setting `viewer.scene.globe.enableLighting = false` in all views (lighting can cause perceived drift)
6. Try `viewer.scene.screenSpaceCameraController.enableInputs = true` explicitly
7. Check if Cesium's default imagery provider request cycle is causing render loops that interact with camera

## Key files
- `apps/beacon-dev/src/lib/cesium-init.ts` — viewer creation, camera config, view styles
- `apps/beacon-dev/src/components/map/cesium-globe.tsx` — React component, mounts/destroys viewer
- `apps/beacon-dev/src/components/map/view-switcher.tsx` — switches between Cesium and MapLibre
- `apps/beacon-dev/src/components/map/live-world-map.tsx` — parent component, toolbar, search, panels

## Other context
- Next.js 16.1.2 with Turbopack (NOT webpack)
- Cesium 1.125 loaded via dynamic import, static assets from CDN
- Ion token is hardcoded in cesium-init.ts (Turbopack doesn't inline env vars into dynamic imports)
- Cesium CSS loaded dynamically in cesium-globe.tsx
- Search feature was just added (geocode.ts, map-search.tsx, flyTo in cesium-init.ts)
- The user wants the globe to load showing the continental US and STAY PERFECTLY STILL until the user interacts
