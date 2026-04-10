"use client";

import type { MapView } from "@/types/map";

const VIEWS: { key: MapView; label: string }[] = [
  { key: "lowdata", label: "2D" },
  { key: "clay", label: "CLAY" },
  { key: "photo", label: "3D" },
];

interface Props {
  active: MapView;
  onChange: (view: MapView) => void;
}

export default function MapViewToggle({ active, onChange }: Props) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        display: "flex",
        borderRadius: 20,
        background: "rgba(31,51,72,0.85)",
        border: "1px solid rgba(255,255,255,0.15)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        overflow: "hidden",
        zIndex: 20,
      }}
    >
      {VIEWS.map((v) => {
        const isActive = active === v.key;
        return (
          <button
            key={v.key}
            onClick={() => onChange(v.key)}
            style={{
              padding: "6px 12px",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.8px",
              color: isActive ? "white" : "rgba(255,255,255,0.4)",
              background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
