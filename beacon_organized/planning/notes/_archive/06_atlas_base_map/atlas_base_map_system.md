## 3. Base Map System (Atlas)

## Still Needs Research
- Cross-source calibration model for Mapillary location drift compensation
- Cost-benefit analysis for paid commercial CV models vs. open-source alternatives
- User input verification and conflict detection algorithms
- Tile update latency requirements during active events
- Storage architecture for sparse feature data at global scale
- Real-time change detection confidence scoring
- Synthetic training data generation at scale for data-sparse regions
- Privacy compliance for street-level imagery use (GDPR, CCPA)

---

Server-side module, Beacon employees only. Some layers accept EMS and public user input (evacuation routes, destruction reports, condition reports) that feed into the base map. Event-specific input (hazard sightings, status updates) is stored in event records, not the base map.

### 3.1 Multi-Source Fusion Approach

The final base map is produced through a pipeline:

1. **Source prioritization:** For each map attribute, determine which data type (LiDAR, satellite, street-view, OSM, etc.) is most effective at identifying it. Factor in recency.
2. **Primary prediction:** Use the best-suited data source for initial attribute predictions.
3. **Cross-source calibration model:** A model that calibrates different data types so predictions at a specific location can be compared. Critical for Mapillary data where location accuracy can drift.
4. **Secondary validation:** Cross-check primary predictions against secondary data sources to validate or refute.
5. **Final prediction model:** Aggregates all evidence into final predictions.
6. **Visualization module:** Responsible for rendering the final map.

### 3.2 Development Approach Per Layer

For each map layer/attribute, a development agent should:

- Study what data sources are most effective for that information
- Evaluate computer vision options (e.g., Mapillary street-view with JEPA self-supervised learning, commercial CV models)
- Consider combining multiple data layers for inference (LiDAR describes box store shape + street-view sees Target logo = probably a Target)
- Assess legality of third-party options
- Scale effectiveness against cost (paid vs. unpaid)
- Develop a validation model for predictions (e.g., once a Target is identified, look it up to confirm)
- Integrate user input (EMS personnel reports, public self-reporting)
- Build update mechanisms: as hazard models predict destruction and/or users confirm it, map layers should update accordingly
- Make a list of things to identify with different data sources (primary/secondary) — e.g., satellite + LiDAR to identify cell towers

### 3.3 Creation/Update Manager & Tile System

Beacon employee-side system:

- Takes in data from sources and user input (evacuation routes, gate owner info, evacuation zones)
- Includes models for assembling final layers
- Final layers pushed to users as 1km tiles
- Each user has saved locations that always precache tiles
- Tiles also precached if user is at risk of an active hazard
- Alerts triggered when user reports conflict with existing map data
- Alerts triggered when user GPS shows them floating above ground level, implying a building exists there that isn't on the map

### 3.4 Data Storage Note

Since many features are sparsely populated, store data as features relative to a location. If a feature isn't in a location's attributes, it's assumed not applicable.

### 3.5 Street-Level Real-Time Perception Model

A system that bridges the aerial base map with ground-level reality using phone cameras for real-time change detection.

**Prior Generation (Server-Side):**

- Reproject aerial LiDAR point clouds into simulated street-level perspectives at known vantage points (intersections, road segments)
- The reprojection creates a "prior" of what the world should look like from ground level — expected building outlines, tree canopy positions, road edges, infrastructure
- This prior is pre-computed and compressed into the 1km tile delivery system alongside other base map data

**Real-Time Change Detection (Phone-Side):**

- When a user's phone camera captures a street-level view, the app compares the live image against the pre-computed prior for that location and angle
- Discrepancies between expected and observed scenes indicate real-world changes: fallen trees, collapsed structures, new water/flooding, debris fields, road blockages
- Detected changes are classified (obstruction type, severity) and geolocated
- Classifications are pushed back through the mesh/network to update routing for all users in real time

**Real-Time Loop:**

1. Pre-computed map prior (aerial LiDAR reprojected to street-level)
2. Phone camera observation at that location
3. Difference detection and classification
4. Geolocation of detected change
5. Routing updates propagated to all affected users

**Synthetic Training Data Generation:**

- In areas without Mapillary street-view coverage, the aerial-to-street reprojection can generate synthetic street-level views
- These synthetic views paired with the aerial source create training pairs for LeJEPA fusion cross-modal models
- Enables training of models that fuse aerial and street-level data even where ground-truth street imagery doesn't exist
- Strengthens the multi-source fusion pipeline (Section 3.1) by extending cross-modal learning to data-sparse regions

### 3.6 Layer Data Source Identification

For each map layer, designate which data source is primary (most effective for identification) and which is secondary (for validation/supplementation). This guides the development approach per layer (Section 3.2).

| Layer | Primary Source | Why Primary | Secondary Source | Why Secondary |
|---|---|---|---|---|
| Barriers (fences, walls, guardrails, hedges, boulders) | Street View / Mapillary | Material type visible | LiDAR | Height, extent visible |
| Trees | LiDAR | Height, lean, precise location | Street View / Mapillary | Species, damage/dryness susceptibility |
| Gates | Street View / Mapillary | Visual details (hinges, lock type) | LiDAR | Gap detection |
| Driveways | LiDAR | Length, width measurement | Terrain (DEM) | Slope analysis |
| Dirt Roads | Terrain (DEM) | Slope analysis | LiDAR | Vegetation clearing patterns |
| Passable Terrain | Terrain (DEM) | Slope is critical | LiDAR | Vegetation density |
| Road Width | LiDAR | Measured width at all points | — | — |
| U-Turn Possibility | LiDAR width + Terrain slope | Where full 180-degree turn possible | — | — |
| K-Turn Possibility | LiDAR width + backing space + Terrain | Where 3-point turn possible by vehicle size (link to vehicle manager specs) | — | — |
| Street Crowding (illegal parking) | LiDAR | Detect parked cars reducing drivable width | Street View / Mapillary | Visual confirmation |
| Power Lines | Street View / Mapillary | Visual identification, provider signs | LiDAR + Satellite | Height, routing between poles |
| Fire Hydrants | Street View / Mapillary | Visual identification | — | — |
| Open Doors Model (sheltering access) | Google / OSM + time-of-day | Commercial vs. residential, hours of operation | Street View / Mapillary | Entrance visibility |
| Population Estimation | Census + demographics | Baseline counts | Building purpose + time-of-day model | Weekday/weekend adjustment |
| Number of Lanes | LiDAR + Satellite | Width measurement + lane marking detection | OSM | Tagged lane counts |
| Building Materials | Street View / Mapillary | Visual material identification | LiDAR | Reflectance properties |
| Building Age | County assessor records | Year built data | Street View + CV model | Visual age estimation |
| Overpasses | LiDAR | Height clearance measurement | OSM / DOT records | Weight/height limit data |
| Docks | Satellite + LiDAR | Structure identification | OSM (leisure=marina) | Tagged locations |
| Camping Grounds | OSM + Satellite | Tagged locations + clearing identification | Street View / Mapillary | Visual confirmation |

---

