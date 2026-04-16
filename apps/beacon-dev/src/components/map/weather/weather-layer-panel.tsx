"use client";

import { useWeather } from "./weather-context";

const OVERLAYS: Array<{ id: string; label: string; desc: string; color: string }> = [
  { id: "wx-hurricane", label: "Hurricanes", desc: "NHC active storms, tracks & cones", color: "#7b1fa2" },
  { id: "wx-cloud-cover", label: "Cloud Cover", desc: "Open-Meteo hourly heatmap (time-aware)", color: "#94a3b8" },
  { id: "wx-radar", label: "Radar / Precipitation", desc: "NOAA MRMS CONUS mosaic", color: "#3b82f6" },
  { id: "wx-wind", label: "Wind", desc: "Open-Meteo 10m wind arrows", color: "#06b6d4" },
  { id: "wx-nws-wms", label: "NWS Alerts (WMS)", desc: "Watches / warnings / advisories", color: "#ef4444" },
];

export default function WeatherLayerPanel() {
  const w = useWeather();

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        background: "rgba(15,23,42,0.92)",
        color: "#fff",
        borderRadius: 12,
        padding: 14,
        minWidth: 260,
        boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
        zIndex: 45,
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, letterSpacing: 0.5 }}>
        WEATHER OVERLAYS
      </div>

      {OVERLAYS.map((o) => {
        const on = w.enabled.has(o.id);
        return (
          <label
            key={o.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "6px 4px",
              cursor: "pointer",
              borderRadius: 6,
              background: on ? "rgba(56,189,248,0.12)" : "transparent",
            }}
          >
            <input
              type="checkbox"
              checked={on}
              onChange={() => w.toggle(o.id)}
              style={{ marginTop: 2, accentColor: o.color }}
            />
            <div>
              <div style={{ fontWeight: 600, color: o.color }}>{o.label}</div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>{o.desc}</div>
            </div>
          </label>
        );
      })}

      <div style={{ borderTop: "1px solid #334155", marginTop: 10, paddingTop: 8 }}>
        <div style={{ fontSize: 10, color: "#94a3b8" }}>
          {w.stormsLoading
            ? "Loading storms…"
            : w.stormsError
            ? `Storm load error: ${w.stormsError}`
            : w.storms.length === 0
            ? "No active tropical cyclones"
            : `${w.storms.length} active storm${w.storms.length === 1 ? "" : "s"}`}
        </div>
      </div>
    </div>
  );
}
