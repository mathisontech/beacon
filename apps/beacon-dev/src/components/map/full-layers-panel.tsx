"use client";

import { LAYER_REGISTRY, countLayers } from "@/lib/layers";
import LayerPanelSection from "./layer-panel-section";
import LayerGridSection from "./layer-grid-section";
import HazardGridSection from "./hazard-grid-section";
import { useWeather } from "./weather";

const WEATHER_OVERLAYS: Array<{ id: string; label: string; desc: string; color: string }> = [
  { id: "wx-hurricane", label: "Hurricanes", desc: "NHC active storms, tracks & cones", color: "#7b1fa2" },
  { id: "wx-cloud-cover", label: "Cloud Cover", desc: "Open-Meteo hourly heatmap (time-aware)", color: "#94a3b8" },
  { id: "wx-radar", label: "Radar / Precipitation", desc: "NOAA MRMS CONUS mosaic", color: "#3b82f6" },
  { id: "wx-wind", label: "Wind", desc: "Open-Meteo 10m wind arrows", color: "#06b6d4" },
  { id: "wx-nws-wms", label: "NWS Alerts (WMS)", desc: "Watches / warnings / advisories", color: "#ef4444" },
];

interface Props {
  open: boolean;
  onToggle: () => void;
  onLayerToggle: (id: string) => void;
  onHazardToggle: (id: string) => void;
  activeHazards: Set<string>;
  enabledLayers: Set<string>;
  onHazardSublayerToggle?: (hazardId: string, sublayerId: string) => void;
  enabledHazardSublayers?: Set<string>;
}

export default function FullLayersPanel({
  open,
  onToggle,
  onLayerToggle,
  onHazardToggle,
  activeHazards,
  enabledLayers,
  enabledHazardSublayers,
}: Props) {
  const w = useWeather();
  const total = countLayers(LAYER_REGISTRY);
  const activeCount =
    enabledLayers.size +
    activeHazards.size +
    (enabledHazardSublayers?.size ?? 0);

  // "Events of Interest" is a planned hazard-driven rollup; no tiles
  // yet. Rendered as an empty placeholder at the top of the panel.
  // "Live Conditions" = WEATHER + Traffic from LIVE. Everything else
  // from LIVE (alerts, fires, feeds, reports, etc.) moves to a
  // dedicated "Alerts & Feeds" section further down.
  const trafficLayer = LAYER_REGISTRY.live.layers.find(
    (l) => l.id === "live-traffic"
  );
  const liveConditions = trafficLayer
    ? [...LAYER_REGISTRY.weather.layers, trafficLayer]
    : LAYER_REGISTRY.weather.layers;
  const alertsAndFeeds = LAYER_REGISTRY.live.layers.filter(
    (l) => l.id !== "live-traffic"
  );

  return (
    <>
      <button onClick={onToggle} style={gearBtn} title="Layers">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
        {activeCount > 0 && <span style={gearBadge}>{activeCount}</span>}
      </button>

      {open && (
        <div style={panel}>
          <div style={panelHeader}>
            <span style={panelTitle}>LAYERS</span>
            <span style={panelCount}>{total} available</span>
          </div>
          <div style={scroll}>
            <LayerGridSection
              label="Events of Interest"
              layers={[]}
              enabled={enabledLayers}
              onToggle={onLayerToggle}
              startOpen
              emptyNote="Coming soon \u2014 hazard-driven events of interest."
            />
            <HazardGridSection
              category={LAYER_REGISTRY.hazards}
              active={activeHazards}
              onToggle={onHazardToggle}
              startOpen
            />
            <LayerGridSection
              label="Live Conditions"
              layers={liveConditions}
              enabled={enabledLayers}
              onToggle={onLayerToggle}
              startOpen
            />
            <div style={wxSection}>
              <div style={wxSectionHeader}>WEATHER OVERLAYS</div>
              {WEATHER_OVERLAYS.map((o) => {
                const on = w.enabled.has(o.id);
                return (
                  <label key={o.id} style={{ ...wxRow, background: on ? "rgba(56,189,248,0.08)" : "transparent" }}>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => w.toggle(o.id)}
                      style={{ marginTop: 2, accentColor: o.color }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 11, color: o.color }}>{o.label}</div>
                      <div style={{ fontSize: 9, color: "rgba(0,0,0,0.4)" }}>{o.desc}</div>
                    </div>
                  </label>
                );
              })}
              <div style={{ fontSize: 9, color: "rgba(0,0,0,0.35)", padding: "6px 4px 0", borderTop: "1px solid rgba(0,0,0,0.06)", marginTop: 4 }}>
                {w.stormsLoading
                  ? "Loading storms…"
                  : w.stormsError
                  ? `Storm load error: ${w.stormsError}`
                  : w.storms.length === 0
                  ? "No active tropical cyclones"
                  : `${w.storms.length} active storm${w.storms.length === 1 ? "" : "s"}`}
              </div>
            </div>
            <LayerGridSection
              label="Alerts & Feeds"
              layers={alertsAndFeeds}
              enabled={enabledLayers}
              onToggle={onLayerToggle}
              startOpen
            />
            <LayerPanelSection
              label="Reference"
              layers={withEnabled(LAYER_REGISTRY.reference.layers, enabledLayers)}
              onToggle={onLayerToggle}
              startOpen
            />
            <LayerPanelSection
              label="Base Map"
              layers={withEnabled(LAYER_REGISTRY.baseMap.layers, enabledLayers)}
              onToggle={onLayerToggle}
            />
            <LayerPanelSection
              label="Fun"
              layers={withEnabled(LAYER_REGISTRY.fun.layers, enabledLayers)}
              onToggle={onLayerToggle}
            />
          </div>
        </div>
      )}
    </>
  );
}

/** Merge the global enabled set into the default layer definitions */
function withEnabled(
  layers: {
    id: string;
    label: string;
    enabled: boolean;
    opacity: number;
    minZoom?: number;
    heatmapFallback?: boolean;
    color?: string;
    path?: string;
  }[],
  enabled: Set<string>
) {
  return layers.map((l) => ({ ...l, enabled: enabled.has(l.id) }));
}

const gearBtn: React.CSSProperties = {
  position: "absolute",
  top: 10,
  right: 10,
  width: 36,
  height: 36,
  borderRadius: 8,
  background: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(0,0,0,0.08)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 16,
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  padding: 0,
};

const gearBadge: React.CSSProperties = {
  position: "absolute",
  top: -4,
  right: -4,
  minWidth: 14,
  height: 14,
  borderRadius: 7,
  background: "#2563eb",
  color: "white",
  fontSize: 8,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 3px",
};

const panel: React.CSSProperties = {
  position: "absolute",
  top: 10,
  right: 52,
  width: 260,
  maxHeight: "calc(100% - 20px)",
  background: "rgba(255,255,255,0.95)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 10,
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  zIndex: 16,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const panelHeader: React.CSSProperties = {
  padding: "10px 12px 8px",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
  display: "flex",
  alignItems: "baseline",
  gap: 6,
};

const panelTitle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "1.5px",
  color: "rgba(0,0,0,0.6)",
};

const panelCount: React.CSSProperties = {
  fontSize: 8,
  color: "rgba(0,0,0,0.3)",
};

const scroll: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
};

const wxSection: React.CSSProperties = {
  padding: "8px 12px",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
};

const wxSectionHeader: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "1.2px",
  color: "rgba(0,0,0,0.45)",
  marginBottom: 6,
};

const wxRow: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
  padding: "5px 4px",
  cursor: "pointer",
  borderRadius: 6,
};
