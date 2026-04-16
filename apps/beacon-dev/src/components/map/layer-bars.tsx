"use client";

import { useState } from "react";
import { LAYER_REGISTRY, type HazardLayer } from "@/lib/layers";
import LayerBar from "./layer-bar";

interface Props {
  enabledLayers: Set<string>;
  onLayerToggle: (id: string) => void;
  activeHazards: Set<string>;
  onHazardToggle: (id: string) => void;
}

export default function LayerBars({ enabledLayers, onLayerToggle, activeHazards, onHazardToggle }: Props) {
  return (
    <div style={container}>
      <LayerBar layers={LAYER_REGISTRY.baseMap.layers} enabled={enabledLayers} onToggle={onLayerToggle} />
      <LayerBar layers={LAYER_REGISTRY.weather.layers} enabled={enabledLayers} onToggle={onLayerToggle} />
      <HazardRow hazards={LAYER_REGISTRY.hazards.hazards} active={activeHazards} onToggle={onHazardToggle} />
      <LayerBar layers={LAYER_REGISTRY.live.layers} enabled={enabledLayers} onToggle={onLayerToggle} />
      <LayerBar layers={LAYER_REGISTRY.reference.layers} enabled={enabledLayers} onToggle={onLayerToggle} />
      <LayerBar layers={LAYER_REGISTRY.fun.layers} enabled={enabledLayers} onToggle={onLayerToggle} />
    </div>
  );
}

function HazardRow({ hazards, active, onToggle }: { hazards: HazardLayer[]; active: Set<string>; onToggle: (id: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={rowBar}>
      {hazards.map((h) => {
        const on = active.has(h.id);
        return (
          <button
            key={h.id}
            onClick={() => onToggle(h.id)}
            onMouseEnter={() => setHovered(h.id)}
            onMouseLeave={() => setHovered(null)}
            title={h.label}
            style={hBtn(on, h.color)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path d={h.path} fill={on ? h.color : h.dimColor} />
            </svg>
            {hovered === h.id && (
              <span style={{ ...tip, background: h.color }}>{h.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

const container: React.CSSProperties = {
  position: "absolute",
  top: 10,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  zIndex: 15,
};

const rowBar: React.CSSProperties = {
  display: "flex",
  gap: 1,
  padding: "3px 5px",
  background: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(12px)",
  borderRadius: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

const hBtn = (on: boolean, color: string): React.CSSProperties => ({
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

const tip: React.CSSProperties = {
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
