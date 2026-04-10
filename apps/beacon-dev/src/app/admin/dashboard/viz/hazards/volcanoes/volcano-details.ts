// Per-volcano reference data for the detail panel.
// Threat ranks are from the USGS 2018 National Volcanic Threat
// Assessment (open-file report 2018-1115). Webcam URLs point at
// the observatory's public webcam landing page for each volcano.
// Deformation notes are short curated summaries linking to the
// observatory's deformation monitoring page.

export type ThreatRank = "very-high" | "high" | "moderate" | "low";

export interface VolcanoDetail {
  id: string;
  overview: string;
  threatRank: ThreatRank;
  webcamUrl: string;
  webcamLabel: string;
  deformationUrl: string;
  deformationNote: string;
  hazardZones: string;
}

// Keyed by volcano id (same ids as volcano-data.ts).
export const VOLCANO_DETAILS: Record<string, VolcanoDetail> = {
  kilauea: {
    id: "kilauea",
    overview:
      "One of the world's most active volcanoes. Shield volcano on the southeast flank of the Big Island. Nearly continuous eruptive activity from 1983 to 2018, followed by a caldera collapse in 2018 and renewed summit eruptions through 2024.",
    threatRank: "very-high",
    webcamUrl: "https://www.usgs.gov/volcanoes/kilauea/webcams",
    webcamLabel: "HVO Kīlauea webcams",
    deformationUrl: "https://www.usgs.gov/volcanoes/kilauea/deformation",
    deformationNote:
      "Continuous GPS + tiltmeter network across the summit and East Rift Zone. HVO publishes daily updates.",
    hazardZones: "Lava flow hazard zones 1–3 cover most of the lower East Rift.",
  },
  "mauna-loa": {
    id: "mauna-loa",
    overview:
      "Largest active volcano on Earth by volume. Shield volcano that makes up most of the Big Island. Erupted in late 2022 after 38 years of quiet.",
    threatRank: "very-high",
    webcamUrl: "https://www.usgs.gov/volcanoes/mauna-loa/webcams",
    webcamLabel: "HVO Mauna Loa webcams",
    deformationUrl: "https://www.usgs.gov/volcanoes/mauna-loa/deformation",
    deformationNote:
      "Dense GPS network on the flanks. Summit inflation has been ongoing since the 2022 eruption ended.",
    hazardZones: "Lava flow hazard zones 1–6; SW Rift Zone flows can reach Kona in hours.",
  },
  "great-sitkin": {
    id: "great-sitkin",
    overview:
      "Stratovolcano in the central Aleutians. Effusive dome-building eruption has been ongoing in the summit crater since 2021.",
    threatRank: "high",
    webcamUrl: "https://avo.alaska.edu/volcano/great-sitkin",
    webcamLabel: "AVO Great Sitkin webcams",
    deformationUrl: "https://avo.alaska.edu/volcano/great-sitkin",
    deformationNote:
      "Satellite InSAR + a small GPS network. Inflation pattern consistent with shallow magma supply.",
    hazardZones: "Ash cloud hazards to North Pacific air traffic corridor.",
  },
  semisopochnoi: {
    id: "semisopochnoi",
    overview:
      "Young caldera with multiple cones in the western Aleutians. Recurrent ash emissions from Mount Cerberus since 2019.",
    threatRank: "moderate",
    webcamUrl: "https://avo.alaska.edu/volcano/semisopochnoi",
    webcamLabel: "AVO Semisopochnoi webcams",
    deformationUrl: "https://avo.alaska.edu/volcano/semisopochnoi",
    deformationNote:
      "Mostly satellite-based monitoring (remote island). Small InSAR signals over the past several years.",
    hazardZones: "Ash plume hazards to North Pacific aviation.",
  },
  shishaldin: {
    id: "shishaldin",
    overview:
      "Symmetrical stratovolcano on Unimak Island, one of the most active in the Aleutian arc. 2019–2020 and 2023 eruption sequences produced ash plumes and lava flows.",
    threatRank: "high",
    webcamUrl: "https://avo.alaska.edu/volcano/shishaldin",
    webcamLabel: "AVO Shishaldin webcams",
    deformationUrl: "https://avo.alaska.edu/volcano/shishaldin",
    deformationNote:
      "Seismic + GPS. Episodic inflation precedes explosive phases.",
    hazardZones: "Ashfall in coastal Unimak; aviation ash clouds.",
  },
  pavlof: {
    id: "pavlof",
    overview:
      "Highly active stratovolcano on the Alaska Peninsula. Dozens of eruptions documented since the early 1900s, typically Strombolian with lava fountains and ash columns.",
    threatRank: "high",
    webcamUrl: "https://avo.alaska.edu/volcano/pavlof",
    webcamLabel: "AVO Pavlof webcams",
    deformationUrl: "https://avo.alaska.edu/volcano/pavlof",
    deformationNote: "Seismic + GPS network on the flanks.",
    hazardZones: "Ashfall in Cold Bay; aviation corridor exposure.",
  },
  yellowstone: {
    id: "yellowstone",
    overview:
      "Continental caldera system. Last large caldera-forming eruption 640 ka. Ongoing hydrothermal and deformation activity; no eruption is considered imminent.",
    threatRank: "high",
    webcamUrl: "https://www.usgs.gov/volcanoes/yellowstone/webcams",
    webcamLabel: "YVO Yellowstone webcams",
    deformationUrl: "https://www.usgs.gov/volcanoes/yellowstone/deformation",
    deformationNote:
      "Continuous GPS at dozens of sites. Caldera floor shows decadal cycles of uplift and subsidence.",
    hazardZones: "Hydrothermal hazards (geysers, ground) far exceed volcanic risk day-to-day.",
  },
  "long-valley": {
    id: "long-valley",
    overview:
      "Caldera in eastern California. Unrest episodes with uplift and earthquake swarms have occurred repeatedly since 1980.",
    threatRank: "very-high",
    webcamUrl: "https://www.usgs.gov/volcanoes/long-valley",
    webcamLabel: "CalVO Long Valley page",
    deformationUrl: "https://www.usgs.gov/volcanoes/long-valley/deformation",
    deformationNote:
      "Resurgent dome has been slowly inflating in recent years after earlier subsidence.",
    hazardZones: "Ashfall, pyroclastic, and lahar zones around Mammoth Lakes area.",
  },
  "mt-hood": {
    id: "mt-hood",
    overview:
      "Stratovolcano in northern Oregon. Most recent eruptive activity in the late 1700s–1800s produced lava domes and pyroclastic flows on the south flank.",
    threatRank: "very-high",
    webcamUrl: "https://www.usgs.gov/volcanoes/mount-hood/webcams",
    webcamLabel: "CVO Mount Hood webcams",
    deformationUrl: "https://www.usgs.gov/volcanoes/mount-hood/deformation",
    deformationNote:
      "GPS network on the flanks; background deformation has been stable.",
    hazardZones: "Lahar hazard corridors follow the Sandy and Hood Rivers.",
  },
  "mt-rainier": {
    id: "mt-rainier",
    overview:
      "Tallest volcano in the Cascades. Extensively glaciated. Lahar generation from flank collapse or eruption is the primary hazard to surrounding Puget lowlands.",
    threatRank: "very-high",
    webcamUrl: "https://www.usgs.gov/volcanoes/mount-rainier/webcams",
    webcamLabel: "CVO Mount Rainier webcams",
    deformationUrl: "https://www.usgs.gov/volcanoes/mount-rainier/deformation",
    deformationNote: "Seismic + GPS + an operational lahar detection system.",
    hazardZones: "Lahar inundation zones reach Orting, Sumner, and Puyallup.",
  },
  lassen: {
    id: "lassen",
    overview:
      "Southernmost Cascade volcano in California. 1914–1917 eruption was the last in the lower-48 before Mount St. Helens 1980.",
    threatRank: "very-high",
    webcamUrl: "https://www.usgs.gov/volcanoes/lassen-volcanic-center/webcams",
    webcamLabel: "CalVO Lassen webcams",
    deformationUrl: "https://www.usgs.gov/volcanoes/lassen-volcanic-center/deformation",
    deformationNote: "GPS network across the Lassen volcanic center.",
    hazardZones: "Proximal hazards within Lassen Volcanic National Park.",
  },
  newberry: {
    id: "newberry",
    overview:
      "Shield-shaped caldera volcano in central Oregon. Last erupted about 1,300 years ago with rhyolitic domes and obsidian flows.",
    threatRank: "very-high",
    webcamUrl: "https://www.usgs.gov/volcanoes/newberry",
    webcamLabel: "CVO Newberry page",
    deformationUrl: "https://www.usgs.gov/volcanoes/newberry/deformation",
    deformationNote: "Small GPS network; stable baseline.",
    hazardZones: "Proximal tephra and lava flow hazards around Newberry caldera.",
  },
  "crater-lake": {
    id: "crater-lake",
    overview:
      "Caldera formed by the climactic eruption of Mount Mazama ~7,700 years ago. Subsequent activity built Wizard Island inside the caldera.",
    threatRank: "high",
    webcamUrl: "https://www.usgs.gov/volcanoes/crater-lake/webcams",
    webcamLabel: "CVO Crater Lake webcams",
    deformationUrl: "https://www.usgs.gov/volcanoes/crater-lake/deformation",
    deformationNote: "Lake-level monitoring + small GPS network.",
    hazardZones: "Proximal hazards limited to the caldera rim area.",
  },
  "mt-baker": {
    id: "mt-baker",
    overview:
      "Glaciated stratovolcano in northern Washington. Increased fumarolic activity at Sherman Crater in 1975 prompted heightened monitoring.",
    threatRank: "very-high",
    webcamUrl: "https://www.usgs.gov/volcanoes/mount-baker/webcams",
    webcamLabel: "CVO Mount Baker webcams",
    deformationUrl: "https://www.usgs.gov/volcanoes/mount-baker/deformation",
    deformationNote: "GPS + gas monitoring at Sherman Crater.",
    hazardZones: "Lahar corridors down the Nooksack and Baker River valleys.",
  },
  "glacier-peak": {
    id: "glacier-peak",
    overview:
      "Remote Cascade stratovolcano in Washington. Explosive history includes several large eruptions in the last 15,000 years.",
    threatRank: "very-high",
    webcamUrl: "https://www.usgs.gov/volcanoes/glacier-peak",
    webcamLabel: "CVO Glacier Peak page",
    deformationUrl: "https://www.usgs.gov/volcanoes/glacier-peak/deformation",
    deformationNote: "Sparse in-situ monitoring due to remoteness.",
    hazardZones: "Large lahar potential down the Sauk and Skagit rivers.",
  },
  "mt-st-helens": {
    id: "mt-st-helens",
    overview:
      "Famous 1980 lateral-blast eruption. Active dome-building in 2004–2008. Still considered the most likely Cascade volcano to erupt next.",
    threatRank: "very-high",
    webcamUrl: "https://www.usgs.gov/volcanoes/mount-st.-helens/webcams",
    webcamLabel: "CVO Mount St. Helens webcams",
    deformationUrl: "https://www.usgs.gov/volcanoes/mount-st.-helens/deformation",
    deformationNote: "Dense seismic + GPS network. Baseline is currently stable.",
    hazardZones: "Lahar corridors down the Toutle River.",
  },
  "mt-adams": {
    id: "mt-adams",
    overview:
      "Second largest Cascade stratovolcano. Last eruption roughly 1,000 years ago. Mostly monogenetic vents on flanks.",
    threatRank: "high",
    webcamUrl: "https://www.usgs.gov/volcanoes/mount-adams",
    webcamLabel: "CVO Mount Adams page",
    deformationUrl: "https://www.usgs.gov/volcanoes/mount-adams/deformation",
    deformationNote: "Sparse in-situ monitoring.",
    hazardZones: "Lahar and rockfall corridors on the east flank.",
  },
  "mt-jefferson": {
    id: "mt-jefferson",
    overview:
      "Deeply eroded Oregon stratovolcano. Last activity ~950 years ago. Explosive history includes Plinian eruptions.",
    threatRank: "high",
    webcamUrl: "https://www.usgs.gov/volcanoes/mount-jefferson",
    webcamLabel: "CVO Mount Jefferson page",
    deformationUrl: "https://www.usgs.gov/volcanoes/mount-jefferson/deformation",
    deformationNote: "Sparse in-situ monitoring.",
    hazardZones: "Lahar corridors in headwater tributaries.",
  },
  "three-sisters": {
    id: "three-sisters",
    overview:
      "Cluster of Cascade stratovolcanoes in Oregon. A broad uplift west of South Sister began in 1997 and has since slowed.",
    threatRank: "very-high",
    webcamUrl: "https://www.usgs.gov/volcanoes/three-sisters/webcams",
    webcamLabel: "CVO Three Sisters webcams",
    deformationUrl: "https://www.usgs.gov/volcanoes/three-sisters/deformation",
    deformationNote:
      "Continuous GPS has tracked the West Sister uplift for two decades; rate has slowed to near-zero.",
    hazardZones: "Proximal tephra and lahar hazards in the central Cascades.",
  },
  "mt-shasta": {
    id: "mt-shasta",
    overview:
      "Massive Cascade stratovolcano in northern California. Debris avalanches and pyroclastic flows are the dominant hazards.",
    threatRank: "very-high",
    webcamUrl: "https://www.usgs.gov/volcanoes/mount-shasta/webcams",
    webcamLabel: "CalVO Mount Shasta webcams",
    deformationUrl: "https://www.usgs.gov/volcanoes/mount-shasta/deformation",
    deformationNote: "GPS network around the flanks.",
    hazardZones: "Lahar and debris-avalanche corridors reach McCloud and Mount Shasta City.",
  },
  "medicine-lake": {
    id: "medicine-lake",
    overview:
      "Large shield volcano in northeast California. Produced obsidian domes and basaltic flows as recently as 950 years ago.",
    threatRank: "high",
    webcamUrl: "https://www.usgs.gov/volcanoes/medicine-lake",
    webcamLabel: "CalVO Medicine Lake page",
    deformationUrl: "https://www.usgs.gov/volcanoes/medicine-lake/deformation",
    deformationNote:
      "Long-term subsidence of the caldera floor has been tracked by GPS + InSAR since the 1980s.",
    hazardZones: "Proximal lava flow and tephra hazards in the volcanic highland.",
  },
  "clear-lake": {
    id: "clear-lake",
    overview:
      "Volcanic field in northern California. Most recent activity ~10,000 years ago. Ongoing geothermal system (The Geysers).",
    threatRank: "moderate",
    webcamUrl: "https://www.usgs.gov/volcanoes/clear-lake",
    webcamLabel: "CalVO Clear Lake page",
    deformationUrl: "https://www.usgs.gov/volcanoes/clear-lake/deformation",
    deformationNote:
      "The Geysers geothermal field shows well-documented subsidence from production.",
    hazardZones: "Mostly geothermal and CO2 hazards in Lake County.",
  },
  "mono-inyo": {
    id: "mono-inyo",
    overview:
      "Young chain of rhyolitic domes and craters along the east side of the Sierra. Last eruption about 250 years ago at Paoha Island in Mono Lake.",
    threatRank: "high",
    webcamUrl: "https://www.usgs.gov/volcanoes/mono-inyo-craters",
    webcamLabel: "CalVO Mono-Inyo page",
    deformationUrl: "https://www.usgs.gov/volcanoes/mono-inyo-craters/deformation",
    deformationNote: "GPS network overlaps with Long Valley monitoring.",
    hazardZones: "Proximal tephra and dome-collapse hazards along Hwy 395 corridor.",
  },
  haleakala: {
    id: "haleakala",
    overview:
      "Large shield volcano on Maui. Last eruption around 1790 in the SW Rift Zone. Currently considered dormant but not extinct.",
    threatRank: "high",
    webcamUrl: "https://www.usgs.gov/volcanoes/haleakala",
    webcamLabel: "HVO Haleakalā page",
    deformationUrl: "https://www.usgs.gov/volcanoes/haleakala/deformation",
    deformationNote: "Small GPS network; stable baseline.",
    hazardZones: "Lava flow hazard along the SW Rift Zone and upcountry areas.",
  },
  "mauna-kea": {
    id: "mauna-kea",
    overview:
      "Post-shield stratovolcano on the Big Island. Last erupted about 4,500 years ago. Tallest mountain on Earth from base to peak.",
    threatRank: "high",
    webcamUrl: "https://www.usgs.gov/volcanoes/mauna-kea",
    webcamLabel: "HVO Mauna Kea page",
    deformationUrl: "https://www.usgs.gov/volcanoes/mauna-kea/deformation",
    deformationNote: "Small GPS network; stable.",
    hazardZones: "Localized lava flow hazard if activity resumed.",
  },
  hualalai: {
    id: "hualalai",
    overview:
      "Shield volcano on the west side of the Big Island above Kailua-Kona. Last erupted in 1801. Swarms in 1929 are attributed to unrest.",
    threatRank: "very-high",
    webcamUrl: "https://www.usgs.gov/volcanoes/hualalai",
    webcamLabel: "HVO Hualālai page",
    deformationUrl: "https://www.usgs.gov/volcanoes/hualalai/deformation",
    deformationNote: "GPS network on the flanks; stable.",
    hazardZones: "Lava flow hazard zones cover much of the Kailua-Kona area.",
  },
  cleveland: {
    id: "cleveland",
    overview:
      "Stratovolcano on Chuginadak Island in the Aleutians. Frequent small explosive eruptions; monitored mostly by satellite.",
    threatRank: "high",
    webcamUrl: "https://avo.alaska.edu/volcano/cleveland",
    webcamLabel: "AVO Cleveland page",
    deformationUrl: "https://avo.alaska.edu/volcano/cleveland",
    deformationNote:
      "Satellite-based thermal + InSAR monitoring; no in-situ GPS on the island.",
    hazardZones: "Aviation ash hazards in the North Pacific.",
  },
  veniaminof: {
    id: "veniaminof",
    overview:
      "Large caldera on the Alaska Peninsula with an active intracaldera cone. Frequent low-level eruptive activity in the 2010s–2020s.",
    threatRank: "high",
    webcamUrl: "https://avo.alaska.edu/volcano/veniaminof",
    webcamLabel: "AVO Veniaminof webcams",
    deformationUrl: "https://avo.alaska.edu/volcano/veniaminof",
    deformationNote: "Seismic + GPS network.",
    hazardZones: "Ashfall in Perryville and aviation ash hazards.",
  },
  redoubt: {
    id: "redoubt",
    overview:
      "Stratovolcano west of Cook Inlet. 1989–1990 and 2009 eruptions produced ashfalls over Anchorage and lahars down the Drift River.",
    threatRank: "very-high",
    webcamUrl: "https://avo.alaska.edu/volcano/redoubt",
    webcamLabel: "AVO Redoubt webcams",
    deformationUrl: "https://avo.alaska.edu/volcano/redoubt",
    deformationNote:
      "Dense seismic + GPS network. Episodic inflation in the lead-up to eruptions.",
    hazardZones: "Lahar hazards down the Drift River to Cook Inlet.",
  },
  augustine: {
    id: "augustine",
    overview:
      "Small island stratovolcano in lower Cook Inlet. Most recent eruption in 2006 built a new summit dome.",
    threatRank: "high",
    webcamUrl: "https://avo.alaska.edu/volcano/augustine",
    webcamLabel: "AVO Augustine webcams",
    deformationUrl: "https://avo.alaska.edu/volcano/augustine",
    deformationNote: "Seismic + GPS + tiltmeter network.",
    hazardZones: "Tsunami hazard from flank collapse into Cook Inlet.",
  },
};

// Fallback for any volcano that doesn't have a detail entry yet.
export const DEFAULT_VOLCANO_DETAIL: Omit<VolcanoDetail, "id"> = {
  overview: "No overview written yet. Add one to volcano-details.ts.",
  threatRank: "moderate",
  webcamUrl: "https://www.usgs.gov/programs/VHP",
  webcamLabel: "USGS Volcano Hazards Program",
  deformationUrl: "https://www.usgs.gov/programs/VHP",
  deformationNote: "No deformation summary yet.",
  hazardZones: "No hazard zone summary yet.",
};
