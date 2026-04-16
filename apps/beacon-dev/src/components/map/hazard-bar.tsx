"use client";

import { useState } from "react";
import { HAZARDS } from "@/lib/layers";

interface Props {
  active: Set<string>;
  onToggle: (id: string) => void;
}

export default function HazardBar({ active, onToggle }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={bar}>
      {HAZARDS.hazards.map((h) => {
        const on = active.has(h.id);
        const strokeColor = on ? h.color : h.dimColor;
        return (
          <button
            key={h.id}
            onClick={() => onToggle(h.id)}
            onMouseEnter={() => setHovered(h.id)}
            onMouseLeave={() => setHovered(null)}
            title={h.label}
            style={btn(on, h.color)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={h.path} />
            </svg>
            {hovered === h.id && (
              <span style={{ ...tooltip, background: h.color }}>{h.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

const bar: React.CSSProperties = {
  position: "absolute",
  top: 10,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: 1,
  padding: "3px 5px",
  background: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(12px)",
  borderRadius: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  zIndex: 15,
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
