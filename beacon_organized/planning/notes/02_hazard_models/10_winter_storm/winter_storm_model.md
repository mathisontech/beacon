# Winter Storm Hazard Model

Winter storms span temperate mid-latitudes (>35°N) with peak season Oct-Mar. Primary mechanisms: extratropical cyclones (baroclinic energy conversion), polar outbreaks (Arctic intrusions via jet stream), and lake-effect (Great Lakes convection). Compound hazards dominate mortality (hypothermia + stranding + infrastructure failure).

## Risk Layer
NWS (National Weather Service) winter storm watches/warnings + hazard assessment grid. Scoring 1-5 based: snowfall accumulation (6-48hr), wind gust threshold, temperature, icing conditions. High-risk zones: elevation >2000ft, latitude >40°N, maritime-influenced (lake effect). Grid 4km resolution. Data source: NWS Storm Prediction Center alerts (issued 6-72hr lead), updated 12-hourly via NOAA API.

API: NWS Alerts (https://api.weather.gov/alerts/active?point=...) provides county-level winter storm watches/warnings with snow, wind, and ice criteria. Storm-specific polygon bounds.

## Ongoing Hazard Model
Snowfall prediction: NAM (North American Mesoscale, 3km, 60hr), GFS (Global Forecast System, 13km, 180hr), high-res ensemble (SREF). Accumulation estimate A = QPF (liquid equivalent) * (T/30) where T=temperature°F (colder air denser snow, ratio 10:1 to 20:1). Update cycle: every 6hr with 60hr lead (NAM), 180hr lead (GFS).

Ice accretion model: Sperry-Piltz Ice Accumulation Index = (Tavg-0)*(wetbulb/100)² where avg temp just below freezing (-5 to 0°C). Accumulation rates: 0.5-1.5mm/hr in light ice, 3-5mm/hr in freezing rain bands. Glaze ice density 0.9 g/cm³, critical accumulation ~50mm (tree/power line failure threshold). Track forecast: steering flow (jet position 250mb wind).

Wind chill index: WCI = 35.74 + 0.6215T - 35.75V^0.16 + 0.4275T*V^0.16 where T=air temp°F, V=wind speed mph. Frostbite time threshold: exposed skin >-20°C WCI = 30min onset, <-40°C WCI = 10min. Road surface temp (RST) model: RST = Tair - 2*cloud_fraction*emissivity (net radiation), critical <0°C for icing.

## Spread/Evolution
Storm translation: steering flow westerlies (20-40 kt typical), forecast track error ±100km at 48hr. Spreading: precipitation shield expands 200-400km ahead of front (warm conveyor belt). Evolution: rapidly intensifying low pressure deepens 5-10mb/24hr (bombogenesis threshold <24mb/24hr). Snow deformation: dense wet snow (>100 kg/m³) settles 10-20% per day, powder snow stays fluffy.

Ice storm evolution: warm cloud layer (0-2km) thickness critical (>500m favors accretion). Precipitation type changes: snow→sleet→freezing rain→rain as air mass warms. Rate change: ice accumulation accelerates with cold air intrusion (0°C layer descent). Spread probability increases 0.9x per adjacent cell meeting >6-inch/24hr threshold.

## Lethality
Traffic mortality: winter-related road accidents 24% of annual toll (wet/icy conditions, visibility). Accident rates increase 2-4x on ice vs. dry pavement. Hypothermia: exposure deaths 500-1500 annually in US, homeless/stranded vehicle populations. Exposure threshold: -20°C WCI + wet clothing = 2-3hr onset time.

Structural loading: wet snow (wet adhesion + wind pressure) = 5-20 kg/m² per 10cm (vs. 1-2 kg/m² dry snow). Roof collapse threshold: ~400 kg/m² typical residential design. Tree branch loading: critical >25mm ice + wind >20mph (mechanical failure, power line contact). Frostbite: exposed skin -25°C = 30min to frostbite, -40°C = 10min, -50°C = 5min. Mortality multiplier: homeless (8x), vehicle stranded (4x), normal outdoor activity (1.0x).

## Safe Zones
Indoors <0°C WCI always safe. Sheltered from wind reduces WCI 5-15°C (leeward side buildings). Elevation >3000ft reduces exposure (subalpine zone, avalanche terrain). Vehicles safe if occupied + running (heat source, protection from elements). Hypothermia prevention: proper insulation, avoid wet clothing, emergency shelters 10-30km interval on major routes.

Real-time safe zones: warming centers pre-positioned (capacity validated), emergency shelters activated >-20°C WCI sustained 4+ hours. Distance: shelters <50km apart on I-corridor, <100km rural routes. Validation: heating capacity (kW), capacity beds, 24hr staffing status.

## Evacuation
Evacuation trigger: NWS Winter Storm Warning issued, OR WCI <-25°C + stranded vehicle risk, OR >12 inches/24hr + travel ban declaration. Evacuation window: 12-24hr (warning issued), <6hr (deteriorating conditions, mandatory travel ban).

Evacuation protocol: 1) activate travel ban (highway patrol enforcement), 2) pre-position salt/sand trucks (200km spacing), 3) open warming centers (capacity 50-200 per location), 4) issue shelter-in-place guidance (remain in vehicles + heat running), 5) deploy emergency response teams. Phased: voluntary 12-24hr prior, mandatory if conditions deteriorate (school closure + travel ban declaration). Constraint: EOD towing capacity (50-200 vehicles max per region, overtaxed in extreme storms).

## Vulnerability
Population exposure: rural residents >30km from warming center, homeless/unsheltered (1-5% of rural population), occupants of inadequate shelter (RVs, tents). Vulnerability class: 1-Critical (homeless, vehicles, high WCI + >5km from shelter), 2-High (rural homes >20km shelter, poor insulation), 3-Medium (suburban >10km shelter, older homes), 4-Low (urban <5km shelter, new construction). Multiplier: night (2.5x, sleeping), rural (1.8x isolation), homeless (3.0x exposure).

Infrastructure: power grid (ice accumulation on lines, 10-30 day restoration if major ice storm), roads (closure 1-7 days, cost $1-10M/county), water systems (pipe freeze, contamination). Supply chain: fuel shortages (3-14 day recovery), hospital backup power taxed (peak demand).

## Secondary Effects
Blizzard whiteout: visibility <1/4 mile (200m) defined as blizzard. Wind-driven snow particle density 0.01-0.1 g/m³ (vs. 0.5-5 g/m³ rainfall). Visibility below driving threshold (<1km). Acoustic: wind roar >80dB (psychoacoustic stress).

Avalanche risk: snow loading increases significantly (wet snow bonds weak layers, rapid wind loading). Avalanche probability escalates 2-3x post-wet snowstorm. Lake effect intensification: >20mph offshore wind + open lake (autumn/early winter) = convective bands 10-50km wide, 200-400 cm/24hr possible.

Electrical storm: 30-50% of heavy snow events include thundersnow (charge separation in updrafts, lightning 5-50 per event typical). Damage: power line strikes, ignition risk (dry vegetation). Compound hazard: wet snow + ice = load + electrical failure cascade.

## Operational Protocols
Monitoring: NAM/GFS QPF (6-hourly), temperature/dew point profiles (sounding data, balloon/model), wind direction/speed (850mb steering). Ice accretion calculation: hourly sleet/freezing rain probability from model. Decision logic: IF (QPF >0.3in liquid + temp -5 to 0°C) THEN ice risk ≥3. IF (12-hr accumulated QPF >0.8in + wind >30mph + temp <-5°C) THEN snowfall ≥3 + wind hazard ≥3.

Confidence thresholds: 65% model consensus for watch (24-48hr), 80% for warning (<24hr). Cross-check: ensemble spread (SREF, multi-model), NWS issued alert verification. Real-time update: observed snowfall rate + temperature validation (surface obs vs. model, ±2°C tolerance).

## Caching/Offline
Snowfall QPF: GeoTIFF 4km resolution, ~20MB per region. Wind field: 3D model grids (500mb, 850mb, surface), ~50MB. Temperature grid: 2m height, ~10MB. Historical: 10-year seasonal climatology (median accumulation per date, anomaly tracking). Pre-computed: WCI lookup table (temp 5°F bins, wind 5mph bins), ice accumulation curves.

Offline cache: latest NAM/GFS forecast + 48hr ensemble mean + climatology. Update sync: every 6hr (model cycle), differential (changed grid cells only, ~5-10MB). Validation: model initialization time check. Stale flag: >24hr without update (significant forecast skill loss beyond 72hr).

## Comms/UI
Map display: snowfall forecast (inches/12hr scale, gradient white-blue-purple-gray), wind gust overlay (barbs showing direction, color scale 20-40-60mph), temperature overlay (color -50/-30/-10/0°F), ice accretion zone (cross-hatch pattern, mm/hr scale). Alert card: NWS watch/warning status (headline text), snowfall total (inches, range high-low), wind gust peak (mph, time), temperature min (°F), WCI low (°F).

Push alerts: Winter Storm Watch issued (36-48hr lead), Warning issued (<24hr). Frequency: 1 alert per advisory cycle (6hr). Detail page: 72-hr snowfall accumulation (stacked bar chart by 12-hr), wind gust timeline (peak timing), temperature/WCI graph (min on x-axis), warming center locator (address, phone, capacity, hours). Road condition legend: passable/caution/closed status for major routes.

Real-time stream: observed snowfall rate (in/hr, latest wx station), current temperature, current wind gust (sustained/peak), current WCI value.

## Sensor Input
Precipitation: NOAA NWS Next-Generation Radar (NEXRAD, 0.5° resolution, 10min refresh, dual-pol discrimination for snow/rain), surface observation network (ASOS/AWOS, 1hr resolution, heated rain gauge 0.01in precision), snow gauge estimates (NOHRSC analysis, manual + automated, daily or post-event, Nipher-shielded gauges).

Temperature/wind: NOAA NWS surface stations (1hr, YSI thermistors ±0.1°C, cup anemometers 1% accuracy), upper-air soundings (balloon, 12hr launch times 0000/1200UTC, Vaisala RS41-SG), satellite brightness temp (GOES Band 13, 10.3µm, cloud-top proxy).

Road surface: RWIS (Road Weather Information System) stations <50km spacing major corridors, measure pavement surface temp (±0.5°C infrared), moisture (friction coefficient via skid meter), chemical concentration (conductivity probe, 0.1% salt accuracy). Vibrating wire sensors for pressure/load.

API: NOAA NWS (https://www.ncei.noaa.gov/products/mesonet-data/), NOAA GFS/NAM OpenDAP, state DOT RWIS feeds (MassDOT, CalTrans, CDOT etc.). Integration latency: radar <15min, surface obs 1hr, model output 4-6hr post-initialization, RWIS <5min.

Data quality: radar reflectivity Z >25 dBZ = precipitation, dual-pol algorithm (Zh-Zdr ratio) discriminates snow vs rain (rain: Zdr>1.5dB), wind outlier detection (IQR 2.5x whiskers), temperature saturation check (vs. dew point physical bounds, Tsat tolerance ±0.5°C). Real-time QC: buddy checks between adjacent ASOS stations (outlier if >3 standard deviations from neighbors).

## Multi-Hazard Compounding
Winter storm + avalanche: wet snow + precipitation → slab loading. Avalanche probability multiplier 1.3-1.6x. Windchill + avalanche burial: hypothermia onset 10-20min buried. Winter storm + power outage: backup power depletion 24-72hr (hospitals, water pumps). Extended loss cascades across 3-10 day recovery. Winter storm + landslide: saturation from snowmelt + rainfall (spring transition). Landslide trigger probability +0.2 after thaw cycles. Urban flooding: frozen ground reduces infiltration (impervious effect), runoff 5-10x normal.

## Climate-Driven Seasonal Modulation
Jet stream positioning: ridge placement 5-10° latitude shifts storm track 500+ km northward (climate teleconnections). AMO (Atlantic Multidecadal Oscillation) phase affects winter severity (warm phase +30% snowfall frequency, cold phase -20%). NAO (North Atlantic Oscillation) index seasonal modulation: positive phase shifts storms northeastward. Snow-albedo feedback: early season snow enhances cooling (temperature depression -2 to -5°C), prolongs season 1-3 weeks. Lake-effect amplification: warmer early winters (ocean heat content lag) drive heavier lake-snow bands (400-600 cm/event vs 200-400 cm baseline). Stratospheric polar vortex strength (QBO coupling) influences downstream pattern (weak vortex = +2 month winter extension probability).
