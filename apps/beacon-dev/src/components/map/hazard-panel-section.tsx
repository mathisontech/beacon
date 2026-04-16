"use client";

import { useState } from "react";
import type { HazardCategory, HazardLayer } from "@/lib/layers";

interface Props {
  category: HazardCategory;
  onToggleSublayer: (hazardId: string, sublayer: string) => void;
  enabledSublayers: Set<string>;
}

export default function HazardPanelSection({ category, onToggleSublayer, enabledSublayers }: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const activeCount = [...enabledSublayers].length;

  return (
    <div style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <button onClick={() => setOpen(!open)} style={header}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span style={headerLabel}>{category.label}</span>
        {activeCount > 0 && <span style={badge}>{activeCount}</span>}
      </button>
      {open && (
        <div style={{ padding: "0 6px 6px" }}>
          {category.hazards.map((h) => (
            <HazardRow
              key={h.id}
              hazard={h}
              expanded={expanded === h.id}
              onExpand={() => setExpanded(expanded === h.id ? null : h.id)}
              onToggle={(sub) => onToggleSublayer(h.id, sub)}
              enabledSublayers={enabledSublayers}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HazardRow({
  hazard,
  expanded,
  onExpand,
  onToggle,
  enabledSublayers,
}: {
  hazard: HazardLayer;
  expanded: boolean;
  onExpand: () => void;
  onToggle: (sub: string) => void;
  enabledSublayers: Set<string>;
}) {
  const subs = [
    { key: "risk", layer: hazard.sublayers.risk },
    { key: "activeEvents", layer: hazard.sublayers.activeEvents },
    { key: "eventsOfInterest", layer: hazard.sublayers.eventsOfInterest },
    { key: "coverage", layer: hazard.sublayers.coverage },
  ];
  const activeHere = subs.filter((s) => enabledSublayers.has(s.layer.id)).length;

  return (
    <div style={{ marginBottom: 1 }}>
      <button onClick={onExpand} style={hazardRow}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={hazard.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d={hazard.path} />
        </svg>
        <span style={hazardLabel}>{hazard.label}</span>
        {activeHere > 0 && (
          <span style={{ ...subBadge, background: `${hazard.color}18`, color: hazard.color }}>{activeHere}</span>
        )}
      </button>
      {expanded && (
        <div style={subList}>
          {subs.map((s) => {
            const on = enabledSublayers.has(s.layer.id);
            return (
              <button key={s.key} onClick={() => onToggle(s.layer.id)} style={subRow(on, hazard.color)}>
                <span style={subDot(on, hazard.color)} />
                <span style={subLabel}>{s.layer.label}</span>
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

const hazardRow: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "4px 8px",
  background: "none",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontFamily: "inherit",
};

const hazardLabel: React.CSSProperties = {
  fontSize: 10,
  color: "rgba(0,0,0,0.65)",
  flex: 1,
  textAlign: "left",
};

const subBadge: React.CSSProperties = {
  fontSize: 7,
  fontWeight: 700,
  padding: "1px 4px",
  borderRadius: 6,
};

const subList: React.CSSProperties = {
  paddingLeft: 22,
  paddingBottom: 2,
};

const subRow = (on: boolean, color: string): React.CSSProperties => ({
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 5,
  padding: "3px 6px",
  background: on ? `${color}0a` : "transparent",
  border: "none",
  borderRadius: 3,
  cursor: "pointer",
  fontFamily: "inherit",
  marginBottom: 1,
});

const subDot = (on: boolean, color: string): React.CSSProperties => ({
  width: 5,
  height: 5,
  borderRadius: 3,
  background: on ? color : "rgba(0,0,0,0.12)",
  flexShrink: 0,
});

const subLabel: React.CSSProperties = {
  fontSize: 9,
  color: "rgba(0,0,0,0.55)",
  textAlign: "left",
};
