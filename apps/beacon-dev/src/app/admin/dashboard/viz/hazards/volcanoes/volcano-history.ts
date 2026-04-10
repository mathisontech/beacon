// Eruption history, style, and baseline context for each volcano.
//
// Sources used (curated summaries — cross-check before publishing):
// - Smithsonian Global Volcanism Program (volcano.si.edu)
// - USGS Volcano Hazards Program (usgs.gov/programs/VHP)
// - USGS 2018 National Volcanic Threat Assessment (open-file 2018-1115)
//
// `year` is the signed calendar year. Negative numbers are years BCE.
// Ages in "ka" / "BP" are stored as the calendar year they correspond
// to (e.g. ~1000 years BP → year: 1026, because "now" is 2026).
// `display` is a human-readable label for the UI.

export interface EruptionRecord {
  year: number;
  display: string;
  vei: number | null;
  notes?: string;
}

// Plain-English categories. Drives the style chip color + language.
export type EruptionStyle =
  | "effusive"
  | "mixed"
  | "strombolian"
  | "explosive"
  | "dome"
  | "phreatic"
  | "hydrothermal"
  | "caldera"
  | "lahar";

export type DangerChar = "low" | "moderate" | "high" | "extreme";

// How often this eruption mode shows up, in human terms.
export type StyleFrequency = "usually" | "sometimes" | "rarely" | "historical";

// Some volcanoes do more than one thing. Primary mode stays in
// `style` + `styleDescription`; alternative modes go here.
export interface AltStyle {
  kind: EruptionStyle;
  frequency: StyleFrequency;
  danger: DangerChar;
  description: string;
}

// How close observed behavior looks like pre-eruption behavior
// for a specific capability. Drives the color on header chips.
export type ImminenceLevel = "none" | "low" | "moderate" | "high";

// A named capability of the volcano — what it's physically
// capable of doing — together with how imminent that looks right
// now, and a plain-English sign summary.
export interface Capability {
  label: string;
  imminence: ImminenceLevel;
  signs: string;
}

export interface VolcanoHistory {
  id: string;
  eruptions: EruptionRecord[]; // most recent first
  returnIntervalYears: number | null;
  returnIntervalNote: string;
  style: EruptionStyle;
  styleDescription: string;
  danger: DangerChar;
  dangerExplanation: string;
  altStyles?: AltStyle[];
  capabilities?: Capability[];
  quakeBaseline: string;
  deformationBaseline: string;
}

export const VOLCANO_HISTORY: Record<string, VolcanoHistory> = {
  kilauea: {
    id: "kilauea",
    eruptions: [
      { year: 2024, display: "Sep 2024", vei: 1, notes: "Summit eruption in Halemaʻumaʻu" },
      { year: 2023, display: "2023", vei: 1, notes: "Summit, multiple episodes" },
      { year: 2021, display: "2021–2022", vei: 1, notes: "Halemaʻumaʻu lava lake" },
      { year: 2020, display: "Dec 2020", vei: 1 },
      { year: 2018, display: "2018", vei: 3, notes: "Lower East Rift Zone + summit collapse" },
      { year: 1983, display: "1983–2018", vei: 1, notes: "Puʻu ʻŌʻō, 35-year continuous eruption" },
      { year: 1959, display: "1959", vei: 2, notes: "Kīlauea Iki lava fountains" },
      { year: 1924, display: "1924", vei: 2, notes: "Phreatic explosions at the summit" },
    ],
    returnIntervalYears: 1,
    returnIntervalNote: "Essentially continuous. Has erupted in most years of the last century.",
    style: "effusive",
    styleDescription:
      "Slow, Hawaiian-style lava flows and fountains from fissures. Rarely explosive. You can often walk within a few hundred meters of active flows safely if you stay upwind.",
    danger: "moderate",
    dangerExplanation:
      "Low risk to visitors at a distance, but devastating to anything downslope of an active flow. 2018 destroyed 700+ homes in Leilani Estates.",
    altStyles: [
      {
        kind: "phreatic",
        frequency: "rarely",
        danger: "high",
        description:
          "About once a century, magma hits the water table and Kīlauea throws ballistic rocks and ash from the summit. 1924 killed one person at the crater rim. This mode is abrupt and gives very little warning.",
      },
    ],
    capabilities: [
      {
        label: "Lava flows",
        imminence: "moderate",
        signs: "Summit is actively inflating. Elevated summit tremor and earthquake rate typical of magma movement. Next effusive episode is likely within months.",
      },
      {
        label: "Phreatic blast",
        imminence: "low",
        signs: "Water table near the vent is stable. No ballistic ejecta or sudden summit pressurization. Low risk under current conditions.",
      },
    ],
    quakeBaseline:
      "Normal background: 20–50 small M<2 quakes per day across the edifice. Swarms of M2–3 events, or sustained M3+ activity, often precede eruptions by hours to days.",
    deformationBaseline:
      "Summit tiltmeters show daily cycles of inflation/deflation of a few microradians. Sustained rapid inflation (cm/day) usually signals magma moving toward an eruption vent.",
  },

  "mauna-loa": {
    id: "mauna-loa",
    eruptions: [
      { year: 2022, display: "Nov 2022", vei: 0, notes: "NE Rift Zone, 13 days" },
      { year: 1984, display: "1984", vei: 0, notes: "NE Rift Zone, 22 days" },
      { year: 1975, display: "1975", vei: 0 },
      { year: 1950, display: "1950", vei: 0, notes: "SW Rift Zone, flows reached ocean in 3 hours" },
      { year: 1942, display: "1942", vei: 1 },
      { year: 1935, display: "1935", vei: 1 },
      { year: 1926, display: "1926", vei: 1 },
      { year: 1919, display: "1919", vei: 1 },
      { year: 1880, display: "1880–81", vei: 1, notes: "Flows reached the edge of Hilo" },
      { year: 1868, display: "1868", vei: 2, notes: "Followed by a M7.9 earthquake" },
    ],
    returnIntervalYears: 12,
    returnIntervalNote: "Historically ~5 years. Has slowed to ~20–40 years since the 1980s.",
    style: "effusive",
    styleDescription:
      "Fast-moving basaltic lava flows, often from fissures several kilometers long. Occasional tall lava fountains. No explosive eruptions in recorded history.",
    danger: "high",
    dangerExplanation:
      "1950 flows from the SW Rift Zone reached the ocean in 3 hours, crossing a highway. SW Rift eruptions can threaten Kona and Hwy 11 with almost no warning.",
    capabilities: [
      {
        label: "Fast SW Rift flow",
        imminence: "low",
        signs: "Summit has been inflating since the 2022 eruption ended. No deep long-period quakes suggesting magma ascent. Next eruption is uncertain — decades is plausible.",
      },
      {
        label: "NE Rift flow",
        imminence: "low",
        signs: "NE Rift fed the 2022 and 1984 eruptions and is the more probable next vent location, but still no short-term precursors.",
      },
    ],
    quakeBaseline:
      "Normal background: 10–30 small M<2 quakes per day, mostly <10 km depth. Sustained swarms or deep long-period events signal magma ascent.",
    deformationBaseline:
      "GPS shows ~2 cm/year of summit inflation in recent years. A step-change of several cm over days to weeks is the classic precursor to eruption.",
  },

  "great-sitkin": {
    id: "great-sitkin",
    eruptions: [
      { year: 2021, display: "2021–present", vei: 2, notes: "Ongoing dome-building in the summit crater" },
      { year: 1974, display: "1974", vei: 2, notes: "Explosive eruption and new dome" },
      { year: 1945, display: "1945", vei: 2 },
      { year: 1933, display: "1933", vei: 2 },
      { year: 1829, display: "1829", vei: 2 },
    ],
    returnIntervalYears: 45,
    returnIntervalNote: "Roughly once every 30–50 years. Current eruption started in 2021.",
    style: "dome",
    styleDescription:
      "Slow lava dome growth in the summit crater with occasional ash emissions. Not Hawaiian-style fluid lava — the dome can collapse and generate small pyroclastic flows.",
    danger: "moderate",
    dangerExplanation:
      "Uninhabited island. Main risk is ash clouds drifting into the North Pacific aviation corridor.",
    quakeBaseline:
      "Normal background: a few small quakes per day near the summit. Current eruption has kept activity elevated for years.",
    deformationBaseline:
      "Satellite InSAR has shown modest inflation of the summit area through the ongoing eruption.",
  },

  semisopochnoi: {
    id: "semisopochnoi",
    eruptions: [
      { year: 2021, display: "2021", vei: 2, notes: "Ash emissions from Mount Cerberus" },
      { year: 2019, display: "2019–2020", vei: 1 },
      { year: 1987, display: "1987", vei: 1 },
      { year: 1873, display: "1873", vei: 2 },
    ],
    returnIntervalYears: 40,
    returnIntervalNote: "Roughly every 30–40 years. Small eruptions in 2019–2021.",
    style: "explosive",
    styleDescription:
      "Small explosive eruptions from Mount Cerberus cone, producing low ash columns. No lava flows in recent history.",
    danger: "low",
    dangerExplanation:
      "Uninhabited remote island. Main risk is short-lived ash clouds affecting North Pacific flights.",
    quakeBaseline:
      "Normal background: very few quakes. Monitoring is sparse — most detection is satellite-based.",
    deformationBaseline:
      "Satellite InSAR shows only minor signals. No in-situ GPS network on the island.",
  },

  shishaldin: {
    id: "shishaldin",
    eruptions: [
      { year: 2023, display: "2023", vei: 3, notes: "Series of ash explosions and lava flows" },
      { year: 2019, display: "2019–2020", vei: 3 },
      { year: 2014, display: "2014", vei: 1 },
      { year: 2004, display: "2004", vei: 1 },
      { year: 1999, display: "1999", vei: 3 },
      { year: 1995, display: "1995", vei: 3 },
      { year: 1979, display: "1979", vei: 3 },
      { year: 1955, display: "1955", vei: 3 },
    ],
    returnIntervalYears: 8,
    returnIntervalNote: "Very active — averages one eruption every 5–10 years.",
    style: "strombolian",
    styleDescription:
      "Violent. Fire-fountaining and ash columns up to 15+ km, sometimes with small lava flows and lahars from melted glacier ice. Not Hawaiian-style slow lava.",
    danger: "moderate",
    dangerExplanation:
      "Uninhabited flanks. Main risks are aviation ash clouds and lahars down the flanks from ice melt during eruptions.",
    quakeBaseline:
      "Normal background: a handful of small quakes per day. Shishaldin's eruptions are usually preceded by sustained seismic tremor for hours to days.",
    deformationBaseline:
      "GPS + InSAR show episodic cm-scale inflation in the months before eruption, then deflation as magma reaches the surface.",
  },

  pavlof: {
    id: "pavlof",
    eruptions: [
      { year: 2021, display: "2021–2022", vei: 2 },
      { year: 2016, display: "2016", vei: 3, notes: "Ash plume to 12 km" },
      { year: 2014, display: "2014", vei: 3 },
      { year: 2013, display: "2013", vei: 3 },
      { year: 2007, display: "2007", vei: 3 },
      { year: 1996, display: "1996", vei: 3 },
      { year: 1986, display: "1986–1988", vei: 3 },
      { year: 1980, display: "1980–1981", vei: 3 },
      { year: 1973, display: "1973", vei: 3 },
      { year: 1966, display: "1966", vei: 2 },
    ],
    returnIntervalYears: 5,
    returnIntervalNote: "One of the most active volcanoes in the US — erupts every 3–5 years on average.",
    style: "strombolian",
    styleDescription:
      "Violent and unpredictable. Pavlof produces tall ash columns (often 8–15 km), fire fountains, hot rock avalanches, and occasional fast lava flows. This is NOT Hawaiian-style: eruptions start suddenly, often with little warning, and are dangerous to aircraft and nearby communities.",
    danger: "high",
    dangerExplanation:
      "Ash clouds drift over the North Pacific air corridor (where Asia–North America flights cross). Cold Bay and other nearby villages get ashfall. Lahars from ice melt can reach the coast.",
    capabilities: [
      {
        label: "Fire fountains + ash",
        imminence: "moderate",
        signs: "Currently at Advisory. Pavlof erupts every 3–5 years on average and gives very little warning — minutes to hours of tremor before ash reaches the sky. Treat it as primed.",
      },
      {
        label: "Lahar to coast",
        imminence: "moderate",
        signs: "Glacier ice on the flanks means any strong eruption will generate lahars reaching the shoreline. Cold Bay is downwind but not in the direct path.",
      },
    ],
    quakeBaseline:
      "Normal background: a few small quakes per day. Eruptions often begin with little to no clear seismic warning — minutes to hours of tremor before ash reaches the sky.",
    deformationBaseline:
      "Pavlof shows little consistent precursory deformation. That's part of what makes it dangerous — standard warning signs don't always appear.",
  },

  yellowstone: {
    id: "yellowstone",
    eruptions: [
      { year: -68000, display: "~70,000 years ago", vei: 3, notes: "Pitchstone Plateau rhyolite flow" },
      { year: -112000, display: "~114,000 years ago", vei: 3, notes: "Solfatara Plateau flow" },
      { year: -629000, display: "~631,000 years ago", vei: 8, notes: "Lava Creek Tuff — formed the current caldera" },
      { year: -1298000, display: "~1.3 million years ago", vei: 8, notes: "Mesa Falls Tuff" },
      { year: -2098000, display: "~2.1 million years ago", vei: 8, notes: "Huckleberry Ridge Tuff" },
    ],
    returnIntervalYears: 70000,
    returnIntervalNote: "Very irregular. Small lava flows every ~50,000–100,000 years. Caldera-forming eruptions are ~600,000 years apart but are NOT on a schedule.",
    style: "explosive",
    styleDescription:
      "The famous supereruptions were catastrophic VEI 8 events. Modern Yellowstone is geologically dormant for eruptions — but has frequent hydrothermal explosions (small steam blasts) and geyser activity. A supereruption in our lifetime is extraordinarily unlikely.",
    danger: "low",
    dangerExplanation:
      "Day-to-day risk is hydrothermal: small steam explosions and scalding ground. Geologic supereruption risk exists but is essentially zero on human timescales.",
    altStyles: [
      {
        kind: "hydrothermal",
        frequency: "usually",
        danger: "moderate",
        description:
          "Small steam (hydrothermal) explosions are common — several per year, ranging from puddle-sized to basketball-court sized. Biscuit Basin threw rocks 2 stories high in 2024. Local risk to visitors near geyser basins; no wider danger.",
      },
      {
        kind: "caldera",
        frequency: "historical",
        danger: "extreme",
        description:
          "Three VEI 8 supereruptions have occurred (2.1 Mya, 1.3 Mya, 631 kya). These produced continent-wide ashfall and would be civilization-scale events today. Probability in our lifetimes is effectively zero, but the geologic record shows it has happened before.",
      },
    ],
    capabilities: [
      {
        label: "VEI 8 supereruption",
        imminence: "none",
        signs: "No signs of imminent supereruption. Caldera floor rises and falls a few cm per year from hydrothermal fluids, not rising magma. No deep long-period earthquakes, no sustained harmonic tremor, no anomalous gas flux. This is background behavior.",
      },
      {
        label: "Hydrothermal blast",
        imminence: "moderate",
        signs: "Small steam explosions in geyser basins occur several times per year. The Biscuit Basin blast in July 2024 was at the upper end of normal. Visitors in basin boardwalks are the population at risk; wider area is safe.",
      },
      {
        label: "Local lava flow",
        imminence: "low",
        signs: "Small rhyolite flows happen every ~50,000–100,000 years. No current magma-ascent signals. Not expected on human timescales.",
      },
    ],
    quakeBaseline:
      "Normal background: 1,000–3,000 quakes PER YEAR across the caldera. Swarms of hundreds of small quakes in a week are normal. Most Yellowstone quake news is NOT unusual.",
    deformationBaseline:
      "Caldera floor rises and falls in multi-year cycles of a few cm. These cycles are driven by hydrothermal fluids, not rising magma.",
  },

  "long-valley": {
    id: "long-valley",
    eruptions: [
      { year: -48000, display: "~50,000 years ago", vei: 4, notes: "Inyo rhyolite flows (overlap with Mono-Inyo chain)" },
      { year: -98000, display: "~100,000 years ago", vei: 4 },
      { year: -758000, display: "~760,000 years ago", vei: 7, notes: "Bishop Tuff — formed the caldera" },
    ],
    returnIntervalYears: 50000,
    returnIntervalNote: "Magmatic eruptions every ~50,000+ years. Unrest episodes (earthquakes + uplift) are much more frequent.",
    style: "explosive",
    styleDescription:
      "When it erupts, it tends to be explosive rhyolitic — ash clouds, pumice, pyroclastic flows. The 1980s unrest (swarms + uplift) did NOT lead to eruption.",
    danger: "moderate",
    dangerExplanation:
      "Geologic hazard is real but timing is unpredictable. Day-to-day, the main issue is CO₂ gas emissions from Mammoth Mountain that have killed trees and occasionally people.",
    altStyles: [
      {
        kind: "caldera",
        frequency: "historical",
        danger: "extreme",
        description:
          "The Bishop Tuff eruption ~760,000 years ago was a VEI 7 caldera collapse that deposited ash across most of the western US. That mode is extremely rare but the caldera itself is evidence it has happened here.",
      },
      {
        kind: "hydrothermal",
        frequency: "usually",
        danger: "moderate",
        description:
          "Magmatic CO₂ vents around Mammoth Mountain kill trees and, in enclosed spaces (ski patrol huts, cabins), can suffocate people. This is the day-to-day hazard, not eruptions.",
      },
    ],
    capabilities: [
      {
        label: "VEI 7 caldera",
        imminence: "none",
        signs: "No deep earthquake swarms or sustained harmonic tremor. The 1980s unrest (earthquakes + 80 cm of uplift) did NOT lead to eruption. Current baseline is quiet.",
      },
      {
        label: "Explosive rhyolite",
        imminence: "low",
        signs: "Magma-ascent signals absent. Long-term inflation of a few cm/year around the resurgent dome is notable but slow.",
      },
      {
        label: "CO₂ gas (Mammoth)",
        imminence: "high",
        signs: "Active magmatic CO₂ emission. Dead tree zones around Horseshoe Lake. Enclosed spaces can be lethal. This is a present hazard, not a future one.",
      },
    ],
    quakeBaseline:
      "Normal background: tens of small quakes per day. Swarms of hundreds to thousands of quakes have occurred multiple times since 1980 without eruption.",
    deformationBaseline:
      "The resurgent dome inflated ~80 cm during the 1980s unrest. Inflation has resumed at a few cm/year recently but remains much slower than the 1980s rates.",
  },

  "mt-hood": {
    id: "mt-hood",
    eruptions: [
      { year: 1866, display: "1866", vei: 2, notes: "Old Maid eruptive period, last confirmed activity" },
      { year: 1781, display: "1781–1782", vei: 2, notes: "Crater Rock dome + pyroclastic flows" },
      { year: 1500, display: "~1500 CE", vei: 3 },
      { year: -1000, display: "~3,000 years ago", vei: 4, notes: "Polallie eruptive period" },
    ],
    returnIntervalYears: 200,
    returnIntervalNote: "Active episodes separated by centuries. Last major activity was 240 years ago.",
    style: "dome",
    styleDescription:
      "Slow lava dome growth near the summit, with pyroclastic flows when the dome collapses. Can generate lahars from melted glacier ice. Not Hawaiian-style.",
    danger: "high",
    dangerExplanation:
      "Lahars are the primary threat to populated valleys — the Sandy and Hood Rivers drain toward the Columbia River, past Sandy and Hood River cities.",
    quakeBaseline:
      "Normal background: occasional small quakes, mostly <M2, tens per year. Swarms near the summit are rare and notable.",
    deformationBaseline:
      "GPS baseline has been stable for decades. No measurable inflation of the edifice in the instrumental era.",
  },

  "mt-rainier": {
    id: "mt-rainier",
    eruptions: [
      { year: 1894, display: "1894", vei: 0, notes: "Small phreatic (steam) explosions" },
      { year: 1450, display: "~1450 CE", vei: 3 },
      { year: 1100, display: "~1100 CE", vei: 3, notes: "Electron lahar reached Puget Sound" },
      { year: -3500, display: "~5,500 years ago", vei: 5, notes: "Osceola Mudflow — enormous lahar to the Kent/Auburn area" },
    ],
    returnIntervalYears: 500,
    returnIntervalNote: "Magmatic eruptions every ~500+ years. Lahars can occur without an eruption.",
    style: "dome",
    styleDescription:
      "Historically dome-building with pyroclastic flows. The primary hazard is NOT the eruption itself — it's the gigantic lahars generated when ice and snow melt during an eruption (or flank collapse).",
    danger: "extreme",
    dangerExplanation:
      "150,000+ people live in lahar inundation zones. The Osceola Mudflow ~5,500 years ago reached what is now Auburn, Kent, and parts of Tacoma. A similar event today would be catastrophic.",
    altStyles: [
      {
        kind: "lahar",
        frequency: "sometimes",
        danger: "extreme",
        description:
          "Lahars (volcanic mudflows) can occur WITHOUT an eruption. Rainier has 35+ glaciers perched on weakened, hydrothermally altered rock. Flank collapse or even heavy rainfall could send a lahar down the Puyallup, Nisqually, or White River valleys at 30+ mph, reaching populated areas in under an hour.",
      },
    ],
    capabilities: [
      {
        label: "Flank-collapse lahar",
        imminence: "low",
        signs: "Lahar detection sensors along the Puyallup and Carbon rivers are quiet. No anomalous summit seismicity. But the hazard is structural — it can happen with little warning regardless of baseline signs.",
      },
      {
        label: "Explosive eruption",
        imminence: "none",
        signs: "No magma-ascent signals. No inflation of the edifice. Historically quiet on human timescales.",
      },
      {
        label: "Glacier outburst flood",
        imminence: "low",
        signs: "Small glacial outbursts occur from time to time without eruption. Seasonal risk — watch during heavy snowmelt or intense rainfall.",
      },
    ],
    quakeBaseline:
      "Normal background: ~20 quakes per month, mostly <M2, mostly in a shallow swarm zone beneath the summit. Unusual swarms or deep long-period events warrant attention.",
    deformationBaseline:
      "GPS baseline is stable. No measured inflation of the edifice. A lahar detection system along the Puyallup valley is operational.",
  },

  lassen: {
    id: "lassen",
    eruptions: [
      { year: 1914, display: "1914–1917", vei: 3, notes: "Lateral blast + pyroclastic flows in 1915" },
      { year: -24000, display: "~27,000 years ago", vei: 5, notes: "Lassen dome formed" },
    ],
    returnIntervalYears: 10000,
    returnIntervalNote: "Large eruptions every 10,000+ years. 1915 was a rare short-lived event.",
    style: "explosive",
    styleDescription:
      "1915 had a lateral blast very similar in style (but much smaller) to Mount St. Helens 1980. Dome collapses, pyroclastic flows, ash clouds. Not Hawaiian-style.",
    danger: "moderate",
    dangerExplanation:
      "Most at-risk areas are inside Lassen Volcanic National Park. A few nearby towns could receive ashfall.",
    quakeBaseline:
      "Normal background: a handful of quakes per month under the Lassen volcanic center, related to the active hydrothermal system.",
    deformationBaseline:
      "No measured inflation in the instrumental era. Hydrothermal features (boiling springs, mudpots) show short-term variability.",
  },

  newberry: {
    id: "newberry",
    eruptions: [
      { year: 726, display: "~1,300 years ago", vei: 3, notes: "Big Obsidian Flow" },
      { year: -1474, display: "~3,500 years ago", vei: 3 },
      { year: -4974, display: "~7,000 years ago", vei: 3 },
    ],
    returnIntervalYears: 3000,
    returnIntervalNote: "Once every ~2,000–4,000 years on average.",
    style: "dome",
    styleDescription:
      "Rhyolitic dome and obsidian flow eruptions. Thick, slow-moving glassy lava with explosive phases. Not Hawaiian-style.",
    danger: "moderate",
    dangerExplanation:
      "Proximal tephra and lava flow hazards around the Newberry caldera. Low population nearby.",
    quakeBaseline:
      "Normal background: very few quakes. Sparse monitoring network.",
    deformationBaseline:
      "Stable baseline in the instrumental era.",
  },

  "crater-lake": {
    id: "crater-lake",
    eruptions: [
      { year: -2774, display: "~4,800 years ago", vei: 2, notes: "Wizard Island cone + lava" },
      { year: -5674, display: "~7,700 years ago", vei: 7, notes: "Mount Mazama climactic eruption — formed the caldera" },
    ],
    returnIntervalYears: 3000,
    returnIntervalNote: "Post-caldera eruptions every few thousand years. None in ~4,800 years.",
    style: "dome",
    styleDescription:
      "Mazama's VEI 7 collapse was one of the largest in North America in the last 10,000 years. Post-caldera activity built Wizard Island with slower eruptions. Current state: dormant.",
    danger: "low",
    dangerExplanation:
      "No eruption expected on human timescales. Proximal hazards would be limited to the caldera rim.",
    quakeBaseline:
      "Normal background: very few quakes. Sparse monitoring.",
    deformationBaseline:
      "Stable. Lake level monitored.",
  },

  "mt-baker": {
    id: "mt-baker",
    eruptions: [
      { year: 1880, display: "1880", vei: 2 },
      { year: 1843, display: "1843", vei: 2 },
      { year: 1792, display: "1792", vei: 2 },
    ],
    returnIntervalYears: 45,
    returnIntervalNote: "Historical activity every few decades. None in 146 years, but Sherman Crater fumaroles showed heightened activity in the 1970s.",
    style: "dome",
    styleDescription:
      "Dome growth, phreatic explosions, and lahars from melted glacier ice. Not Hawaiian-style.",
    danger: "high",
    dangerExplanation:
      "Lahars down the Nooksack and Baker River valleys would threaten the town of Concrete and downstream communities.",
    quakeBaseline:
      "Normal background: a handful of quakes per month. Sherman Crater gas emissions are monitored.",
    deformationBaseline:
      "Stable GPS baseline. Gas and thermal monitoring are the primary indicators.",
  },

  "glacier-peak": {
    id: "glacier-peak",
    eruptions: [
      { year: 326, display: "~1,700 years ago", vei: 4 },
      { year: -11974, display: "~14,000 years ago", vei: 5, notes: "Series of very large Plinian eruptions" },
    ],
    returnIntervalYears: 2000,
    returnIntervalNote: "Roughly every 2,000 years. Past eruptions have been unusually explosive.",
    style: "explosive",
    styleDescription:
      "History of very large explosive Plinian eruptions — much bigger than Mount St. Helens 1980. When Glacier Peak erupts, it tends to be violent.",
    danger: "high",
    dangerExplanation:
      "Remote but its past eruptions have deposited ash across the Pacific Northwest. Large lahars would travel the Sauk and Skagit rivers.",
    quakeBaseline:
      "Normal background: very few quakes. Sparse monitoring because of remoteness.",
    deformationBaseline:
      "No in-situ GPS close to the edifice. Monitoring relies on satellite InSAR.",
  },

  "mt-st-helens": {
    id: "mt-st-helens",
    eruptions: [
      { year: 2004, display: "2004–2008", vei: 2, notes: "Continuous dome-building in the crater" },
      { year: 1980, display: "May 1980", vei: 5, notes: "Lateral blast, Plinian column, ~57 deaths" },
      { year: 1857, display: "1857", vei: 1 },
      { year: 1800, display: "1800–1802", vei: 5, notes: "Large Plinian" },
      { year: 1480, display: "~1480 CE", vei: 5 },
    ],
    returnIntervalYears: 120,
    returnIntervalNote: "Historical cycles of ~100–200 years between large eruptions, with smaller activity in between.",
    style: "dome",
    styleDescription:
      "Alternates between slow dome-building and catastrophic explosive eruptions. 1980 was a lateral blast (the entire north flank collapsed). 2004–2008 was quiet dome growth. Both modes are possible when activity resumes.",
    danger: "high",
    dangerExplanation:
      "Lahars down the Toutle River could threaten communities as far as the Columbia River. Ashfall can affect eastern Washington and beyond.",
    altStyles: [
      {
        kind: "explosive",
        frequency: "rarely",
        danger: "extreme",
        description:
          "VEI 5 Plinian eruption like May 18, 1980: lateral blast flattened 600 km² of forest in minutes, followed by a sustained ash column to 24 km. This is the mode to fear. Large eruptions cluster in ~100–200 year cycles.",
      },
    ],
    capabilities: [
      {
        label: "VEI 5 Plinian",
        imminence: "none",
        signs: "No magma-ascent signals. Dense GPS + seismic network is quiet. Not expected without months of precursory unrest.",
      },
      {
        label: "Dome-building",
        imminence: "low",
        signs: "Dome has been quiet since 2008. Small gas emissions at the crater are normal.",
      },
      {
        label: "Lahar in Toutle valley",
        imminence: "low",
        signs: "Sediment retention structures downstream mitigate chronic lahar risk. Eruption would overwhelm them.",
      },
    ],
    quakeBaseline:
      "Normal background: a few quakes per month. Dense monitoring network. Any sustained swarm is taken seriously.",
    deformationBaseline:
      "Dense GPS network. Baseline is currently stable. Rapid inflation would be the clearest sign that magma is recharging.",
  },

  "mt-adams": {
    id: "mt-adams",
    eruptions: [
      { year: 1026, display: "~1,000 years ago", vei: 2 },
      { year: -6474, display: "~8,500 years ago", vei: 2 },
    ],
    returnIntervalYears: 5000,
    returnIntervalNote: "Long quiet periods between eruptions. Most activity is from small flank vents rather than the summit.",
    style: "effusive",
    styleDescription:
      "Mostly basaltic andesite lava flows from flank vents. Slower and less explosive than most Cascade volcanoes. Still capable of lahars from ice and snow melt.",
    danger: "moderate",
    dangerExplanation:
      "Lahar hazard along the White Salmon and Klickitat rivers.",
    quakeBaseline:
      "Normal background: very few quakes. Sparse monitoring.",
    deformationBaseline:
      "Stable baseline.",
  },

  "mt-jefferson": {
    id: "mt-jefferson",
    eruptions: [
      { year: 1076, display: "~950 years ago", vei: 2 },
      { year: -13974, display: "~16,000 years ago", vei: 5, notes: "Plinian eruption, Pinnacle Peak" },
    ],
    returnIntervalYears: 10000,
    returnIntervalNote: "Eruptions every thousands of years on average.",
    style: "explosive",
    styleDescription:
      "Past Plinian eruptions have deposited ash hundreds of km away. Long quiet periods between activity.",
    danger: "moderate",
    dangerExplanation:
      "Lahars in headwater tributaries. Low population nearby.",
    quakeBaseline:
      "Normal background: very few quakes.",
    deformationBaseline:
      "Sparse monitoring. Stable.",
  },

  "three-sisters": {
    id: "three-sisters",
    eruptions: [
      { year: 26, display: "~2,000 years ago", vei: 3, notes: "South Sister, Rock Mesa and Devils Hill chain" },
      { year: -48000, display: "~50,000 years ago", vei: 4, notes: "North Sister (last activity)" },
    ],
    returnIntervalYears: 2000,
    returnIntervalNote: "South Sister is the youngest and most likely to erupt next. Last activity ~2,000 years ago.",
    style: "dome",
    styleDescription:
      "Rhyolitic and dacitic dome and lava eruptions. Thick, slow, capable of explosive phases. Not Hawaiian-style.",
    danger: "moderate",
    dangerExplanation:
      "A slow ground uplift west of South Sister has been ongoing since 1997. It's small and has been decelerating — it does NOT mean eruption is imminent, but it's monitored closely.",
    quakeBaseline:
      "Normal background: a few small quakes per month. A 2004 swarm was notable but did not lead to eruption.",
    deformationBaseline:
      "West Sister area has risen ~30 cm total since 1997 — but the rate has slowed nearly to zero in recent years.",
  },

  "mt-shasta": {
    id: "mt-shasta",
    eruptions: [
      { year: 1250, display: "~1250 CE", vei: 2 },
      { year: -250, display: "~2,300 years ago", vei: 4 },
      { year: -8974, display: "~11,000 years ago", vei: 4 },
    ],
    returnIntervalYears: 600,
    returnIntervalNote: "Roughly every 500–800 years. Last activity ~770 years ago.",
    style: "dome",
    styleDescription:
      "Dome growth, pyroclastic flows, and occasional Plinian ash columns. The 300,000-year-old Shastina debris avalanche is the largest known in North America. Not Hawaiian-style.",
    danger: "high",
    dangerExplanation:
      "Lahars and debris avalanches could reach McCloud, Mount Shasta City, and Weed — towns within ~15 km of the summit.",
    quakeBaseline:
      "Normal background: a few small quakes per month near the edifice.",
    deformationBaseline:
      "Stable GPS baseline.",
  },

  "medicine-lake": {
    id: "medicine-lake",
    eruptions: [
      { year: 1076, display: "~950 years ago", vei: 3, notes: "Glass Mountain obsidian flow" },
      { year: -974, display: "~3,000 years ago", vei: 3, notes: "Callahan lava flow" },
    ],
    returnIntervalYears: 2000,
    returnIntervalNote: "Every 1,000–3,000 years. Eruptive style varies widely.",
    style: "mixed",
    styleDescription:
      "A shield volcano that also produces rhyolitic obsidian flows — so eruptions can be either slow basaltic flows OR thick explosive rhyolite, depending on the vent. Hard to predict which.",
    danger: "moderate",
    dangerExplanation:
      "Proximal lava flow and tephra hazards. The caldera has been subsiding for decades (not a threat).",
    quakeBaseline:
      "Normal background: very few quakes.",
    deformationBaseline:
      "Long-term subsidence of the caldera floor (~1 cm/year) — this is NOT precursor to eruption.",
  },

  "clear-lake": {
    id: "clear-lake",
    eruptions: [
      { year: -8974, display: "~11,000 years ago", vei: 3 },
      { year: -88974, display: "~91,000 years ago", vei: 5 },
    ],
    returnIntervalYears: 80000,
    returnIntervalNote: "Extremely infrequent. No magmatic eruptions in the last ~11,000 years.",
    style: "phreatic",
    styleDescription:
      "Mostly phreatic (steam) activity and maar formation in recorded history. Modern Clear Lake is dominated by The Geysers geothermal field.",
    danger: "low",
    dangerExplanation:
      "Main risks are hydrothermal (CO₂ gas, boiling springs) in Lake County, not volcanic eruption.",
    quakeBaseline:
      "Normal background: LOTS of small quakes from The Geysers geothermal production — up to dozens per day. This is industrial activity, not volcanic unrest.",
    deformationBaseline:
      "The Geysers field has been steadily subsiding from geothermal production since the 1960s.",
  },

  "mono-inyo": {
    id: "mono-inyo",
    eruptions: [
      { year: 1776, display: "~250 years ago", vei: 2, notes: "Paoha Island eruption in Mono Lake" },
      { year: 1376, display: "~650 years ago", vei: 3, notes: "Inyo Craters dome + tephra chain" },
      { year: 926, display: "~1,100 years ago", vei: 3 },
    ],
    returnIntervalYears: 400,
    returnIntervalNote: "Every 250–700 years. The most recent chain is one of the youngest eruptive sequences in the lower-48.",
    style: "dome",
    styleDescription:
      "Rhyolitic domes, obsidian flows, and explosive phases. When the next eruption happens it will likely form a new vent along the chain, with thick glassy lava and an initial ash column.",
    danger: "moderate",
    dangerExplanation:
      "Hwy 395 and the Mammoth Lakes area cross the active chain. A new eruption would likely close the highway and force evacuations.",
    quakeBaseline:
      "Normal background: overlaps with Long Valley monitoring — tens of quakes per day is normal. Deep long-period events are notable.",
    deformationBaseline:
      "GPS network overlaps with Long Valley. Baseline has been mostly stable in recent years.",
  },

  haleakala: {
    id: "haleakala",
    eruptions: [
      { year: 1790, display: "~1790", vei: 0, notes: "SW Rift Zone, La Perouse Bay flow" },
      { year: 1026, display: "~1,000 years ago", vei: 1 },
      { year: 26, display: "~2,000 years ago", vei: 1 },
    ],
    returnIntervalYears: 400,
    returnIntervalNote: "Historical eruptions every few hundred years.",
    style: "effusive",
    styleDescription:
      "Hawaiian-style basaltic lava flows and small fountains along the SW Rift Zone. Slow, predictable once it starts — same family as Kīlauea and Mauna Loa.",
    danger: "moderate",
    dangerExplanation:
      "A SW Rift eruption could impact Kīhei, Mākena, and upcountry Maui with lava flows.",
    quakeBaseline:
      "Normal background: a few small quakes per week. Minimal in-situ monitoring network.",
    deformationBaseline:
      "Small GPS network. Stable baseline — no measured inflation.",
  },

  "mauna-kea": {
    id: "mauna-kea",
    eruptions: [
      { year: -2474, display: "~4,500 years ago", vei: 0 },
      { year: -3974, display: "~6,000 years ago", vei: 0 },
    ],
    returnIntervalYears: 5000,
    returnIntervalNote: "Post-shield phase — eruptions every thousands of years.",
    style: "effusive",
    styleDescription:
      "Hawaiian-style basaltic flows, smaller than Mauna Loa but similar in behavior. Long quiet periods.",
    danger: "low",
    dangerExplanation:
      "Low near-term risk. A hypothetical eruption could threaten Saddle Road or the observatory complex.",
    quakeBaseline:
      "Normal background: very few quakes.",
    deformationBaseline:
      "Stable.",
  },

  hualalai: {
    id: "hualalai",
    eruptions: [
      { year: 1801, display: "1801", vei: 1, notes: "Flows reached Kona coast" },
      { year: 1476, display: "~550 years ago", vei: 1 },
      { year: 976, display: "~1,050 years ago", vei: 1 },
    ],
    returnIntervalYears: 400,
    returnIntervalNote: "Historically every few hundred years. 1801 is the most recent.",
    style: "effusive",
    styleDescription:
      "Fast-moving Hawaiian-style basaltic lava flows that can reach the ocean in hours. Slow visually but fast spatially — similar to Mauna Loa flows.",
    danger: "high",
    dangerExplanation:
      "Kailua-Kona, the Kona International Airport, and Hwy 11 all sit in Hualālai's lava flow hazard zones. A 1929 earthquake swarm may have been failed unrest.",
    quakeBaseline:
      "Normal background: a few quakes per week.",
    deformationBaseline:
      "Stable GPS baseline.",
  },

  cleveland: {
    id: "cleveland",
    eruptions: [
      { year: 2020, display: "2020", vei: 2 },
      { year: 2017, display: "2017", vei: 2 },
      { year: 2011, display: "2011", vei: 3 },
      { year: 2009, display: "2009", vei: 3 },
      { year: 2001, display: "2001", vei: 3 },
      { year: 1994, display: "1994", vei: 2 },
    ],
    returnIntervalYears: 4,
    returnIntervalNote: "Very frequent — eruptions every 2–5 years.",
    style: "explosive",
    styleDescription:
      "Small but sudden Vulcanian explosions. Dome grows in the summit crater, then fails explosively, sending ash to 6–8 km. Not Hawaiian-style.",
    danger: "moderate",
    dangerExplanation:
      "Uninhabited island. Main risk is ash clouds to North Pacific aviation.",
    quakeBaseline:
      "Normal background: minimal in-situ seismic network — mostly satellite thermal detection.",
    deformationBaseline:
      "Satellite-based monitoring only. No in-situ GPS.",
  },

  veniaminof: {
    id: "veniaminof",
    eruptions: [
      { year: 2021, display: "2021", vei: 2 },
      { year: 2018, display: "2018", vei: 2 },
      { year: 2013, display: "2013", vei: 3 },
      { year: 2005, display: "2005", vei: 2 },
      { year: 1993, display: "1993–1995", vei: 2 },
      { year: 1983, display: "1983–1984", vei: 3 },
    ],
    returnIntervalYears: 6,
    returnIntervalNote: "Very frequent — eruptions every 3–8 years.",
    style: "strombolian",
    styleDescription:
      "Small Strombolian (frequent mild explosions) from the intracaldera cone, with occasional small lava flows. Less violent than Pavlof or Shishaldin.",
    danger: "moderate",
    dangerExplanation:
      "Ashfall in the village of Perryville (~35 km away). Aviation ash hazards.",
    quakeBaseline:
      "Normal background: moderate seismicity from the active system.",
    deformationBaseline:
      "GPS network shows cm-scale changes related to intracaldera eruptions.",
  },

  redoubt: {
    id: "redoubt",
    eruptions: [
      { year: 2009, display: "2009", vei: 3, notes: "Ashfall over Anchorage, lahars to Drift River" },
      { year: 1989, display: "1989–1990", vei: 3 },
      { year: 1966, display: "1966–1968", vei: 3 },
      { year: 1902, display: "1902", vei: 3 },
    ],
    returnIntervalYears: 30,
    returnIntervalNote: "Every 20–40 years. Past four eruptions have followed a remarkably consistent pattern.",
    style: "explosive",
    styleDescription:
      "Sudden explosive eruptions. Ash columns to 15+ km. Pyroclastic flows melt the summit ice cap and generate huge lahars down the Drift River. Not Hawaiian-style.",
    danger: "high",
    dangerExplanation:
      "2009 eruption dropped ash across Anchorage and forced the closure of oil facilities at the Drift River terminal. Alaska's largest populated area is directly downwind.",
    quakeBaseline:
      "Normal background: a few small quakes per day. Dense AVO seismic network. Precursory swarms typically arrive days to weeks before eruption.",
    deformationBaseline:
      "GPS has shown cm-scale inflation in the months before recent eruptions.",
  },

  augustine: {
    id: "augustine",
    eruptions: [
      { year: 2006, display: "2006", vei: 3, notes: "New summit dome and pyroclastic flows" },
      { year: 1986, display: "1986", vei: 3 },
      { year: 1976, display: "1976", vei: 4 },
      { year: 1964, display: "1964", vei: 2 },
      { year: 1935, display: "1935", vei: 2 },
      { year: 1883, display: "1883", vei: 4, notes: "Flank collapse generated a small tsunami" },
    ],
    returnIntervalYears: 25,
    returnIntervalNote: "Every 10–30 years, very regular.",
    style: "dome",
    styleDescription:
      "Dome growth followed by sudden collapse and pyroclastic flows. Flank collapses have sent debris avalanches into Cook Inlet, triggering tsunamis in 1883. Not Hawaiian-style.",
    danger: "high",
    dangerExplanation:
      "Tsunami risk from flank collapse into Cook Inlet is the most unusual hazard — could affect Homer and Kenai Peninsula communities.",
    quakeBaseline:
      "Normal background: a few quakes per day. Dense AVO network. Precursory swarms are the main warning.",
    deformationBaseline:
      "GPS + tiltmeter network. Showed clear inflation before 2006.",
  },

  "campi-flegrei": {
    id: "campi-flegrei",
    eruptions: [
      { year: 1538, display: "1538", vei: 2, notes: "Monte Nuovo — a new cone grew in one week near Pozzuoli. Last eruption of the caldera." },
      { year: -8000, display: "~10,000 years ago", vei: 4, notes: "Agnano-Monte Spina — explosive eruption in the current caldera cycle" },
      { year: -13000, display: "~15,000 years ago", vei: 6, notes: "Neapolitan Yellow Tuff — formed the inner caldera" },
      { year: -37000, display: "~39,000 years ago", vei: 7, notes: "Campanian Ignimbrite — a supereruption that buried Southern Italy and is linked to climate cooling across Europe" },
    ],
    returnIntervalYears: 500,
    returnIntervalNote: "Very irregular. ~70 eruptions in the last 15,000 years, clustered in 3 epochs, separated by long quiet periods. The system has been quiet (for eruptions) since 1538, but is bradyseismically active.",
    style: "explosive",
    styleDescription:
      "Campi Flegrei produces short, violent explosive eruptions from shifting vents inside the caldera. Monte Nuovo (1538) was a small phreatomagmatic event; Neapolitan Yellow Tuff (~15 ka) was caldera-forming. The worry isn't continuous activity — it's the uncertainty about which vent goes next.",
    danger: "extreme",
    dangerExplanation:
      "Around 500,000 people live inside the Italian Civil Protection Red Zone (pyroclastic-flow evacuation area), and ~1.5 million more inside the Yellow Zone (ashfall). The metro Naples area is among the most densely populated volcanic regions on earth. Even a Monte Nuovo-scale eruption would be a mass-casualty event.",
    altStyles: [
      {
        kind: "hydrothermal",
        frequency: "usually",
        danger: "moderate",
        description:
          "Solfatara and Pisciarelli fumaroles are continuously active with high CO₂ and H₂S. Pisciarelli has hosted small phreatic events and scalding mudflows; access is restricted.",
      },
      {
        kind: "caldera",
        frequency: "historical",
        danger: "extreme",
        description:
          "The Campanian Ignimbrite ~39,000 years ago was a VEI 7 supereruption that deposited ash across Eastern Europe. No sign of imminent supereruption, but the system is geologically capable.",
      },
    ],
    capabilities: [
      {
        label: "Bradyseism (ground uplift + quakes)",
        imminence: "high",
        signs: "Active crisis since 2005, sharply accelerated since 2022. Caldera floor has risen more than 1 meter in Pozzuoli; seismic swarms of hundreds of small quakes (M1–4) are routine. INGV keeps the volcanic alert at Yellow. Uplift is driven by fluid pressure — whether it turns into magma intrusion is the open question.",
      },
      {
        label: "Phreatomagmatic eruption (Monte Nuovo type)",
        imminence: "moderate",
        signs: "1538 was preceded by years of uplift + earthquakes + ground cracking. The current pattern has some parallels but no deep long-period earthquakes or strong gas anomaly shift yet. INGV watches for changes in CO₂/H₂O ratio at Pisciarelli as a key precursor.",
      },
      {
        label: "VEI 7 supereruption",
        imminence: "none",
        signs: "Would require massive magma accumulation over centuries — nothing currently observed at that scale. Historical precedent exists (Campanian Ignimbrite ~39 ka), but no imminence.",
      },
      {
        label: "Hydrothermal blast",
        imminence: "moderate",
        signs: "Pisciarelli has had small steam blasts and scalding mud flows in recent years. Solfatara CO₂ flux is at a multi-decade high. Localised hazard to visitors and nearby residents; not a wider evacuation trigger.",
      },
    ],
    quakeBaseline:
      "Bradyseismic crisis: hundreds to thousands of small quakes per month (M0–3), with occasional M4 events. The ongoing uplift means this is NOT background — it's elevated, and has been rising since 2005. INGV publishes the full catalog at ov.ingv.it.",
    deformationBaseline:
      "The caldera has risen more than 1 meter at the Rione Terra tide gauge in Pozzuoli since 2005, with the rate accelerating since 2022 (tens of cm per year). This is the most rapid uplift of any major urban caldera in the world. Driven by fluid pressure from the shallow hydrothermal/magmatic system.",
  },
};

// Compute years since the most recent eruption. Uses the `year`
// field from the first entry in the eruptions list.
export function yearsSinceLast(h: VolcanoHistory, now = 2026): number | null {
  if (!h.eruptions.length) return null;
  const latest = h.eruptions[0]?.year;
  if (latest == null) return null;
  return Math.max(0, now - latest);
}

// Format a "years ago" count into a readable label.
export function formatYearsSince(years: number | null): string {
  if (years == null) return "—";
  if (years === 0) return "This year";
  if (years <= 1) return "Last year";
  if (years < 1000) return `${years} years ago`;
  if (years < 10000) return `~${Math.round(years / 100) * 100} years ago`;
  if (years < 1000000) return `~${Math.round(years / 1000)},000 years ago`;
  return `~${(years / 1000000).toFixed(1)} million years ago`;
}

// Format an average return interval as a plain-English phrase.
export function formatReturnInterval(years: number | null): string {
  if (years == null) return "—";
  if (years < 2) return "About every year";
  if (years < 1000) return `About every ${years} years`;
  if (years < 10000) return `About every ${Math.round(years / 100) * 100} years`;
  return `About every ${(years / 1000).toFixed(0)},000 years`;
}
