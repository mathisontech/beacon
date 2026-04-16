export const VOLCANOES_HREF = "/admin/dashboard/viz/hazards/volcanoes";

export type VolcanoLeaf = {
  kind: "leaf";
  slug: string; // path segment under VOLCANOES_HREF, e.g. "data-source-manager" or "hazard-modeling/risk-modeling"
  label: string;
  description?: string;
  bullets?: string[];
  // Optional nested nodes. A leaf with children still navigates to its own
  // page on click; the chevron expands the nested list.
  children?: VolcanoNode[];
};

export type VolcanoGroup = {
  kind: "group";
  slug: string; // parent segment, e.g. "hazard-modeling"
  label: string;
  children: VolcanoNode[];
};

export type VolcanoNode = VolcanoLeaf | VolcanoGroup;

// UI Manager is the root /volcanoes page (the existing playground).
export const UI_MANAGER_LABEL = "UI Manager";

// Children rendered under the Volcanoes section, in order.
export const volcanoNodes: VolcanoNode[] = [
  {
    kind: "leaf",
    slug: "data-source-manager",
    label: "Data Source Manager",
    description:
      "Where the raw data is managed coming in from all the different volcano data sources and APIs. Organized by region where helpful, but adapted to how data sources are actually controlled — most are run by national governments and university research groups, so the registry mixes regional grouping with per-agency / per-network grouping.",
    bullets: [
      "Region polygon overlay with Beacon coverage color ramp (high / partial / low / none)",
      "Per-region drawer listing the data sources powering that coverage",
      "Per-source detail: polling limits, magnitude floor, sensor footprint, commercial-use license",
      "Ingestion health and stale-feed triggers surfaced at the region and source level",
      "Source registry grouped by controlling agency (USGS, INGV, JMA, university networks, etc.)",
    ],
  },
  {
    kind: "leaf",
    slug: "status-overview-manager",
    label: "Volcano Status Overview Manager",
    description:
      "Responsible for each volcano's data aggregation pipeline and generating a current in-depth overview of what's going on at that volcano.",
    bullets: [
      "Per-volcano ingestion pipeline definition (which sources feed which signals)",
      "Aggregation rules that fold raw feeds into a unified current state",
      "Live status overview surface: alert level, recent activity, anomalies",
      "Pattern-deviation detection vs the volcano's own historical baseline",
      "Pipeline health indicators per volcano",
    ],
    children: [
      {
        kind: "group",
        slug: "status-overview-manager/yellowstone",
        label: "Yellowstone",
        children: [
          {
            kind: "leaf",
            slug: "status-overview-manager/yellowstone/processing",
            label: "Processing",
          },
          {
            kind: "leaf",
            slug: "status-overview-manager/yellowstone/overviews",
            label: "Overviews",
          },
        ],
      },
    ],
  },
  {
    kind: "group",
    slug: "hazard-modeling",
    label: "Hazard Modeling",
    children: [
      {
        kind: "leaf",
        slug: "hazard-modeling/risk-modeling",
        label: "Risk Modeling",
        description:
          "Long-horizon risk assessment for each volcano: how dangerous is it intrinsically, what scenarios are credible, and how should that shape baseline preparedness.",
      },
      {
        kind: "leaf",
        slug: "hazard-modeling/ongoing-hazard-models",
        label: "Ongoing Hazard Models",
        description:
          "Live models of active and developing hazards. Includes models for where the danger currently is (lava flow paths, ashfall, pyroclastic reach, lahar corridors, gas plumes).",
      },
      {
        kind: "leaf",
        slug: "hazard-modeling/safe-zone-models",
        label: "Safe Zone Models",
        description:
          "Models that compute safer ground given current and forecast hazard footprints. Feeds the public app's 'where to go' guidance.",
      },
      {
        kind: "leaf",
        slug: "hazard-modeling/event-simulations",
        label: "Event Simulations",
        description:
          "Forward-looking simulations. Includes both hazard simulations (how a given eruption scenario would unfold) and evacuation simulations (how the population would move and where bottlenecks form).",
      },
    ],
  },
  {
    kind: "group",
    slug: "awareness-maximizer",
    label: "Awareness Maximizer",
    children: [
      {
        kind: "leaf",
        slug: "awareness-maximizer/feed-aggregator",
        label: "Feed Aggregator",
        description:
          "Pulls in third-party feeds — news, social, observatory bulletins, scientific posts — and folds them into a single timeline per volcano.",
      },
      {
        kind: "leaf",
        slug: "awareness-maximizer/user-reports",
        label: "User Reports",
        description:
          "Sightings and observations submitted by Beacon users on the ground. Triage, dedupe, and surface to the right consumers.",
      },
      {
        kind: "leaf",
        slug: "awareness-maximizer/official-alerts",
        label: "Official Alerts",
        description:
          "Inbound alerts from official authorities (volcano observatories, national civil protection, aviation color codes). Normalized and tied to volcano + region.",
      },
      {
        kind: "leaf",
        slug: "awareness-maximizer/beacon-alerts-creator",
        label: "Beacon Alerts Creator",
        description:
          "Authoring surface for Beacon-originated alerts: composes notifications from aggregated state and pushes them out through the right channels.",
      },
      {
        kind: "leaf",
        slug: "awareness-maximizer/location-status-overview",
        label: "Location Status Overview",
        description:
          "Per-location rollup of what users in that area need to know right now (active hazards, alert level, recommended action).",
      },
      {
        kind: "leaf",
        slug: "awareness-maximizer/user-status-overview",
        label: "User Status Overview",
        description:
          "Per-user rollup of what each user needs to know based on their current location, profile, and household.",
      },
      {
        kind: "leaf",
        slug: "awareness-maximizer/critical-info-manager",
        label: "Critical Info Manager",
        description:
          "Curates the small set of must-know information that always reaches the user, even under degraded connectivity.",
      },
    ],
  },
  {
    kind: "group",
    slug: "event-operations-manager",
    label: "Event Operations Manager",
    children: [
      {
        kind: "leaf",
        slug: "event-operations-manager/event-history-records-protocols",
        label: "Event History Records Protocols",
        description:
          "Rules for what gets persisted to the event history record during a live event, at what fidelity, and with what retention.",
      },
      {
        kind: "leaf",
        slug: "event-operations-manager/event-trigger-condition-protocols",
        label: "Event Trigger Condition Protocols",
        description:
          "Definitions of the conditions that escalate a volcano from monitored to declared event, including thresholds and required corroboration.",
      },
      {
        kind: "leaf",
        slug: "event-operations-manager/caching-protocols",
        label: "Caching Protocols",
        description:
          "Depending on the likelihood of the event resulting in rapid loss of cell connectivity, caches different feature sets to user devices ahead of time (maps, evacuation routes, official guidance, mesh fallbacks).",
      },
      {
        kind: "leaf",
        slug: "event-operations-manager/sensor-polling-protocols",
        label: "Sensor Polling Protocols",
        description:
          "How aggressively each class of sensor is polled as event likelihood and severity change. Includes burst modes and back-off rules.",
      },
      {
        kind: "leaf",
        slug: "event-operations-manager/evacuation-vs-shelter-in-place",
        label: "Evacuation vs Shelter-in-Place Expectations",
        description:
          "Per-scenario expectations for which response is appropriate, used by the public app and by responders to set guidance.",
      },
      {
        kind: "leaf",
        slug: "event-operations-manager/related-hazards",
        label: "Related Hazards",
        description:
          "Tracks cascading and co-occurring hazards (lahars, tsunamis, wildfires, air quality) so an event isn't reasoned about in isolation.",
      },
      {
        kind: "leaf",
        slug: "event-operations-manager/event-aggregation",
        label: "Event Aggregation",
        description:
          "Joins related signals into a single coherent event, including merging multi-vent activity at one volcano and linking regional clusters.",
      },
    ],
  },
  {
    kind: "leaf",
    slug: "event-records-manager",
    label: "Event Records Manager",
    description:
      "Long-term store of past events. Includes the events-of-interest 'judger' that decides which historical events are worth surfacing for review, training, and pattern analysis.",
  },
];

// Recursively walk the tree and collect all leaves (used by route helpers).
function collectLeaves(nodes: VolcanoNode[]): VolcanoLeaf[] {
  const out: VolcanoLeaf[] = [];
  for (const n of nodes) {
    if (n.kind === "leaf") {
      out.push(n);
      if (n.children?.length) out.push(...collectLeaves(n.children));
    } else {
      out.push(...collectLeaves(n.children));
    }
  }
  return out;
}

function collectGroups(nodes: VolcanoNode[]): VolcanoGroup[] {
  const out: VolcanoGroup[] = [];
  for (const n of nodes) {
    if (n.kind === "group") {
      out.push(n);
      out.push(...collectGroups(n.children));
    } else if (n.children?.length) {
      out.push(...collectGroups(n.children));
    }
  }
  return out;
}

export const volcanoLeaves: VolcanoLeaf[] = collectLeaves(volcanoNodes);

export function findVolcanoLeaf(slug: string): VolcanoLeaf | undefined {
  return volcanoLeaves.find((l) => l.slug === slug);
}

export function findVolcanoGroup(slug: string): VolcanoGroup | undefined {
  return collectGroups(volcanoNodes).find((g) => g.slug === slug);
}
