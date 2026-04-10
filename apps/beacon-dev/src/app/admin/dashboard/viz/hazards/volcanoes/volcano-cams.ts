// Per-volcano webcam entries for the detail panel.
//
// Each cam has:
//   - label: short human name for the view
//   - page:  the USGS / observatory landing page for that cam
//            (always populated, always safe to open)
//   - image: OPTIONAL direct image URL that refreshes on reload
//            If present, we try to embed it in the detail panel.
//            If it fails to load, the UI falls back to the link.
//
// IMPORTANT: Image URLs below are best-effort patterns from USGS /
// AVO / HVO public webcam pages. They may be stale or blocked by
// CORS. Verify each one on a real network before relying on them —
// the panel is designed to degrade gracefully when an image 404s.
// Preferred way to update: inspect the webcam page, copy the direct
// <img src> into the `image` field here.

export interface VolcanoCam {
  label: string;
  page: string;
  image?: string;
}

const HVO = "https://www.usgs.gov/volcanoes";
const AVO = "https://avo.alaska.edu/volcano";
const CVO = "https://www.usgs.gov/volcanoes";
const CALVO = "https://www.usgs.gov/observatories/calvo";
const YVO = "https://www.usgs.gov/volcanoes/yellowstone";

export const VOLCANO_CAMS: Record<string, VolcanoCam[]> = {
  kilauea: [
    {
      label: "Halemaʻumaʻu (KWcam, west)",
      page: `${HVO}/kilauea/webcams`,
      image: "https://volcanoes.usgs.gov/vsc/captures/kilauea/KWcam.jpg",
    },
    {
      label: "Summit caldera (K3cam, north)",
      page: `${HVO}/kilauea/webcams`,
      image: "https://volcanoes.usgs.gov/vsc/captures/kilauea/K3cam.jpg",
    },
  ],
  "mauna-loa": [
    {
      label: "Mauna Loa NE flank",
      page: `${HVO}/mauna-loa/webcams`,
      image: "https://volcanoes.usgs.gov/vsc/captures/maunaloa/MLESC.jpg",
    },
  ],
  "great-sitkin": [
    {
      label: "Great Sitkin summit",
      page: `${AVO}/great-sitkin`,
      image: "https://avo.alaska.edu/webcam/cam/GSIG.jpg",
    },
  ],
  semisopochnoi: [
    { label: "Cerberus cone", page: `${AVO}/semisopochnoi` },
  ],
  shishaldin: [
    {
      label: "Shishaldin summit",
      page: `${AVO}/shishaldin`,
      image: "https://avo.alaska.edu/webcam/cam/SSLN.jpg",
    },
  ],
  pavlof: [
    {
      label: "Pavlof from Cold Bay",
      page: `${AVO}/pavlof`,
      image: "https://avo.alaska.edu/webcam/cam/PVV.jpg",
    },
  ],
  yellowstone: [
    { label: "Old Faithful geyser", page: "https://www.nps.gov/yell/learn/photosmultimedia/webcams.htm" },
    { label: "YVO monitoring page", page: YVO },
  ],
  "long-valley": [
    { label: "Mammoth Mountain views", page: `${CALVO}` },
  ],
  "mt-hood": [
    { label: "Mt Hood north side", page: `${CVO}/mount-hood/webcams` },
  ],
  "mt-rainier": [
    {
      label: "Rainier from Camp Muir",
      page: `${CVO}/mount-rainier/webcams`,
      image: "https://volcanoes.usgs.gov/vsc/captures/rainier/RER.jpg",
    },
  ],
  lassen: [
    { label: "Lassen Peak", page: `${CALVO}` },
  ],
  newberry: [
    { label: "Newberry caldera", page: `${CVO}/newberry/webcams` },
  ],
  "crater-lake": [
    { label: "Crater Lake rim (NPS)", page: "https://www.nps.gov/crla/learn/photosmultimedia/webcams.htm" },
  ],
  "mt-baker": [
    { label: "Mt Baker summit", page: `${CVO}/mount-baker/webcams` },
  ],
  "glacier-peak": [
    { label: "Glacier Peak", page: `${CVO}/glacier-peak/webcams` },
  ],
  "mt-st-helens": [
    {
      label: "Mt St Helens crater (VolcanoCam)",
      page: `${CVO}/mount-st-helens/webcams`,
      image: "https://volcanoes.usgs.gov/vsc/captures/msh/SEPcam.jpg",
    },
  ],
  "mt-adams": [
    { label: "Mt Adams", page: `${CVO}/mount-adams/webcams` },
  ],
  "mt-jefferson": [
    { label: "Mt Jefferson", page: `${CVO}/mount-jefferson/webcams` },
  ],
  "three-sisters": [
    { label: "Three Sisters (South Sister)", page: `${CVO}/three-sisters/webcams` },
  ],
  "mt-shasta": [
    { label: "Mt Shasta north face", page: `${CALVO}` },
  ],
  "medicine-lake": [
    { label: "Medicine Lake volcano", page: `${CALVO}` },
  ],
  "clear-lake": [
    { label: "Clear Lake volcanic field", page: `${CALVO}` },
  ],
  "mono-inyo": [
    { label: "Mono-Inyo craters", page: `${CALVO}` },
  ],
  haleakala: [
    { label: "Haleakalā summit (NPS)", page: "https://www.nps.gov/hale/learn/photosmultimedia/webcams.htm" },
  ],
  "mauna-kea": [
    { label: "Mauna Kea summit", page: "https://www.ifa.hawaii.edu/mko/webcams.shtml" },
  ],
  hualalai: [
    { label: "Hualālai (Big Island)", page: `${HVO}/hualalai/webcams` },
  ],
  cleveland: [
    {
      label: "Cleveland from Nikolski",
      page: `${AVO}/cleveland`,
      image: "https://avo.alaska.edu/webcam/cam/CLCO.jpg",
    },
  ],
  veniaminof: [
    {
      label: "Veniaminof from Perryville",
      page: `${AVO}/veniaminof`,
      image: "https://avo.alaska.edu/webcam/cam/VNFG.jpg",
    },
  ],
  redoubt: [
    {
      label: "Redoubt from Hut",
      page: `${AVO}/redoubt`,
      image: "https://avo.alaska.edu/webcam/cam/DFR.jpg",
    },
  ],
  augustine: [
    {
      label: "Augustine Island",
      page: `${AVO}/augustine`,
      image: "https://avo.alaska.edu/webcam/cam/AUH.jpg",
    },
  ],
};

export function getCams(id: string): VolcanoCam[] {
  return VOLCANO_CAMS[id] ?? [];
}
