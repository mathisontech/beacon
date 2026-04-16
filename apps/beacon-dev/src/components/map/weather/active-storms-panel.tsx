"use client";

import { useWeather } from "./weather-context";
import type { HurricaneStorm } from "@beacon/data-sources";

interface Props {
  onFly?: (lat: number, lng: number) => void;
}

function categoryLabel(s: HurricaneStorm): string {
  const kt = s.currentWindKt ?? 0;
  if (kt >= 137) return "Cat 5";
  if (kt >= 113) return "Cat 4";
  if (kt >= 96) return "Cat 3";
  if (kt >= 83) return "Cat 2";
  if (kt >= 64) return "Cat 1";
  if (kt >= 34) return "Tropical Storm";
  return "Tropical Dep.";
}

export default function ActiveStormsPanel({ onFly }: Props) {
  const w = useWeather();

  if (w.stormsLoading && w.storms.length === 0) {
    return (
      <div style={panelStyle}>
        <div style={titleStyle}>ACTIVE STORMS</div>
        <div style={{ color: "#94a3b8", fontSize: 11 }}>Loading…</div>
      </div>
    );
  }

  if (w.storms.length === 0) {
    return (
      <div style={panelStyle}>
        <div style={titleStyle}>ACTIVE STORMS</div>
        <div style={{ color: "#94a3b8", fontSize: 11 }}>
          No active tropical cyclones.
        </div>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <div style={titleStyle}>ACTIVE STORMS ({w.storms.length})</div>
      {w.storms.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onFly?.(s.currentLat, s.currentLng)}
          style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            background: "rgba(30,41,59,0.8)",
            color: "#fff",
            border: "1px solid #334155",
            borderRadius: 6,
            padding: "6px 8px",
            marginBottom: 6,
            cursor: "pointer",
            fontSize: 11,
          }}
        >
          <div style={{ fontWeight: 700 }}>{s.name}</div>
          <div style={{ color: "#fbbf24" }}>{categoryLabel(s)}</div>
          <div style={{ color: "#94a3b8", fontSize: 10 }}>
            {s.currentWindKt != null ? `${s.currentWindKt} kt · ` : ""}
            {s.basin} · {s.id}
          </div>
        </button>
      ))}
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  position: "absolute",
  top: 16,
  left: 16,
  background: "rgba(15,23,42,0.92)",
  color: "#fff",
  borderRadius: 12,
  padding: 12,
  minWidth: 200,
  maxHeight: "60vh",
  overflowY: "auto",
  boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
  zIndex: 45,
  fontSize: 12,
};

const titleStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 13,
  marginBottom: 10,
  letterSpacing: 0.5,
};
