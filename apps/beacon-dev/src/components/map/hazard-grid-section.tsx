"use client";

import { useState } from "react";
import type { HazardCategory } from "@/lib/layers";
import { isHazardImpl } from "@/lib/layers/implemented";

interface Props {
  category: HazardCategory;
  active: Set<string>;
  onToggle: (id: string) => void;
  startOpen?: boolean;
}

// 4-across icon grid for hazards. Clicking toggles the hazard on the
// map (activeHazards), matching the old LayerBars HazardRow behavior
// that used to live on-screen.
export default function HazardGridSection({
  category,
  active,
  onToggle,
  startOpen = true,
}: Props) {
  const [open, setOpen] = useState(startOpen);
  const activeCount = category.hazards.filter((h) => active.has(h.id)).length;

  return (
    <div style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <button onClick={() => setOpen(!open)} style={header}>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(0,0,0,0.4)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span style={headerLabel}>{category.label}</span>
        {activeCount > 0 && <span style={badge}>{activeCount}</span>}
      </button>
      {open && (
        <div style={grid}>
          {category.hazards.map((h) => {
            const on = active.has(h.id);
            const impl = isHazardImpl(h.id);
            return (
              <button
                key={h.id}
                onClick={() => impl && onToggle(h.id)}
                disabled={!impl}
                style={cell(on, h.color, impl)}
                title={impl ? h.label : `${h.label} (not yet built)`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    d={h.path}
                    fill={
                      !impl
                        ? "rgba(0,0,0,0.18)"
                        : on
                        ? h.color
                        : h.dimColor
                    }
                  />
                </svg>
                <span style={cellLabel(on, impl)}>{h.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const header: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 10px",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
};

const headerLabel: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "1px",
  color: "rgba(0,0,0,0.5)",
  textTransform: "uppercase",
  flex: 1,
  textAlign: "left",
};

const badge: React.CSSProperties = {
  fontSize: 8,
  fontWeight: 700,
  color: "#2563eb",
  background: "rgba(37,99,235,0.1)",
  padding: "1px 5px",
  borderRadius: 8,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 4,
  padding: "4px 8px 10px",
};

const cell = (
  on: boolean,
  color: string,
  impl: boolean
): React.CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 3,
  padding: "6px 2px",
  background: !impl
    ? "rgba(0,0,0,0.02)"
    : on
    ? `${color}14`
    : "transparent",
  border: !impl
    ? "1px dashed rgba(0,0,0,0.10)"
    : on
    ? `1px solid ${color}55`
    : "1px solid rgba(0,0,0,0.06)",
  borderRadius: 6,
  cursor: impl ? "pointer" : "not-allowed",
  opacity: impl ? 1 : 0.55,
  fontFamily: "inherit",
  minHeight: 54,
});

const cellLabel = (on: boolean, impl: boolean): React.CSSProperties => ({
  fontSize: 8,
  lineHeight: 1.15,
  color: !impl
    ? "rgba(0,0,0,0.35)"
    : on
    ? "rgba(0,0,0,0.8)"
    : "rgba(0,0,0,0.55)",
  fontWeight: on ? 600 : 500,
  textAlign: "center",
  wordBreak: "break-word",
});
