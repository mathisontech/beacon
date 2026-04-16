"use client";

import { useState } from "react";
import type { Layer } from "@/lib/layers";
import { isLayerImpl } from "@/lib/layers/implemented";

interface Props {
  label: string;
  layers: Layer[];
  onToggle: (id: string) => void;
  startOpen?: boolean;
}

export default function LayerPanelSection({ label, layers, onToggle, startOpen = false }: Props) {
  const [open, setOpen] = useState(startOpen);
  const activeCount = layers.filter((l) => l.enabled).length;

  return (
    <div style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <button onClick={() => setOpen(!open)} style={header}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span style={headerLabel}>{label}</span>
        {activeCount > 0 && <span style={badge}>{activeCount}</span>}
      </button>
      {open && (
        <div style={list}>
          {layers.map((l) => {
            const impl = isLayerImpl(l.id);
            return (
              <button
                key={l.id}
                onClick={() => impl && onToggle(l.id)}
                disabled={!impl}
                style={row(l.enabled, impl)}
                title={impl ? l.label : `${l.label} (not yet built)`}
              >
                {l.path ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path
                      d={l.path}
                      fill={
                        !impl
                          ? "rgba(0,0,0,0.18)"
                          : l.enabled
                          ? l.color || "#2563eb"
                          : "rgba(0,0,0,0.2)"
                      }
                    />
                  </svg>
                ) : (
                  <span style={dot(l.enabled, l.color)} />
                )}
                <span style={rowLabel(l.enabled, impl)}>{l.label}</span>
                {l.minZoom && <span style={zoomTag}>z{l.minZoom}+</span>}
                {l.heatmapFallback && <span style={zoomTag}>hm</span>}
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

const list: React.CSSProperties = {
  padding: "0 6px 6px",
};

const row = (on: boolean, impl = true): React.CSSProperties => ({
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "4px 8px",
  background: on ? "rgba(37,99,235,0.06)" : "transparent",
  border: "none",
  borderRadius: 4,
  cursor: impl ? "pointer" : "not-allowed",
  opacity: impl ? 1 : 0.55,
  fontFamily: "inherit",
  marginBottom: 1,
});

const dot = (on: boolean, color?: string): React.CSSProperties => ({
  width: 6,
  height: 6,
  borderRadius: 3,
  background: on ? (color || "#2563eb") : "rgba(0,0,0,0.15)",
  flexShrink: 0,
});

const rowLabel = (on: boolean, impl = true): React.CSSProperties => ({
  fontSize: 10,
  color: !impl
    ? "rgba(0,0,0,0.35)"
    : on
    ? "rgba(0,0,0,0.75)"
    : "rgba(0,0,0,0.5)",
  fontWeight: on ? 600 : 400,
  flex: 1,
  textAlign: "left",
});

const zoomTag: React.CSSProperties = {
  fontSize: 7,
  fontWeight: 600,
  color: "rgba(0,0,0,0.3)",
  background: "rgba(0,0,0,0.05)",
  padding: "1px 3px",
  borderRadius: 2,
  letterSpacing: "0.3px",
};
