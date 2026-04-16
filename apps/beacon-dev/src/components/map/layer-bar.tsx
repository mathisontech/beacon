"use client";

import { useState } from "react";
import type { Layer } from "@/lib/layers";

interface Props {
  layers: Layer[];
  enabled: Set<string>;
  onToggle: (id: string) => void;
}

export default function LayerBar({ layers, enabled, onToggle }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={bar}>
      {layers.map((l) => {
        const on = enabled.has(l.id);
        const color = l.color || "#64748b";
        return (
          <button
            key={l.id}
            onClick={() => onToggle(l.id)}
            onMouseEnter={() => setHovered(l.id)}
            onMouseLeave={() => setHovered(null)}
            title={l.label}
            style={btn(on, color)}
          >
            {l.path ? (
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path d={l.path} fill={on ? color : "rgba(0,0,0,0.25)"} />
              </svg>
            ) : (
              <span style={{ width: 6, height: 6, borderRadius: 3, background: on ? color : "rgba(0,0,0,0.2)" }} />
            )}
            {hovered === l.id && (
              <span style={{ ...tooltip, background: color }}>{l.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

const bar: React.CSSProperties = {
  display: "flex",
  gap: 1,
  padding: "3px 5px",
  background: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(12px)",
  borderRadius: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

const btn = (on: boolean, color: string): React.CSSProperties => ({
  width: 28,
  height: 26,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 4,
  background: on ? `${color}14` : "transparent",
  border: on ? `1.5px solid ${color}50` : "1px solid transparent",
  cursor: "pointer",
  padding: 0,
  position: "relative",
  transition: "all 0.12s ease",
});

const tooltip: React.CSSProperties = {
  position: "absolute",
  top: 30,
  left: "50%",
  transform: "translateX(-50%)",
  padding: "3px 7px",
  color: "white",
  fontSize: 9,
  fontWeight: 600,
  borderRadius: 3,
  whiteSpace: "nowrap",
  pointerEvents: "none",
  zIndex: 20,
};
