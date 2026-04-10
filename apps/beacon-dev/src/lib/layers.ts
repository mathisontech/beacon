import type { LayerConfig } from "@/types/map";

export const DEFAULT_LAYERS: LayerConfig[] = [
  {
    id: "nws-alerts",
    name: "NWS Active Alerts",
    category: "Weather",
    enabled: true,
    opacity: 0.6,
    zIndex: 10,
    source: "https://api.weather.gov/alerts/active",
    updateInterval: 60,
    lastUpdated: null,
    status: "loading",
  },
];
