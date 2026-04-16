# Beacon: Wildfire — Fire Model Input Layers

Layers that feed directly into fire behavior models (FARSITE, FlamMap, Rothermel, NVIDIA surrogate, BEHAVE).

**Key:** R = Required, I = Important, U = Useful

---

## LCP File Layers (FARSITE/FlamMap Required)

| Layer | Priority | Role |
|---|---|---|
| Elevation | R | Fire behavior, smoke dispersion |
| Slope angle | R | Fire spreads faster upslope |
| Aspect | R | South-facing = drier fuels |
| Fire behavior fuel model (FBFM) | R | Rothermel surface fire input |
| Canopy cover (%) | R | Crown fire transition |
| Canopy height | R | Crown fire behavior |
| Canopy base height | R | Surface-to-crown fire transition |
| Canopy bulk density (kg/m³) | R | Active vs passive crown fire |

## Topographic Inputs

| Layer | Priority | Role |
|---|---|---|
| Terrain curvature | I | Ridge/valley channeling of fire and wind |
| Grass layer | R | Surface fuel, fast-spreading fire carrier |
| Sand layer | I | Non-combustible surface, natural firebreak |

## Vegetation & Fuel Characterization

| Layer | Priority | Role |
|---|---|---|
| Tree location/height | R | Individual tree fire behavior |
| Tree species | R | Species-specific flammability and moisture |
| Vegetation density | R | Fuel continuity, spread potential |
| Canopy fuel loading | R | Total crown fuel available |
| Vegetation health/NDVI | R | Live/dead ratio, drought stress indicator |
| Vegetation type (EVT) | R | Fuel classification and fire behavior |
| Transition fuel (ground to canopy) | R | Ladder fuel enabling crown fire |
| Ladder fuel density | R | Vertical fuel continuity |
| Surface fuel depth | R | Rothermel input for flame length |
| Litter/duff depth | R | Smoldering fire potential |
| Coarse woody fuel loading | R | Heavy fuel, long burn duration |
| Duff loading (tons/acre) | R | Smoldering and holdover fire |
| Fuel particle surface-area-to-volume ratio | R | Rothermel input for rate of spread |
| Fuel particle heat content | R | Rothermel input for fire intensity |
| Moisture of extinction | R | Rothermel input for fire/no-fire threshold |
| Burn scars | R | Recently burned = low fuel = spread barrier |

## Fuel Moisture

| Layer | Priority | Role |
|---|---|---|
| 1-hour fuel moisture | R | Fine dead fuel, fastest response |
| 10-hour fuel moisture | R | Small branch moisture |
| 100-hour fuel moisture | R | Large branch moisture |
| Live herbaceous moisture | R | Green grass/herb dampening effect |
| Live woody moisture | R | Shrub moisture content |
| Foliar moisture content | R | Crown fire intensity calculation |
| Dead fuel moisture (seasonal avg) | R | Baseline fuel condition |
| Live fuel moisture (seasonal avg) | R | Baseline vegetation condition |

## Weather Inputs

| Layer | Priority | Role |
|---|---|---|
| Wind speed grid (real-time/modeled) | R | Primary spread driver |
| Wind direction grid (real-time/modeled) | R | Primary spread direction |
| Temperature grid | R | Fuel drying, fire behavior |
| Relative humidity grid | R | Fuel moisture, fire behavior |
| Precipitation grid | R | Fuel wetting, suppression |
| Solar radiation / insolation | R | Fuel drying, slope heating |
| Wind history (prevailing direction) | R | Dominant fire spread direction |
| Wind history (seasonal patterns) | R | Seasonal fire weather patterns |
| RAWS station data coverage | I | Weather data quality indicator |
| Last hurricane date | U | Post-hurricane debris = fuel loading |
| Last ice storm date | U | Ice storm debris = fuel loading |

## Fire Indices

| Layer | Priority | Role |
|---|---|---|
| Fire weather index (FWI) | R | Composite fire danger rating |
| Burning index (BI) | R | NFDRS fire intensity proxy |
| Energy release component (ERC) | R | NFDRS energy release potential |
| Spread component (SC) | R | NFDRS spread potential |

## Fire History & Pre-computed Behavior

| Layer | Priority | Role |
|---|---|---|
| Last burn date per cell | R | Time since fire = fuel accumulation |
| Historical fire perimeters | R | Past fire extent, fuel age mapping |
| Fire return interval | R | Expected fire frequency |
| Burn-together zones (N wind) | R | Pre-computed structure fire spread |
| Burn-together zones (S wind) | R | Pre-computed structure fire spread |
| Burn-together zones (E wind) | R | Pre-computed structure fire spread |
| Burn-together zones (W wind) | R | Pre-computed structure fire spread |
| Low burn risk zones | R | Pre-identified low-risk areas |
| Terrain flammability | R | Terrain-based burn potential |
| Vegetation ignition ease | R | How easily vegetation ignites |
| Vegetation burn duration | R | How long vegetation burns |
| Fire spread rate (per cell) | R | Pre-computed spread velocity |
| Ember transport potential | R | Likelihood of generating embers |
| Spotting distance (modeled) | R | How far embers can travel |
| Crown fire potential | R | Likelihood of crown fire |
| General wildfire risk | R | Baseline wildfire probability |

## Structure Ignitability

| Layer | Priority | Role |
|---|---|---|
| Footprint location | R | Structure exposure, ember receipt area |
| Height / floors | R | Radiation view factor, vertical fire spread |
| Building material | R | Ignition probability, burn duration |
| Year built | I | Building code era predicts fire resistance |
| Roof geometry | R | Ember accumulation potential (flat vs pitched) |
| Roof material | R | Ignition from embers (wood shake vs tile vs metal) |
| Roof flame retardant | R | Resistance to ember ignition |
| Distance to other structures | R | Structure-to-structure fire spread |
| Flammability score | R | Overall structure ignition risk |
| Heating type | I | Ignition source risk (wood stove, gas) |
| Building code compliance | I | Fire code compliance predicts resistance |
| Fireproof certified | R | Certified fire-resistant structures |
| Power source | I | Electrical ignition risk, generator fuel |
| Has fireplace | I | Ember entry point via chimney |
| Glass front / storefront | I | Radiant heat breakage, fire entry |
| Marked high risk building | I | Pre-identified vulnerable structures |
| Ignition ease (exterior) | R | Exterior material ignitability |
| Burn duration estimate | R | How long structure burns |
| Fuel load (structure) | R | Total combustible mass |
| Single family home | I | Individual structure defense assessment |
| Soft story detection | U | Collapse risk if fire weakens structure |
| Parcel boundaries | I | Property-level defensible space |
| Wildland-urban interface (WUI) | R | Highest risk zone definition |

## Barrier Flammability

| Layer | Priority | Role |
|---|---|---|
| Fence location/extent | I | Fire pathway |
| Fence material | R | Combustible fencing spreads fire |
| Fence flammability | R | Fire bridge between properties |
| Wall location/extent | I | Fire barrier or obstacle |
| Wall material/height | I | Non-combustible walls as firebreaks |
| Wall flammability | R | Combustible walls spread fire |
| Hedge location/extent | R | Living fuel connecting properties |
| Hedge height/density | R | Fuel volume in hedge |
| Hedge species | R | Flammability varies by species |
| Hedge flammability | R | Fire bridge potential |
| Boulder/rock barrier | I | Natural firebreak |
| Barrier fire-bridge potential | R | Barriers that carry fire across gaps |

## Ignition Sources

| Layer | Priority | Role |
|---|---|---|
| Power line route/corridor | R | Ignition source, cleared corridor |
| Power line conductor height | I | Clearance from vegetation |
| Utility pole location | I | Combustible poles as fuel |
| Utility pole material (wood/steel/concrete) | R | Wood poles burn and fall |
| Utility pole condition | I | Weakened poles fail in fire |
| Road flammability | R | Vegetation overhang, roadside fuel |
| Pavement layer | U | Non-combustible surface, firebreak potential |
| Parking areas | U | Non-combustible surface |
| Lightning strike density | R | Natural ignition source mapping |
| Arson risk zones | R | Human ignition source mapping |
| Extreme heat risk | I | Heat compounds fire danger |
| Extreme wind risk (derecho) | I | Extreme spread conditions |

## Explosive/Hazardous (Fire Interaction)

| Layer | Priority | Role |
|---|---|---|
| Gas stations | R | Explosion risk if fire reaches |
| Propane tanks | R | BLEVE risk, explosion radius |
| Chemical storage | R | Toxic smoke, explosion risk |
| Munitions storage | R | Explosion risk, evacuation trigger |
| Fertilizer storage | R | Ammonium nitrate explosion risk |
| Industrial chemical sites | R | Toxic plume generation |
| Pipeline routes | R | Gas line rupture/fire risk |
| Above-ground fuel tanks | R | Fire intensification |
| Power station fuel type | I | On-site fuel fire risk |

## Fire-Specific Mitigation

| Layer | Priority | Role |
|---|---|---|
| Firebreak (constructed) | R | Designed fire spread barrier |
| Fuel break / defensible space | R | Reduced fuel zone around structures |
| Wildfire sprinkler system | R | Active structure defense |
| Storm drain / culvert | U | Fire travel through culverts |
| EMS local wildfire hazard map | R | Local fire risk assessment |

## Fire Detection & Monitoring

| Layer | Priority | Role |
|---|---|---|
| Weather station location | R | Real-time weather input |
| Air quality monitor location | R | Smoke detection, AQI |
| Wildfire camera location | R | Early fire detection |
| Wind speed/direction sensor | R | Real-time wind for spread |
| Rain gauge location | I | Precipitation monitoring |
| Snow telemetry (SNOTEL) | U | Snowpack = moisture barrier |
| User-deployed sensor location | I | Citizen science fire/weather data |
| NWS forecast office (WFO) | I | Red flag warning source |
| Doppler radar site (NEXRAD) | I | Pyrocumulonimbus detection |
| Weather observatory | I | Upper-level weather data |
| Upper-air sounding station | I | Atmospheric stability (inversions) |
| Lightning detection sensor | R | Lightning strike ignition source |
| Sensor-detected vegetation change | R | Fuel map currency |

## Fire Model Data Availability

| Layer | Priority | Role |
|---|---|---|
| LiDAR coverage extent | R | Fuel/terrain data quality |
| LiDAR data age | R | Fuel data currency |
| High-res satellite coverage | R | Detection capability |
| High-res satellite data age | R | Data freshness |
| Medium-res satellite coverage | I | NDVI/burn scar coverage |
| LANDFIRE coverage | R | Fuel model availability |

## Bridge/Overpass Combustibility

| Layer | Priority | Role |
|---|---|---|
| Bridge material type | I | Bridge combustibility |
| Overpass material | U | Combustibility |
