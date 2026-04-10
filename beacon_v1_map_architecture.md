# Beacon V1 Map Architecture

Adapted from WorldView's approach for Beacon's three map views, Beacon's 70+ data layers, and Beacon's requirements for explosive-traffic resilience and future modeling readiness.

---

## The Three Map Views

### View 1: Low-Data 2D
- Minimal bandwidth consumption
- Works on degraded infrastructure (3G, satellite, congested cell)
- Vector tile base map (Mapbox/MapLibre GL JS or Leaflet with protobuf tiles)
- No 3D rendering, no photorealistic textures
- Alert polygons, warning cones, gauge markers, point icons only
- Target: <500KB initial load, <50KB per data update
- Color-coded severity (red/orange/yellow) on white/light gray base
- This is the view that works when infrastructure is damaged

### View 2: 3D Gray Clay
- CesiumJS with Cesium World Terrain (elevation mesh, no imagery)
- Gray monochrome surface showing pure topography
- Contour/altitude lines rendered as Cesium polylines from DEM data
- Stripped of visual noise — no satellite imagery, no building textures
- Data layers rendered as colored overlays on gray terrain
- Purpose: clarity during critical situations — see the terrain relationship to hazards without distraction
- Shows the map WE built — aggregated elevation + hydrology + fault lines + hazard zones on clean geometry
- This is the "analytical" view — Palantir's aesthetic

### View 3: 3D Photorealistic
- CesiumJS + Google Photorealistic 3D Tiles (same as WorldView)
- Full satellite imagery, 3D building models in metro areas
- Interactive exploration — fly around, zoom into neighborhoods
- This is the engagement/marketing view — draws users in
- Most bandwidth-heavy, least useful in emergencies but most useful for preparedness

---

## Tech Stack (Adapted from WorldView)

### Frontend
- **Next.js** (React, TypeScript, app router)
- **CesiumJS** — 3D globe for Views 2 and 3
- **MapLibre GL JS** — 2D map for View 1 (open-source Mapbox fork, no token required)
- **Tailwind CSS** — styling
- View switcher component toggles between renderers

### Backend
- **Node.js** API layer for proxying + caching external data sources
- **WebSocket server** for real-time push (alerts, earthquakes, stream gauges)
- **Redis** for caching layer (WorldView used in-memory; Beacon needs shared cache for horizontal scaling)
- **PostgreSQL + PostGIS** for persistent storage of all ingested data (modeling readiness)
- **TimescaleDB extension** for time-series sensor data (stream gauges, AQI, wind)

### Data Pipeline (Modeling Readiness)
- Every API response is stored raw in PostGIS before serving to clients
- Schema: source, timestamp, geometry, raw_payload, processed_fields
- This is the "collect everything for future modeling" requirement
- No data transformation that loses source fidelity
- Partitioned by source + time for query performance

### Infrastructure (Explosive Traffic)
- **CDN edge caching** for static/slow-update layers (FEMA flood zones, LANDFIRE, building footprints)
- **Tile pre-rendering** for base map layers — serve as PMTiles or MBTiles from CDN
- **WebSocket fan-out** via Redis pub/sub — multiple backend instances share real-time connections
- **Auto-scaling backend** behind load balancer
- **Graceful degradation** — when backend is overloaded, clients fall back to cached data with stale timestamps displayed prominently
- **Static tile fallback** — if real-time API fails, serve last-known-good cached tiles

---

## Layer Implementation Per View

Each of Beacon's 70 data layers maps to one or more rendering approaches depending on the active view.

### Universal Alert Layer (NWS CAP)
| View | Rendering |
|---|---|
| 2D Low-Data | GeoJSON polygons with fill opacity + border, colored by severity |
| 3D Clay | Same polygons draped on terrain mesh |
| 3D Photo | Same polygons draped on 3D tiles |

- **Source:** api.weather.gov (poll every 45 sec)
- **Backend:** Poll, cache in Redis (TTL 30s), push new alerts via WebSocket
- **Storage:** Every alert stored in PostGIS with geometry + all metadata
- **This is the single most important integration — covers all NWS hazard types**

### Earthquake Feed (USGS)
| View | Rendering |
|---|---|
| 2D Low-Data | Circle markers, radius = magnitude, color = recency |
| 3D Clay | Pulsing spheres on terrain, depth visualized as translucent column below surface |
| 3D Photo | Same as clay but with photorealistic context |

- **Source:** earthquake.usgs.gov GeoJSON (poll every 30 sec)
- **ShakeMap overlay:** Fetched as GeoTIFF, converted to image tiles for 2D, draped on terrain for 3D
- **Dead reckoning:** Not needed (earthquakes don't move)

### Fire Hotspots (NASA FIRMS/VIIRS)
| View | Rendering |
|---|---|
| 2D Low-Data | Red point markers with confidence-based opacity |
| 3D Clay | Red billboards on terrain, optional heat shimmer shader |
| 3D Photo | Same billboards with fire icon |

- **Source:** NASA FIRMS API (poll every 30 min, data updates every ~3 hours)
- **Combine with WFIGS perimeters:** Polygon overlay for active fire boundaries

### Fire Perimeters (WFIGS)
| View | Rendering |
|---|---|
| 2D Low-Data | Red polygon outlines with semi-transparent fill |
| 3D Clay | Draped polygons on terrain — shows fire boundary relative to ridgelines/valleys |
| 3D Photo | Same polygons on photorealistic — see specific neighborhoods/structures |

- **Source:** data-nifc.hub.arcgis.com ArcGIS REST (poll every 15 min during active fires)

### Stream Gauges (USGS, 12K+ stations)
| View | Rendering |
|---|---|
| 2D Low-Data | Colored dots (green/yellow/orange/red for normal/action/flood/major) |
| 3D Clay | Same dots + optional vertical bar showing current level vs flood stage |
| 3D Photo | Same as clay |

- **Source:** api.waterdata.usgs.gov (poll every 15 min)
- **High value:** Upstream gauge at major flood stage = actionable lead time
- **Storage:** Time-series in TimescaleDB for future hydrological modeling

### NEXRAD Radar Composite
| View | Rendering |
|---|---|
| 2D Low-Data | WMS/TMS raster tiles overlay (Iowa Environmental Mesonet) |
| 3D Clay | CesiumJS ImageryLayer draped on terrain |
| 3D Photo | Same imagery layer |

- **Source:** IEM XYZ/TMS tiles (poll every 5 min)
- **Cache aggressively** — radar tiles are the heaviest bandwidth consumer

### MRMS Products (Rotation Tracks, Hail, QPE, Precip Type)
| View | Rendering |
|---|---|
| 2D Low-Data | Raster overlay tiles with transparency |
| 3D Clay | ImageryLayer on terrain |
| 3D Photo | Same |

- **Source:** NOAA MRMS via AWS NODD / IEM (2 min update cycle)
- **MRMS rotation tracks are the tornado detection layer** — highest urgency

### FEMA Flood Zones (NFHL)
| View | Rendering |
|---|---|
| 2D Low-Data | Pre-rendered vector tiles (blue shading by zone type) |
| 3D Clay | Draped polygons — flood zones visible against terrain elevation |
| 3D Photo | Same — see which buildings are in flood zones |

- **Source:** FEMA NFHL ArcGIS REST
- **Update:** Static (changes only with FIRM updates) — serve from CDN as PMTiles
- **This is a base map layer — always visible, cached at edge**

### Hurricane Track + Ensemble Spaghetti
| View | Rendering |
|---|---|
| 2D Low-Data | Official cone polygon + track line + wind radii circles |
| 3D Clay | Same elements draped on terrain + 3D wind field visualization |
| 3D Photo | Cone draped over photorealistic coastline — shows surge relative to buildings |

- **Sources:** NHC GIS (official), NOAA NOMADS (GEFS 31-member), ECMWF Open Data (51-member, 6hr delay), Environment Canada (21-member)
- **Combined spaghetti:** 103+ ensemble tracks rendered as polylines with varying opacity
- **Update:** Every 6 hours (every 3 during landfall)

### Smoke/AQI
| View | Rendering |
|---|---|
| 2D Low-Data | Colored contour polygons (green through maroon AQI scale) |
| 3D Clay | Semi-transparent volumetric layer showing smoke plume extent |
| 3D Photo | Same volumetric overlay |

- **Sources:** AirNow API (hourly), HRRR-Smoke via NOAA NOMADS (hourly)

### Base Risk Layers (LANDFIRE, Seismic Hazard, Vs30, WHP, etc.)
| View | Rendering |
|---|---|
| 2D Low-Data | Pre-rendered raster tiles from CDN |
| 3D Clay | ImageryLayer on terrain |
| 3D Photo | Same |

- **All static/annual update** — pre-process into tile pyramids, serve from CDN
- **No real-time backend load** — these are pure CDN serves

### Vulnerable Population Layers (emPOWER, SVI)
| View | Rendering |
|---|---|
| 2D Low-Data | Choropleth (ZIP or census tract level, color intensity = vulnerability) |
| 3D Clay | Same choropleth draped |
| 3D Photo | Same |

- **Sources:** HHS emPOWER REST (monthly), CDC SVI (biennial)
- **Pre-process to vector tiles** — serve from CDN

---

## Rendering Performance Strategy (Adapted from WorldView)

### From WorldView (Keep)
- **Imperative Cesium primitives** (BillboardCollection, PointPrimitiveCollection, PolylineCollection) instead of Entity API for any layer with >100 items
- **Dead reckoning** for any moving data (flights if added, ship AIS if added)
- **WebSocket push** for real-time layers instead of client-side polling

### Beacon Additions
- **View-dependent loading** — only load 3D assets when in 3D view; 2D view uses MapLibre with GeoJSON/vector tiles (much lighter)
- **Progressive data loading** — on 2D Low-Data view, only load layers within viewport + buffer zone
- **Bandwidth budget** — 2D view enforces hard ceiling on tile requests per second
- **Offline tile cache** — service worker caches base map tiles for the user's saved locations; works when connectivity degrades
- **Stale data indicators** — every data layer displays last-updated timestamp prominently; if data is >2x expected update interval, show warning

---

## Data Pipeline Architecture (Modeling Readiness)

```
External APIs
  ├─ NWS CAP ──────┐
  ├─ USGS Earthquake┤
  ├─ FIRMS ─────────┤
  ├─ USGS Gauges ───┤    ┌──────────────┐     ┌─────────────────┐
  ├─ MRMS ──────────┼───→│  Ingestion    │────→│  PostgreSQL +   │
  ├─ NHC GIS ───────┤    │  Workers      │     │  PostGIS +      │
  ├─ AirNow ────────┤    │  (Node.js)    │     │  TimescaleDB    │
  ├─ AISStream ─────┤    └──────┬───────┘     └────────┬────────┘
  └─ ... 60+ more ──┘           │                      │
                                │                      │
                         ┌──────▼───────┐     ┌────────▼────────┐
                         │  Redis Cache  │     │  Tile Server    │
                         │  (hot data)   │     │  (PMTiles/CDN)  │
                         └──────┬───────┘     └─────────────────┘
                                │
                         ┌──────▼───────┐
                         │  WebSocket   │
                         │  Fan-out     │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │  Clients     │
                         │  (2D/3D)     │
                         └──────────────┘
```

### Key Principle: Store Everything Raw

Every API response hits PostgreSQL with full payload before any transformation. Schema:

```sql
CREATE TABLE raw_observations (
  id            BIGSERIAL PRIMARY KEY,
  source        TEXT NOT NULL,        -- 'nws_cap', 'usgs_eq', 'firms', etc.
  fetched_at    TIMESTAMPTZ NOT NULL,
  source_time   TIMESTAMPTZ,         -- timestamp from the source itself
  geometry      GEOMETRY,            -- PostGIS geometry
  raw_payload   JSONB NOT NULL,      -- complete API response
  processed     JSONB                -- extracted/normalized fields
);

-- TimescaleDB hypertable for time-series sensor data
CREATE TABLE sensor_readings (
  time          TIMESTAMPTZ NOT NULL,
  source        TEXT NOT NULL,
  station_id    TEXT NOT NULL,
  geometry      GEOMETRY,
  readings      JSONB NOT NULL
);
SELECT create_hypertable('sensor_readings', 'time');
```

This gives future modeling pipelines access to complete historical data from day one without reingestion.

---

## Explosive Traffic Handling

### The Problem
During a disaster, traffic to Beacon spikes 100-1000x in a concentrated geographic area, potentially while infrastructure in that area is degraded.

### Strategy

**Layer 1: CDN Edge (handles 90% of load)**
- All base map layers pre-rendered as PMTiles on CDN (Cloudflare R2 / S3 + CloudFront)
- Static risk layers, flood zones, building footprints — never hit origin
- Alert polygon GeoJSON cached at edge with 30-second TTL

**Layer 2: WebSocket Fan-out (handles real-time)**
- Redis pub/sub distributes updates across horizontally scaled WebSocket servers
- Each WebSocket server handles ~10K connections
- Auto-scale WebSocket fleet based on connection count

**Layer 3: Graceful Degradation**
- If origin servers are overloaded, CDN serves stale-while-revalidate
- Client shows prominent "Data as of [timestamp]" on every layer
- 2D Low-Data view served entirely from CDN + service worker cache — zero origin dependency
- If WebSocket connection drops, client falls back to polling with exponential backoff

**Layer 4: Geographic Sharding**
- Partition real-time data processing by NWS forecast zone
- During Hurricane landfall in Florida, only Florida-region ingestion workers scale up
- Other regions continue on baseline capacity

---

## Build Sequence (V1 MVP) — Phased with Checkpoints

Each phase ends with a checkpoint where you review a working, visible result before approving the next phase. Nothing proceeds until the checkpoint passes. This is critical because Sidhu had 6 years of Google 3D Tiles expertise to debug rendering, caching, and performance issues by instinct. Without that, you need isolation — if something breaks, you know exactly which phase introduced it.

---

### PHASE 1: Empty Globe
**Goal:** Three map views rendering with no data. Prove the rendering foundation works.

**Build:**
1. Next.js project scaffold
2. CesiumJS viewer component (3D engine)
3. MapLibre GL JS viewer component (2D engine)
4. View switcher UI — three buttons: 2D / 3D Clay / 3D Photo
5. 3D Photorealistic: Google Photorealistic 3D Tiles via Cesium Ion token
6. 3D Clay: Cesium World Terrain (elevation mesh) with gray monochrome style, no satellite imagery
7. 2D Low-Data: MapLibre with OpenStreetMap vector tiles

**CHECKPOINT 1 — Review before proceeding:**
- [ ] Can you switch between all three views?
- [ ] Does the 3D Photo view show photorealistic buildings when you zoom into a city?
- [ ] Does the 3D Clay view show gray terrain with visible elevation (mountains, valleys)?
- [ ] Does the 2D view load fast and show a clean, simple map?
- [ ] Does the globe/map center on a location you specify (e.g., your address)?
- [ ] Does camera/pan/zoom feel responsive in all three views?

---

### PHASE 2: One Data Layer (NWS Alerts)
**Goal:** Prove the full data pipeline end-to-end with the single most important integration.

**Build:**
1. Node.js backend API server
2. Single ingestion worker: polls api.weather.gov every 45 seconds
3. PostgreSQL + PostGIS database with raw_observations table
4. Every NWS CAP alert stored with full payload + geometry
5. Redis cache: latest alerts cached with 30-second TTL
6. REST endpoint: GET /api/alerts?lat=X&lon=Y returns nearby alerts
7. Frontend: render alert polygons on all three map views
8. Color-code by severity (red = warning, orange = watch, yellow = advisory)
9. Click an alert polygon to see: headline, description, severity, urgency, onset time, expires time
10. Display "Last updated: [timestamp]" on the alert layer

**CHECKPOINT 2 — Review before proceeding:**
- [ ] Do NWS alerts appear as colored polygons on all three map views?
- [ ] When you click a polygon, do you see the full alert details?
- [ ] Does the timestamp update every ~45 seconds?
- [ ] If you look at api.weather.gov directly, do the same alerts appear in Beacon?
- [ ] Is data being stored in PostgreSQL? (Run a simple query to confirm rows are accumulating)
- [ ] Do the alert polygons look correct on 3D Clay? (Draped on terrain, not floating)
- [ ] Does the 2D view show alerts with minimal bandwidth?
- [ ] Does the color coding make sense at a glance?

---

### PHASE 3: Real-Time Push + Second Data Source
**Goal:** Add WebSocket push (so alerts appear instantly instead of on page refresh) and prove the system works with multiple data sources simultaneously.

**Build:**
1. WebSocket server on backend
2. When ingestion worker detects new/changed alert, push to all connected clients via WebSocket
3. Frontend WebSocket client: alerts update in real time without page refresh
4. Add USGS Earthquake feed (second data source)
5. Earthquake ingestion worker: polls earthquake.usgs.gov every 30 seconds
6. Earthquake rendering: circle markers sized by magnitude, colored by recency
7. Click earthquake marker: magnitude, depth, location, time, distance from your location
8. Earthquake data stored in PostgreSQL alongside alerts
9. Layer toggle UI: ability to turn NWS Alerts and Earthquakes on/off independently
10. Each layer shows its own "Last updated" timestamp

**CHECKPOINT 3 — Review before proceeding:**
- [ ] Do new alerts appear on the map automatically without refreshing the page?
- [ ] Do earthquake markers show up alongside alert polygons?
- [ ] Can you toggle each layer on and off?
- [ ] Does each layer have its own timestamp?
- [ ] Are earthquakes rendering correctly in all three views?
- [ ] On 3D Clay, can you see earthquake depth relative to terrain?
- [ ] Are both data sources accumulating in PostgreSQL?
- [ ] If you disconnect internet briefly and reconnect, does the WebSocket reconnect?

---

### PHASE 4: Fire Layers
**Goal:** Add the fire data layers. This is where you start seeing Beacon's hazard coverage take shape.

**Build:**
1. NASA FIRMS/VIIRS fire hotspot ingestion (poll every 30 min)
2. Hotspot rendering: red point markers with confidence-based opacity
3. WFIGS fire perimeter ingestion (poll every 15 min during active fires)
4. Perimeter rendering: red polygon outlines with semi-transparent fill
5. NOAA HRRR-Smoke forecast ingestion (hourly)
6. Smoke rendering: semi-transparent overlay colored by density
7. AirNow AQI ingestion (hourly)
8. AQI rendering: colored contours (green through maroon AQI scale)
9. NWS Fire Weather alerts already covered by Phase 2 (NWS CAP)
10. All fire data stored in PostgreSQL

**CHECKPOINT 4 — Review before proceeding:**
- [ ] Do fire hotspots appear as red dots in active fire areas?
- [ ] Do fire perimeter polygons show the shape of active fires?
- [ ] Does the smoke overlay show plume direction/extent?
- [ ] Does AQI data show air quality stations with correct color coding?
- [ ] On 3D Clay, can you see fire perimeters relative to ridgelines and valleys?
- [ ] On 3D Photo, can you see which specific areas/neighborhoods are in the perimeter?
- [ ] Do all layers toggle independently?
- [ ] Are timestamps accurate for each layer?
- [ ] If there's an active wildfire right now, does Beacon show it?

---

### PHASE 5: Flood + Water Layers
**Goal:** Stream gauges, river forecasts, and flood data.

**Build:**
1. USGS Stream Gauge ingestion (12K+ stations, poll every 15 min)
2. Gauge rendering: colored dots (green/yellow/orange/red for normal/action/flood/major)
3. Click gauge: current stage, flood stage thresholds, hydrograph trend
4. Gauge data → TimescaleDB for time-series storage (future modeling)
5. NOAA River Forecast Center ingestion (predicted crest times/levels)
6. NOAA Coastal Tide/Surge gauge ingestion
7. NOAA DART tsunami buoy ingestion
8. Army Corps reservoir operations ingestion
9. NWS Flash Flood Warnings already in Phase 2 (NWS CAP)

**CHECKPOINT 5 — Review before proceeding:**
- [ ] Do stream gauge dots cover the US with correct color coding?
- [ ] When you click a gauge, do you see stage data and flood thresholds?
- [ ] Can you identify gauges currently at or above flood stage?
- [ ] Are river forecast predictions visible for major rivers?
- [ ] Are coastal tide gauges showing observed vs predicted levels?
- [ ] Is the TimescaleDB time-series data accumulating correctly?
- [ ] On 3D Clay, do gauge markers make sense relative to terrain/valleys?

---

### PHASE 6: Radar + Severe Weather
**Goal:** The weather radar and severe weather layers.

**Build:**
1. NEXRAD radar composite tile ingestion (IEM XYZ/TMS, every 5 min)
2. Radar rendering: imagery overlay on all three views
3. MRMS rotation tracks ingestion (NOAA, every 2 min)
4. MRMS hail detection ingestion
5. MRMS QPE (precipitation accumulation) ingestion
6. MRMS precipitation type ingestion
7. SPC watches/outlooks ingestion
8. SPC rendering: watch boxes, outlook contours
9. NOAA Space Weather alerts ingestion
10. Radar tile caching strategy (these are the heaviest bandwidth items)

**CHECKPOINT 6 — Review before proceeding:**
- [ ] Does radar reflectivity overlay correctly on all three views?
- [ ] Does the radar animate/update visibly every 5 minutes?
- [ ] Are MRMS rotation tracks visible during active severe weather?
- [ ] Do SPC watch boxes appear?
- [ ] Is radar tile caching working? (Check: does radar load fast on repeat views?)
- [ ] On 3D Clay, does radar overlay drape correctly on terrain?
- [ ] Are all these layers toggleable?
- [ ] Is the system still responsive with 10+ layers active?

---

### PHASE 7: Static Base Risk Layers + CDN
**Goal:** Pre-rendered tile layers served from CDN. Zero origin load for these.

**Build:**
1. Tile pre-rendering pipeline: convert static datasets to PMTiles/MBTiles
2. FEMA NFHL flood zones → vector tiles
3. LANDFIRE fuel type/moisture → raster tiles
4. USGS seismic hazard model → raster tiles
5. USGS fault database → vector tiles
6. NOAA SLOSH storm surge zones → vector tiles
7. USGS landslide susceptibility → raster tiles
8. FEMA NID dams → point vector tiles
9. Microsoft Building Footprints → vector tiles
10. CDN deployment (Cloudflare R2 or S3 + CloudFront)
11. All base layers served from CDN edge — no origin requests
12. CDC SVI → choropleth vector tiles
13. HHS emPOWER → ZIP-level choropleth

**CHECKPOINT 7 — Review before proceeding:**
- [ ] Do flood zones render as blue-shaded areas on all views?
- [ ] Can you see fault lines on the map?
- [ ] Does LANDFIRE fuel data show vegetation patterns?
- [ ] Are dam locations visible?
- [ ] Do building footprints render in urban areas?
- [ ] Are tiles loading from CDN (not origin)? Check network tab in browser.
- [ ] Do these layers load fast since they're CDN-cached?
- [ ] Does the SVI choropleth show vulnerability variation by census tract?
- [ ] With base layers + all real-time layers active, is performance acceptable?

---

### PHASE 8: Hurricane Layers
**Goal:** The full hurricane visualization suite.

**Build:**
1. NHC official track + cone of uncertainty ingestion (GIS format, every 6 hrs)
2. Track/cone rendering: line + polygon on all three views
3. NHC wind probability grids
4. GEFS 31-member ensemble track ingestion (NOAA NOMADS)
5. ECMWF 51-member ensemble track ingestion (Open Data, 6hr delay)
6. Canadian GEPS 21-member ensemble ingestion
7. Combined spaghetti plot rendering: 103+ polylines with varying opacity
8. NOAA SLOSH real-time storm surge model output during active threats
9. Hurricane-specific view: when active storm, auto-zoom and highlight all relevant layers

**CHECKPOINT 8 — Review before proceeding:**
- [ ] Does the NHC forecast cone render correctly on all three views?
- [ ] Does the spaghetti plot show spread of ensemble models?
- [ ] Can you distinguish GEFS (US) from ECMWF (Euro) from Canadian tracks?
- [ ] Does wind probability show percentage chance at specific locations?
- [ ] On 3D Photo, can you see the cone relative to specific coastal cities?
- [ ] On 3D Clay, can you see surge zones relative to terrain elevation?
- [ ] If there's no active hurricane, does the layer gracefully show nothing?

---

### PHASE 9: Remaining Data Sources
**Goal:** Fill out the remaining 30+ data layers from the map_layers doc.

**Build:**
1. FEMA IPAWS non-weather alerts
2. USGS volcano alert levels
3. NOAA volcanic ash advisory
4. NRC nuclear plant emergency classifications
5. State DOT 511 road closures
6. GTFS-RT transit real-time
7. ADS-B aircraft positions (fire tankers during wildfires)
8. NOAA AIS maritime vessel positions
9. ALERTCalifornia/ALERTWest fire cameras (conditional license)
10. NOAA coastal webcams
11. APRS-IS ham radio network
12. NOAA harmful algal bloom forecasts
13. EPA TRI toxic release locations
14. EPA RMP hazardous facility locations
15. FCC broadband coverage
16. FEMA Individual Assistance registrations (during events)
17. Red Cross shelter locations (during events)
18. 211 emergency resources
19. First Street Flood/Fire Factor (conditional — apply to program)
20. Waze CCP road data (conditional — apply to program)
21. Remaining FEMA/USGS base layers not yet covered

**CHECKPOINT 9 — Review before proceeding:**
- [ ] Spot-check 5-10 of the new layers for correct rendering
- [ ] Are all layers toggleable in the layer panel?
- [ ] Are all layers storing data in PostgreSQL?
- [ ] Is the layer panel organized and not overwhelming?
- [ ] Is performance still acceptable with all layers available?
- [ ] Are timestamps showing on every active layer?

---

### PHASE 10: 3D Clay Refinement
**Goal:** Make the Clay view the polished analytical view it's meant to be.

**Build:**
1. Altitude contour lines generated from DEM, rendered as Cesium polylines
2. Contour label placement (elevation values)
3. Gray terrain color tuning — ensure all data layers pop against the neutral background
4. Hazard zone boundary styling optimized for clay view (bolder outlines, cleaner fills)
5. Data label legibility check across all layers on gray background
6. Camera presets for common analytical views (regional overview, metro zoom, coastline)

**CHECKPOINT 10 — Review before proceeding:**
- [ ] Do contour lines render cleanly and show terrain shape at a glance?
- [ ] Does every data layer remain legible on the gray surface?
- [ ] Does the clay view feel like a professional analytical tool?
- [ ] Is it clearly different from (and more focused than) the photo view?
- [ ] Do the alert/hazard layers pop against the neutral background?

---

### PHASE 11: 2D Low-Data Optimization
**Goal:** Make the 2D view genuinely usable on degraded infrastructure.

**Build:**
1. Bandwidth budget enforcement: cap tile requests per second
2. Service worker: cache base map tiles for user's saved locations
3. Offline fallback: if connectivity drops, serve cached tiles + last-known data
4. Compress all GeoJSON payloads (gzip/brotli)
5. Progressive loading: only load layers within current viewport
6. Test on throttled connection: 3G (1.5 Mbps), 2G (50 Kbps)
7. Measure: initial load size, per-update size, time to first meaningful paint

**CHECKPOINT 11 — Review before proceeding:**
- [ ] Does the 2D view load in <3 seconds on a 3G connection?
- [ ] Is initial page weight under 500KB?
- [ ] If you go offline, can you still see the base map and last-known data?
- [ ] Are data updates under 50KB each?
- [ ] Does the stale-data warning appear when data is old?
- [ ] Is this view usable enough that someone on a failing cell tower gets value?

---

### PHASE 12: Scaling + Production Hardening
**Goal:** Prepare for real traffic, including disaster-event spikes.

**Build:**
1. Redis pub/sub for WebSocket fan-out across multiple server instances
2. Auto-scaling configuration for backend (container-based)
3. CDN edge caching: all static layers served from edge, real-time alerts cached with short TTL
4. Graceful degradation: if origin is overloaded, serve stale-while-revalidate from CDN
5. Geographic sharding: partition ingestion workers by region
6. Load testing: simulate 10K, 50K, 100K concurrent users concentrated in one metro area
7. Database: partition raw_observations by source + time range
8. Monitoring: alerts for API source failures, ingestion lag, WebSocket connection count
9. Rate limiting on public API endpoints

**CHECKPOINT 12 — Review before proceeding:**
- [ ] Does load testing show acceptable response times at 10K concurrent users?
- [ ] If you kill one backend instance, do clients reconnect to another?
- [ ] Is CDN serving static layers (verify zero origin hits for base layers)?
- [ ] Does the system degrade gracefully under extreme load (stale data, not errors)?
- [ ] Are monitoring alerts firing correctly when things go wrong?
- [ ] Is database query performance acceptable with weeks of accumulated data?

---

### Phase Dependency Rules

- Phases 1-3 are strictly sequential (each builds on the last)
- Phases 4-6 can run in parallel once Phase 3 passes (each adds independent data layers to the proven pipeline)
- Phase 7 can start once Phase 3 passes (CDN pipeline is independent of specific data layers)
- Phase 8 can start after Phase 3 (independent data source)
- Phase 9 can start after Phase 3 (bulk of remaining integrations)
- Phase 10 depends on Phase 7 (needs base layers on clay view to refine)
- Phase 11 depends on Phases 4-6 (needs real-time layers to test bandwidth)
- Phase 12 depends on all prior phases (scaling the complete system)

---

## Hosting Recommendation (Dev Environment)

**Recommended: Vercel (frontend) + Supabase (database) + Upstash (Redis)**

This gets you from zero to real live data on a map the fastest, with the lowest operational overhead while you're in development. All three have generous free tiers.

| Service | Role | Why |
|---|---|---|
| **Vercel** | Next.js frontend + API routes | Zero-config Next.js deployment. Push to GitHub, site updates automatically. Free tier covers dev. |
| **Supabase** | PostgreSQL + PostGIS | Managed Postgres with PostGIS extension enabled. Free tier: 500MB database, 1GB file storage. Built-in dashboard to inspect your data. |
| **Upstash** | Redis cache | Serverless Redis. Free tier: 10K commands/day. Enough for dev. Pay-per-request in production. |
| **Cloudflare R2** | CDN for static tiles | S3-compatible object storage with zero egress fees. Free tier: 10GB storage, 10M reads/month. Perfect for PMTiles. |
| **Cesium Ion** | 3D Tiles token | Free tier: 5GB asset storage + Google Photorealistic 3D Tiles access. |

**Transition to production:** When traffic demands it, migrate Supabase → AWS RDS (or stay on Supabase Pro), Upstash → AWS ElastiCache, Vercel stays. The code doesn't change — only connection strings.

**Everything is real data from day one.** No mock data, no fake layers. Phase 2 connects to the live NWS CAP feed and displays real active alerts. Every phase after that adds more real public data sources. The dev environment IS the real map.

---

## GitHub Repository Structure

**Recommended: monorepo under Mathison's GitHub org**

```
mathison_hive/applications/beacon/
  ├─ apps/
  │   ├─ web/                  # Next.js frontend (map viewer, public app)
  │   ├─ beacon-dev/           # Beacon Dev internal portal (see below)
  │   └─ ingestion/            # Node.js data ingestion workers
  ├─ packages/
  │   ├─ map-core/             # Shared map rendering (CesiumJS + MapLibre)
  │   ├─ data-layers/          # Layer definitions, configs, rendering per layer
  │   ├─ db/                   # Database schema, migrations, queries
  │   └─ shared/               # Types, constants, utilities
  ├─ infrastructure/
  │   ├─ docker-compose.yml    # Local dev environment
  │   ├─ supabase/             # Supabase migrations + seed data
  │   └─ tiles/                # Tile generation scripts for static layers
  ├─ simulations/              # Historical disaster replay data + scripts
  ├─ turbo.json                # Turborepo config (monorepo task runner)
  └─ package.json
```

I don't have access to Mathison's GitHub org. To set this up, you'll need to either share the org URL/credentials with me or create the repo and I'll document the exact scaffold commands to initialize it.

---

## Beacon Dev Portal

Internal tool for Mathison employees. Separate Next.js app (`apps/beacon-dev/`) that sits alongside the public map but exposes controls the public never sees.

### Menu Tabs

1. **Live World Map** — primary interface (see below)
2. **Data Pipeline** — ingestion status, source health, freshness per layer
3. **Observability** — system health, performance grades, storage projections
4. **Disaster Sim** — historical replay and load testing (see Disaster Simulation Testing section)
5. **Design Changelog** — layer style versioning and rollback
6. **Settings** — API keys, team permissions, environment config

### Live World Map (God's Eye)

The main working interface. Full interactive globe with all data layers rendered live. You zoom, pan, fly anywhere on earth and see exactly what the public would see — plus internal controls layered on top.

**View Toggle:** Switch between 2D Low-Data, 3D Clay, and 3D Photo at any time. One view active at a time, or split-screen two views side-by-side for comparison.

**Layer Control Panel (left sidebar):**
- Every layer listed individually with on/off toggle, opacity slider, z-order control
- Grouped by category (weather, seismic, fire, hydrology, air quality, etc.)
- Badge showing data freshness per layer (green = fresh, yellow = stale, red = failed)

**Data Inspector (right sidebar):**
- Click any data point on the map to see the raw API response from the source, the processed/normalized version, and the render output
- Full transparency into the pipeline from source to pixel

**Device Preview (bottom toolbar):**
- Dropdown to render the map at specific device dimensions: iPhone SE (375x667), iPhone 15 Pro (393x852), iPad (1024x1366), Android mid-range (360x800), desktop (1920x1080)
- Uses CSS viewport simulation within an iframe — the actual live map rendered at that exact size, not a screenshot
- No browser plugin or extension needed. The preview runs inside the Beacon Dev app itself by resizing the rendering viewport. Works in any browser on any OS.

**Condition Simulator (bottom toolbar):**
- Dropdowns to simulate: time of day, bandwidth throttle (4G/3G/2G/offline), number of active hazard layers
- Shows how the map performs under each combination
- Pairs with device preview — see how a 3G iPhone SE user experiences a 12-layer severe weather event

**Time Scrubber (bottom of map):**
- Integrated directly into the Live World Map view (see Time Scrubber section for full spec)

**Phone-View Snapshot:**
- Drop a pin anywhere on the map, pick a device, click "What would a user see?" — renders exactly what a person opening the app at that location on that device would see at that moment

### Design Change Tracking
- Every layer style change (color, opacity, icon, label) is version-controlled in the repo
- Beacon Dev shows a changelog: who changed what layer style, when, with before/after preview
- Rollback: click any previous version to restore that layer's styling
- Style export: layer styles stored as JSON config files in `packages/data-layers/` — editable in code or via Beacon Dev UI

### Figma Integration
A Figma MCP connector is available and can be connected to pull design context directly. Once connected, design tokens (colors, typography, spacing) can sync between Figma and the layer style configs.

---

## Time Scrubber (Historical Playback)

Users can scroll forward and backward in time to see how conditions evolved.

### How It Works
- **Scrubber UI:** Timeline slider at bottom of map. Drag left = past, drag right = future (for forecast data). Current time highlighted.
- **Data source:** PostgreSQL stores every observation with timestamp. The time scrubber queries by time range instead of "latest."
- **Playback modes:**
  - **Manual scrub:** Drag the slider to any point in the last 7 days (configurable). Map updates to show all layer data as it was at that moment.
  - **Animation:** Press play to animate the map through time at 1hr/second (adjustable speed). Watch a storm system develop, fire perimeters grow, stream gauges rise.
  - **Forecast scrub:** For layers with forecast data (NHC track, river forecasts, HRRR-Smoke), scrub forward shows predicted future state.

### Implementation
- Every `raw_observations` row already has `source_time` — this is what the scrubber queries against
- Time-scrub API: `GET /api/layers/{layer}/at?time=2026-04-01T18:00:00Z` returns data as-of that timestamp
- For time-series layers (stream gauges, AQI), show sparkline history in the click popup
- Radar has natural animation support (IEM provides historical radar tiles by timestamp)
- Static base layers (flood zones, fault lines) don't change with time — they stay constant during scrub

### Storage Implication
This is why we store everything raw from day one. The time scrubber is only as good as the historical data depth. After 1 year of ingestion, users can scrub back through an entire hurricane season or wildfire year.

---

## Observability (Performance, Storage, Usage Tracking)

Built into the system from Phase 1, not bolted on later.

### Performance Monitoring
- **Frontend:** Web Vitals (LCP, FID, CLS) reported per page load, per device type, per view mode
- **API latency:** Every API endpoint tracked: p50, p95, p99 response times
- **WebSocket health:** Connection count, message throughput, reconnection rate
- **Tile load time:** Per-layer tile request latency tracked — identifies slow layers
- **Rendering FPS:** CesiumJS frame rate reported — flags when 3D views drop below 30fps
- **Tool:** Vercel Analytics (frontend) + Grafana + Prometheus (backend) or Datadog if budget allows

### Storage Tracking
- **Database size:** Dashboard showing total PostGIS storage, growth rate per day, per source
- **Time-series volume:** TimescaleDB compression ratio and retention policy monitoring
- **CDN storage:** Tile storage per layer, cache hit ratio
- **Projections:** At current ingestion rate, when will you hit storage thresholds? Auto-alert at 70% capacity.

### Usage Tracking
- **Active users:** Real-time count, by region, by device type
- **Layer popularity:** Which layers are toggled on most, which are ignored
- **View mode split:** What percentage use 2D vs 3D Clay vs 3D Photo
- **Time scrubber usage:** How often, how far back, which events get replayed
- **Session duration:** Average time spent in app, per-session layer interactions
- **Peak concurrent:** Track the maximum simultaneous users, especially during weather events
- **All tracking is privacy-preserving:** Aggregate metrics only, no individual user location tracking

### Beacon Dev Dashboard
All of the above feeds into a real-time dashboard within Beacon Dev. Employees see: system health, data freshness per layer, user engagement, storage projections, and performance grades per view mode.

---

## Disaster Simulation Testing

A dedicated section within Beacon Dev for replaying historical disasters and stress-testing the system.

### Historical Disaster Replay
- **Data source:** NOAA/NWS/USGS archives of past events provide timestamped historical data
- **Pre-loaded scenarios:**
  - Hurricane Harvey (2027 Texas) — surge + rainfall + flood gauge cascade
  - Camp Fire (2018 Paradise CA) — fast-moving wildfire + evacuation
  - 2011 Joplin Tornado — radar rotation tracks + warnings + impact
  - 2010 Haiti Earthquake — ShakeMap + aftershock sequence
  - Hurricane Katrina (2005) — multi-day storm surge + levee failure + power outage cascade
  - Additional scenarios loaded from NOAA Storm Events Database
- **Replay engine:** Feeds archived data into the ingestion pipeline at accelerated time (1 hour of real time = 1 minute of replay). The map shows exactly what it would have shown if Beacon had been live during that event.
- **Compare to actual:** Side-by-side: what Beacon showed vs what actually happened (damage reports, death toll, timeline). Validates that our data sources would have given useful warning.

### Simulated User Traffic
- **Load profiles:** Pre-built traffic patterns modeled on real disaster behavior:
  - "Tornado Warning" — 50K users in one metro area within 2 minutes
  - "Hurricane Landfall" — 500K users over 6 hours, concentrated on coast
  - "Major Earthquake" — 200K users spike in 30 seconds, infrastructure degraded
  - "Wildfire Evacuation" — 100K users sustained over 12 hours, shifting geographic focus
- **Infrastructure degradation simulation:**
  - Kill specific backend instances mid-replay
  - Throttle CDN bandwidth to simulate overloaded edge nodes
  - Simulate database connection pool exhaustion
  - Drop WebSocket connections randomly (simulates cell tower failures)
  - Increase API source latency (simulates USGS/NWS being overloaded during major events)

### Simulated User Behavior
- **User sighting reports:** For future versions with user reporting, the simulator generates synthetic reports based on historical damage surveys. During a replayed tornado, simulated users "tag" debris sightings, funnel cloud reports, and structural damage at locations matching actual damage paths.
- **Phone-view snapshot:** At any point during a replay, click "What would a user see?" — renders the map exactly as it would appear on an iPhone opening the app at that moment, at that location. Employees can drop a pin anywhere on the map and see the user experience from that vantage point.
- **Report:** After each simulation run, generate a scorecard: data latency per layer, time from event onset to first alert displayed, percentage of impacted area covered by warnings, any layer failures or stale data.

### Simulation Schedule
- Run the full historical replay suite on every major code change (CI/CD integration)
- Monthly: full load test with latest traffic projections
- Before any production deployment: abbreviated disaster replay + load test must pass

---

## Key Differences from WorldView

| WorldView | Beacon |
|---|---|
| Demo/showcase | Production platform |
| In-memory caching | Redis + PostgreSQL persistent storage |
| Single server | Horizontally scalable |
| ~8 data layers | 70+ data layers |
| No offline support | Service worker + offline tiles |
| No data persistence | Every observation stored for modeling |
| One visual mode with shader filters | Three distinct rendering pipelines |
| Global view | User location-centric with saved locations |
| Entertainment/curiosity | Actionable situational awareness |
| No timestamps | Prominent last-updated on every layer |
| Fun visual filters (CRT, NV) | Clean, matter-of-fact information display |
