"use client";

import { useState } from "react";
import type { Layer } from "@/lib/layers";
import { isLayerImpl } from "@/lib/layers/implemented";

interface Props {
  label: string;
  layers: Layer[];
  enabled: Set<string>;
  onToggle: (id: string) => void;
  startOpen?: boolean;
  emptyNote?: string;
}

// 4-across icon grid section (collapsible). Used for the top
// "Events of Interest" and "Live Conditions" blocks in the panel.
export default function LayerGridSection({
  label,
  layers,
  enabled,
  onToggle,
  startOpen = true,
  emptyNote,
}: Props) {
  const [open, setOpen] = useState(startOpen);
  const activeCount = layers.filter((l) => enabled.has(l.id)).length;
  const isEmpty = layers.length === 0;

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
        <span style={headerLabel}>{label}</span>
        {activeCount > 0 && <span style={badge}>{activeCount}</span>}
      </button>
      {open && isEmpty && (
        <div style={emptyBox}>{emptyNote ?? "Coming soon."}</div>
      )}
      {open && !isEmpty && (
        <div style={grid}>
          {layers.map((l) => {
            const on = enabled.has(l.id);
            const impl = isLayerImpl(l.id);
            const color = l.color || "#2563eb";
            return (
              <button
                key={l.id}
                onClick={() => impl && onToggle(l.id)}
                disabled={!impl}
                style={cell(on, color, impl)}
                title={impl ? l.label : `${l.label} (not yet built)`}
              >
                {l.path ? (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                      d={l.path}
                      fill={
                        !impl
                          ? "rgba(0,0,0,0.18)"
                          : on
                          ? color
                          : "rgba(0,0,0,0.25)"
                      }
                    />
                  </svg>
                ) : (
                  <span style={dot(on, color)} />
                )}
                <span style={cellLabel(on, impl)}>{l.label}</span>
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

const emptyBox: React.CSSProperties = {
  padding: "10px 12px 14px",
  fontSize: 9,
  color: "rgba(0,0,0,0.4)",
  fontStyle: "italic",
  textAlign: "center",
};

const dot = (on: boolean, color: string): React.CSSProperties => ({
  width: 10,
  height: 10,
  borderRadius: 5,
  background: on ? color : "rgba(0,0,0,0.2)",
});
