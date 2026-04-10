// Per-volcano monitoring overview: who watches it, with what sensors,
// how often data updates, and where to verify.
//
// Sources used (curated summaries — cross-check the linked status page
// before publishing): USGS Volcano Hazards Program observatory status
// pages, Smithsonian Global Volcanism Program, observatory bulletins.
//
// `sensors` is a plain-English list, not a hardware inventory.
// `level` is Beacon's own density bucket for UI weight, not official.

export type SensorKind =
  | "seismic"
  | "gps"
  | "insar"
  | "tiltmeter"
  | "gas"
  | "thermal"
  | "webcam"
  | "infrasound"
  | "lahar"
  | "strain"
  | "lightning"
  | "hydrologic";

export interface Sensor {
  kind: SensorKind;
  count?: number;
  note?: string;
}

export type MonitoringDensity = "dense" | "standard" | "sparse" | "remote";

export interface MonitoringInfo {
  operator: string;
  operatorShort: string;
  operatorUrl: string;
  density: MonitoringDensity;
  sensors: Sensor[];
  cadence: string;
  lastUpdated: string;
  statusUrl: string;
}

// Plain-English labels for sensor types.
export const SENSOR_LABEL: Record<SensorKind, string> = {
  seismic: "Seismometers",
  gps: "GPS stations",
  insar: "Satellite radar (InSAR)",
  tiltmeter: "Tiltmeters",
  gas: "Gas sensors",
  thermal: "Thermal cameras",
  webcam: "Webcams",
  infrasound: "Infrasound arrays",
  lahar: "Lahar flow sensors",
  strain: "Strain meters",
  lightning: "Lightning detectors",
  hydrologic: "Stream gauges",
};

// What each sensor type actually measures, in plain English.
// Shown as a tooltip or clickable help block.
export const SENSOR_EXPLAIN: Record<SensorKind, string> = {
  seismic: "Detect earthquakes under the volcano — the most reliable early warning that magma is moving.",
  gps: "Measure millimeter-scale ground motion to see if the volcano is swelling, sinking, or sliding.",
  insar: "Satellite radar images compared over time to map deformation across the whole volcano, including unmonitored flanks.",
  tiltmeter: "Extremely sensitive angle sensors that catch tiny ground tilting hours before an eruption.",
  gas: "Measure volcanic gases (SO₂, CO₂, H₂S) in the plume or soil — rising output can mean magma near the surface.",
  thermal: "Infrared cameras and satellites that detect heat from new lava, dome growth, or gas vents.",
  webcam: "Live visual confirmation of plumes, incandescence, or lava flows.",
  infrasound: "Low-frequency sound sensors that catch explosions and jetting even when it's cloudy or dark.",
  lahar: "Acoustic flow monitors along rivers that trigger sirens if a mudflow sweeps downstream.",
  strain: "Buried instruments that sense rock deformation smaller than a GPS can resolve.",
  lightning: "Volcanic lightning detectors that flag ash-rich explosive plumes in real time.",
  hydrologic: "River gauges and lake sensors for tracking meltwater, lahars, and crater lake changes.",
};

// Density labels for the UI chip.
export const DENSITY_LABEL: Record<MonitoringDensity, string> = {
  dense: "Dense",
  standard: "Standard",
  sparse: "Sparse",
  remote: "Remote / satellite only",
};

export const DENSITY_BLURB: Record<MonitoringDensity, string> = {
  dense: "Heavily instrumented with multiple sensor types on the volcano itself — eruption precursors are typically caught hours to days out.",
  standard: "Real-time seismic plus at least one other method (GPS, gas, or thermal). Major unrest will be caught quickly, smaller changes may lag.",
  sparse: "Limited on-site instruments. Monitoring relies heavily on regional seismic networks and satellite observations.",
  remote: "No instruments on the volcano. Monitoring is satellite-based (thermal + gas) plus distant seismic arrays.",
};

export const VOLCANO_MONITORING: Record<string, MonitoringInfo> = {
  // ───────── HVO (Hawaiʻi) ─────────
  kilauea: {
    operator: "USGS Hawaiian Volcano Observatory",
    operatorShort: "HVO",
    operatorUrl: "https://www.usgs.gov/observatories/hvo",
    density: "dense",
    sensors: [
      { kind: "seismic", count: 100, note: "dense summit + rift zone network" },
      { kind: "gps", count: 60, note: "real-time summit + East Rift Zone" },
      { kind: "tiltmeter", note: "summit + Puʻuʻōʻō area" },
      { kind: "gas", note: "continuous SO₂ at Halemaʻumaʻu + multi-gas" },
      { kind: "thermal", note: "Halemaʻumaʻu + ERZ thermal cams" },
      { kind: "webcam", count: 6, note: "KWcam, K3cam, summit + ERZ" },
      { kind: "insar", note: "Sentinel-1 every ~12 days" },
      { kind: "infrasound" },
    ],
    cadence: "Real-time seismic/GPS/gas, weekly InSAR",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/kilauea/monitoring",
  },
  "mauna-loa": {
    operator: "USGS Hawaiian Volcano Observatory",
    operatorShort: "HVO",
    operatorUrl: "https://www.usgs.gov/observatories/hvo",
    density: "dense",
    sensors: [
      { kind: "seismic", count: 40 },
      { kind: "gps", count: 25, note: "summit + flanks" },
      { kind: "tiltmeter" },
      { kind: "gas", note: "fumarole sampling" },
      { kind: "thermal" },
      { kind: "webcam", count: 2, note: "MLESC summit, MKCM NE Rift" },
      { kind: "insar" },
    ],
    cadence: "Real-time seismic/GPS, weekly InSAR",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/mauna-loa/monitoring",
  },
  haleakala: {
    operator: "USGS Hawaiian Volcano Observatory",
    operatorShort: "HVO",
    operatorUrl: "https://www.usgs.gov/observatories/hvo",
    density: "sparse",
    sensors: [
      { kind: "seismic", count: 3, note: "nearest stations on Maui" },
      { kind: "gps", count: 2 },
      { kind: "insar" },
    ],
    cadence: "Continuous seismic, periodic InSAR",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/haleakala/monitoring",
  },
  "mauna-kea": {
    operator: "USGS Hawaiian Volcano Observatory",
    operatorShort: "HVO",
    operatorUrl: "https://www.usgs.gov/observatories/hvo",
    density: "sparse",
    sensors: [
      { kind: "seismic", count: 4 },
      { kind: "gps", count: 3 },
      { kind: "insar" },
    ],
    cadence: "Continuous seismic, periodic InSAR",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/mauna-kea/monitoring",
  },
  hualalai: {
    operator: "USGS Hawaiian Volcano Observatory",
    operatorShort: "HVO",
    operatorUrl: "https://www.usgs.gov/observatories/hvo",
    density: "sparse",
    sensors: [
      { kind: "seismic", count: 3 },
      { kind: "gps", count: 2 },
      { kind: "insar" },
    ],
    cadence: "Continuous seismic, periodic InSAR",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/hualalai/monitoring",
  },

  // ───────── YVO (Yellowstone) ─────────
  yellowstone: {
    operator: "Yellowstone Volcano Observatory (USGS + Univ. Utah + NPS + partners)",
    operatorShort: "YVO",
    operatorUrl: "https://www.usgs.gov/observatories/yvo",
    density: "dense",
    sensors: [
      { kind: "seismic", count: 27, note: "UUSS-run Yellowstone network" },
      { kind: "gps", count: 20, note: "Plate Boundary Observatory" },
      { kind: "strain", count: 6, note: "borehole strain meters" },
      { kind: "gas", note: "continuous H₂S/CO₂ at Mud Volcano + Norris" },
      { kind: "thermal", note: "airborne hyperspectral flights + satellite" },
      { kind: "hydrologic", note: "stream + lake temperature gauges" },
      { kind: "webcam", count: 4, note: "Old Faithful, Mud Volcano, others" },
      { kind: "insar" },
    ],
    cadence: "Real-time seismic/GPS/strain, monthly InSAR + thermal",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/yellowstone/monitoring",
  },

  // ───────── CalVO (California) ─────────
  "long-valley": {
    operator: "California Volcano Observatory",
    operatorShort: "CalVO",
    operatorUrl: "https://www.usgs.gov/observatories/calvo",
    density: "dense",
    sensors: [
      { kind: "seismic", count: 20 },
      { kind: "gps", count: 15 },
      { kind: "strain", count: 2 },
      { kind: "gas", note: "CO₂ soil flux at Mammoth Mountain tree-kill zone" },
      { kind: "insar" },
      { kind: "webcam", count: 2 },
    ],
    cadence: "Real-time seismic/GPS/strain, weekly InSAR",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/long-valley-caldera/monitoring",
  },
  lassen: {
    operator: "California Volcano Observatory",
    operatorShort: "CalVO",
    operatorUrl: "https://www.usgs.gov/observatories/calvo",
    density: "standard",
    sensors: [
      { kind: "seismic", count: 8 },
      { kind: "gps", count: 5 },
      { kind: "insar" },
      { kind: "webcam", count: 1 },
    ],
    cadence: "Real-time seismic/GPS, monthly InSAR",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/lassen-volcanic-center/monitoring",
  },
  "mt-shasta": {
    operator: "California Volcano Observatory",
    operatorShort: "CalVO",
    operatorUrl: "https://www.usgs.gov/observatories/calvo",
    density: "standard",
    sensors: [
      { kind: "seismic", count: 6 },
      { kind: "gps", count: 4 },
      { kind: "insar" },
    ],
    cadence: "Real-time seismic/GPS, monthly InSAR",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/mount-shasta/monitoring",
  },
  "medicine-lake": {
    operator: "California Volcano Observatory",
    operatorShort: "CalVO",
    operatorUrl: "https://www.usgs.gov/observatories/calvo",
    density: "sparse",
    sensors: [
      { kind: "seismic", count: 3 },
      { kind: "gps", count: 2 },
      { kind: "insar", note: "Medicine Lake is subsiding — key InSAR target" },
    ],
    cadence: "Continuous seismic, monthly InSAR",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/medicine-lake-volcano/monitoring",
  },
  "clear-lake": {
    operator: "California Volcano Observatory",
    operatorShort: "CalVO",
    operatorUrl: "https://www.usgs.gov/observatories/calvo",
    density: "sparse",
    sensors: [
      { kind: "seismic", count: 3 },
      { kind: "gps", count: 2 },
      { kind: "gas", note: "The Geysers CO₂ soil flux" },
    ],
    cadence: "Continuous seismic, periodic gas surveys",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/clear-lake-volcanic-field/monitoring",
  },
  "mono-inyo": {
    operator: "California Volcano Observatory",
    operatorShort: "CalVO",
    operatorUrl: "https://www.usgs.gov/observatories/calvo",
    density: "standard",
    sensors: [
      { kind: "seismic", count: 10, note: "shared with Long Valley network" },
      { kind: "gps", count: 6 },
      { kind: "insar" },
    ],
    cadence: "Real-time seismic/GPS, monthly InSAR",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/mono-inyo-craters/monitoring",
  },

  // ───────── CVO (Cascades) ─────────
  "mt-hood": {
    operator: "Cascades Volcano Observatory",
    operatorShort: "CVO",
    operatorUrl: "https://www.usgs.gov/observatories/cvo",
    density: "standard",
    sensors: [
      { kind: "seismic", count: 7, note: "PNSN" },
      { kind: "gps", count: 4 },
      { kind: "gas", note: "periodic summit fumarole sampling" },
      { kind: "insar" },
    ],
    cadence: "Real-time seismic/GPS, monthly InSAR",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/mount-hood/monitoring",
  },
  "mt-rainier": {
    operator: "Cascades Volcano Observatory",
    operatorShort: "CVO",
    operatorUrl: "https://www.usgs.gov/observatories/cvo",
    density: "dense",
    sensors: [
      { kind: "seismic", count: 12, note: "PNSN Rainier network" },
      { kind: "gps", count: 8 },
      { kind: "lahar", count: 8, note: "Rainier Lahar Detection System along Puyallup + Carbon rivers" },
      { kind: "gas" },
      { kind: "thermal" },
      { kind: "webcam", count: 2, note: "RER + Paradise" },
      { kind: "insar" },
    ],
    cadence: "Real-time seismic/GPS/lahar, monthly InSAR",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/mount-rainier/monitoring",
  },
  "mt-baker": {
    operator: "Cascades Volcano Observatory",
    operatorShort: "CVO",
    operatorUrl: "https://www.usgs.gov/observatories/cvo",
    density: "standard",
    sensors: [
      { kind: "seismic", count: 5 },
      { kind: "gps", count: 3 },
      { kind: "gas", note: "Sherman Crater fumarole sampling" },
      { kind: "insar" },
    ],
    cadence: "Real-time seismic/GPS, monthly InSAR",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/mount-baker/monitoring",
  },
  "glacier-peak": {
    operator: "Cascades Volcano Observatory",
    operatorShort: "CVO",
    operatorUrl: "https://www.usgs.gov/observatories/cvo",
    density: "sparse",
    sensors: [
      { kind: "seismic", count: 3 },
      { kind: "gps", count: 2 },
      { kind: "insar" },
    ],
    cadence: "Continuous seismic, periodic InSAR",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/glacier-peak/monitoring",
  },
  "mt-st-helens": {
    operator: "Cascades Volcano Observatory",
    operatorShort: "CVO",
    operatorUrl: "https://www.usgs.gov/observatories/cvo",
    density: "dense",
    sensors: [
      { kind: "seismic", count: 20, note: "PNSN + CVO crater network" },
      { kind: "gps", count: 10, note: "crater + flanks" },
      { kind: "gas", note: "SO₂ DOAS + flyover sampling" },
      { kind: "thermal", note: "crater + dome thermal cams" },
      { kind: "webcam", count: 3, note: "SEPcam, Johnston Ridge, Coldwater" },
      { kind: "insar" },
    ],
    cadence: "Real-time seismic/GPS/gas, weekly InSAR",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/mount-st-helens/monitoring",
  },
  "mt-adams": {
    operator: "Cascades Volcano Observatory",
    operatorShort: "CVO",
    operatorUrl: "https://www.usgs.gov/observatories/cvo",
    density: "sparse",
    sensors: [
      { kind: "seismic", count: 2 },
      { kind: "gps", count: 2 },
      { kind: "insar" },
    ],
    cadence: "Continuous seismic, periodic InSAR",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/mount-adams/monitoring",
  },
  "mt-jefferson": {
    operator: "Cascades Volcano Observatory",
    operatorShort: "CVO",
    operatorUrl: "https://www.usgs.gov/observatories/cvo",
    density: "sparse",
    sensors: [
      { kind: "seismic", count: 2 },
      { kind: "gps", count: 1 },
      { kind: "insar" },
    ],
    cadence: "Continuous seismic, periodic InSAR",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/mount-jefferson/monitoring",
  },
  "three-sisters": {
    operator: "Cascades Volcano Observatory",
    operatorShort: "CVO",
    operatorUrl: "https://www.usgs.gov/observatories/cvo",
    density: "standard",
    sensors: [
      { kind: "seismic", count: 6 },
      { kind: "gps", count: 5, note: "tracking South Sister uplift since 1997" },
      { kind: "insar", note: "key target — South Sister uplift" },
    ],
    cadence: "Real-time seismic/GPS, monthly InSAR",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/three-sisters/monitoring",
  },
  newberry: {
    operator: "Cascades Volcano Observatory",
    operatorShort: "CVO",
    operatorUrl: "https://www.usgs.gov/observatories/cvo",
    density: "standard",
    sensors: [
      { kind: "seismic", count: 5 },
      { kind: "gps", count: 3 },
      { kind: "gas", note: "caldera CO₂ monitoring" },
      { kind: "insar" },
    ],
    cadence: "Real-time seismic/GPS, monthly InSAR",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/newberry-volcano/monitoring",
  },
  "crater-lake": {
    operator: "Cascades Volcano Observatory",
    operatorShort: "CVO",
    operatorUrl: "https://www.usgs.gov/observatories/cvo",
    density: "standard",
    sensors: [
      { kind: "seismic", count: 4 },
      { kind: "gps", count: 2 },
      { kind: "hydrologic", note: "lake temperature + level" },
      { kind: "insar" },
    ],
    cadence: "Real-time seismic, monthly InSAR",
    lastUpdated: "2026-04",
    statusUrl: "https://www.usgs.gov/volcanoes/crater-lake/monitoring",
  },

  // ───────── AVO (Alaska) ─────────
  "great-sitkin": {
    operator: "Alaska Volcano Observatory (USGS + UAF + State)",
    operatorShort: "AVO",
    operatorUrl: "https://avo.alaska.edu/",
    density: "standard",
    sensors: [
      { kind: "seismic", count: 6, note: "on-island network" },
      { kind: "infrasound" },
      { kind: "thermal", note: "satellite + webcam" },
      { kind: "webcam", count: 1, note: "GSIG" },
    ],
    cadence: "Real-time seismic/infrasound, satellite thermal hourly",
    lastUpdated: "2026-04",
    statusUrl: "https://avo.alaska.edu/volcano/greatsitkin",
  },
  semisopochnoi: {
    operator: "Alaska Volcano Observatory",
    operatorShort: "AVO",
    operatorUrl: "https://avo.alaska.edu/",
    density: "remote",
    sensors: [
      { kind: "seismic", count: 4, note: "remote island network, often offline" },
      { kind: "infrasound", note: "distant arrays in the Aleutians" },
      { kind: "thermal", note: "satellite only" },
      { kind: "lightning" },
    ],
    cadence: "Seismic when available, satellite thermal + lightning hourly",
    lastUpdated: "2026-04",
    statusUrl: "https://avo.alaska.edu/volcano/semisopochnoi",
  },
  shishaldin: {
    operator: "Alaska Volcano Observatory",
    operatorShort: "AVO",
    operatorUrl: "https://avo.alaska.edu/",
    density: "standard",
    sensors: [
      { kind: "seismic", count: 5 },
      { kind: "infrasound" },
      { kind: "thermal" },
      { kind: "webcam", count: 1, note: "SSLN" },
      { kind: "lightning" },
    ],
    cadence: "Real-time seismic/infrasound, satellite hourly",
    lastUpdated: "2026-04",
    statusUrl: "https://avo.alaska.edu/volcano/shishaldin",
  },
  pavlof: {
    operator: "Alaska Volcano Observatory",
    operatorShort: "AVO",
    operatorUrl: "https://avo.alaska.edu/",
    density: "standard",
    sensors: [
      { kind: "seismic", count: 6 },
      { kind: "infrasound" },
      { kind: "thermal" },
      { kind: "webcam", count: 1, note: "PVV" },
    ],
    cadence: "Real-time seismic/infrasound, satellite hourly",
    lastUpdated: "2026-04",
    statusUrl: "https://avo.alaska.edu/volcano/pavlof",
  },
  cleveland: {
    operator: "Alaska Volcano Observatory",
    operatorShort: "AVO",
    operatorUrl: "https://avo.alaska.edu/",
    density: "remote",
    sensors: [
      { kind: "seismic", count: 2, note: "distant Chuginadak stations" },
      { kind: "infrasound", note: "Okmok + Dillingham arrays" },
      { kind: "thermal", note: "satellite only" },
      { kind: "webcam", count: 1, note: "CLCO — distant view" },
      { kind: "lightning" },
    ],
    cadence: "Satellite thermal hourly, infrasound real-time",
    lastUpdated: "2026-04",
    statusUrl: "https://avo.alaska.edu/volcano/cleveland",
  },
  veniaminof: {
    operator: "Alaska Volcano Observatory",
    operatorShort: "AVO",
    operatorUrl: "https://avo.alaska.edu/",
    density: "standard",
    sensors: [
      { kind: "seismic", count: 5 },
      { kind: "infrasound" },
      { kind: "thermal" },
      { kind: "webcam", count: 1, note: "VNFG" },
    ],
    cadence: "Real-time seismic/infrasound, satellite hourly",
    lastUpdated: "2026-04",
    statusUrl: "https://avo.alaska.edu/volcano/veniaminof",
  },
  redoubt: {
    operator: "Alaska Volcano Observatory",
    operatorShort: "AVO",
    operatorUrl: "https://avo.alaska.edu/",
    density: "dense",
    sensors: [
      { kind: "seismic", count: 9 },
      { kind: "gps", count: 4 },
      { kind: "infrasound" },
      { kind: "gas", note: "periodic flyover sampling" },
      { kind: "thermal" },
      { kind: "webcam", count: 1, note: "DFR" },
      { kind: "insar" },
    ],
    cadence: "Real-time seismic/GPS, satellite hourly",
    lastUpdated: "2026-04",
    statusUrl: "https://avo.alaska.edu/volcano/redoubt",
  },
  augustine: {
    operator: "Alaska Volcano Observatory",
    operatorShort: "AVO",
    operatorUrl: "https://avo.alaska.edu/",
    density: "dense",
    sensors: [
      { kind: "seismic", count: 10, note: "on-island network" },
      { kind: "gps", count: 6 },
      { kind: "infrasound" },
      { kind: "thermal" },
      { kind: "webcam", count: 1, note: "AUH" },
      { kind: "insar" },
    ],
    cadence: "Real-time seismic/GPS, satellite hourly",
    lastUpdated: "2026-04",
    statusUrl: "https://avo.alaska.edu/volcano/augustine",
  },

  // ───────── INGV — Osservatorio Vesuviano + Etneo (Italy) ─────────
  "campi-flegrei": {
    operator: "INGV Osservatorio Vesuviano (Naples Section)",
    operatorShort: "INGV-OV",
    operatorUrl: "https://www.ov.ingv.it/",
    density: "dense",
    sensors: [
      { kind: "seismic", count: 25, note: "dense caldera network incl. seafloor stations in the Bay of Pozzuoli" },
      { kind: "gps", count: 20, note: "cGPS network tracking bradyseismic uplift" },
      { kind: "tiltmeter", note: "borehole tiltmeters around the caldera" },
      { kind: "gas", note: "continuous CO₂ + H₂S flux at Solfatara + Pisciarelli fumaroles" },
      { kind: "hydrologic", note: "tide gauges in Pozzuoli Harbor for ground uplift" },
      { kind: "thermal", note: "Solfatara + Pisciarelli thermal cams + satellite" },
      { kind: "webcam", count: 3, note: "Solfatara, Pozzuoli, Pisciarelli" },
      { kind: "insar", note: "Sentinel-1 every ~6 days — primary tool for tracking uplift" },
      { kind: "strain" },
    ],
    cadence: "Real-time seismic/GPS/gas, weekly INGV bulletin",
    lastUpdated: "2026-04",
    statusUrl: "https://www.ov.ingv.it/index.php/monitoraggio-e-infrastrutture/bollettini-tutti",
  },
  vesuvius: {
    operator: "INGV Osservatorio Vesuviano (Naples Section)",
    operatorShort: "INGV-OV",
    operatorUrl: "https://www.ov.ingv.it/",
    density: "dense",
    sensors: [
      { kind: "seismic", count: 20, note: "dense cone network" },
      { kind: "gps", count: 12 },
      { kind: "tiltmeter" },
      { kind: "gas", note: "continuous CO₂ + H₂S at summit crater fumaroles" },
      { kind: "thermal" },
      { kind: "webcam", count: 2 },
      { kind: "insar" },
    ],
    cadence: "Real-time seismic/GPS, weekly INGV bulletin",
    lastUpdated: "2026-04",
    statusUrl: "https://www.ov.ingv.it/index.php/monitoraggio-e-infrastrutture/bollettini-tutti",
  },
  etna: {
    operator: "INGV Osservatorio Etneo (Catania Section)",
    operatorShort: "INGV-OE",
    operatorUrl: "https://www.ct.ingv.it/",
    density: "dense",
    sensors: [
      { kind: "seismic", count: 40, note: "one of the densest volcano seismic networks in the world" },
      { kind: "gps", count: 35 },
      { kind: "tiltmeter" },
      { kind: "strain" },
      { kind: "gas", note: "continuous SO₂ scanning + plume CO₂/SO₂ ratios" },
      { kind: "thermal", note: "summit craters + flank vents" },
      { kind: "webcam", count: 8, note: "Catania, Linguaglossa, Bronte, Montagnola, etc." },
      { kind: "infrasound", count: 8 },
      { kind: "insar" },
      { kind: "lightning", note: "volcanic lightning during paroxysms" },
    ],
    cadence: "Real-time seismic/GPS/gas/infrasound, weekly INGV bulletin",
    lastUpdated: "2026-04",
    statusUrl: "https://www.ct.ingv.it/index.php/monitoraggio-e-sorveglianza/bollettini",
  },
  stromboli: {
    operator: "INGV Osservatorio Etneo (Catania Section)",
    operatorShort: "INGV-OE",
    operatorUrl: "https://www.ct.ingv.it/",
    density: "dense",
    sensors: [
      { kind: "seismic", count: 14, note: "on-island network" },
      { kind: "gps", count: 12 },
      { kind: "tiltmeter" },
      { kind: "strain" },
      { kind: "gas", note: "continuous SO₂ + CO₂ at summit" },
      { kind: "thermal", note: "crater thermal cams" },
      { kind: "webcam", count: 4, note: "Pizzo, Sciara del Fuoco, 190m ridge, Labronzo" },
      { kind: "infrasound", count: 6 },
      { kind: "hydrologic", note: "tide gauges around the island for tsunami from pyroclastic collapse" },
    ],
    cadence: "Real-time seismic/GPS/gas/thermal/infrasound",
    lastUpdated: "2026-04",
    statusUrl: "https://www.ct.ingv.it/index.php/monitoraggio-e-sorveglianza/bollettini",
  },
  vulcano: {
    operator: "INGV Osservatorio Etneo (Catania Section)",
    operatorShort: "INGV-OE",
    operatorUrl: "https://www.ct.ingv.it/",
    density: "dense",
    sensors: [
      { kind: "seismic", count: 10 },
      { kind: "gps", count: 8 },
      { kind: "gas", note: "continuous CO₂ + temperature at La Fossa fumaroles — drove the 2021 Yellow alert" },
      { kind: "thermal" },
      { kind: "webcam", count: 3 },
      { kind: "insar" },
    ],
    cadence: "Real-time seismic/GPS/gas, weekly INGV bulletin",
    lastUpdated: "2026-04",
    statusUrl: "https://www.ct.ingv.it/index.php/monitoraggio-e-sorveglianza/bollettini",
  },
};

// Default for volcanoes without curated monitoring data (e.g. global
// additions from GVP). Safe to render without a source link.
export const DEFAULT_MONITORING: MonitoringInfo = {
  operator: "Not curated yet",
  operatorShort: "—",
  operatorUrl: "https://volcano.si.edu/",
  density: "sparse",
  sensors: [],
  cadence: "See Smithsonian GVP page",
  lastUpdated: "2026-04",
  statusUrl: "https://volcano.si.edu/",
};

export function getMonitoring(id: string): MonitoringInfo | undefined {
  return VOLCANO_MONITORING[id];
}
