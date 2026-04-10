"use client";

import type { LayerConfig } from "@/types/map";

interface Props {
  layers: LayerConfig[];
  onToggle: (id: string) => void;
  onOpacityChange: (id: string, opacity: number) => void;
}

const STATUS_DOT: Record<string, string> = {
  fresh: "bg-green-500",
  stale: "bg-yellow-500",
  error: "bg-red-500",
  loading: "bg-blue-400 animate-pulse",
};

export default function LayerPanel({ layers, onToggle, onOpacityChange }: Props) {
  const grouped = layers.reduce<Record<string, LayerConfig[]>>((acc, l) => {
    (acc[l.category] ||= []).push(l);
    return acc;
  }, {});

  return (
    <div className="w-64 bg-beacon-surface border-r border-beacon-border h-full overflow-y-auto p-3">
      <h2 className="text-xs font-semibold text-beacon-muted uppercase tracking-wider mb-3">
        Layers
      </h2>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-4">
          <h3 className="text-xs text-beacon-muted mb-2">{category}</h3>
          {items.map((layer) => (
            <div key={layer.id} className="mb-2">
              <label className="flex items-center gap-2 text-sm text-beacon-text cursor-pointer">
                <input
                  type="checkbox"
                  checked={layer.enabled}
                  onChange={() => onToggle(layer.id)}
                  className="rounded border-beacon-border"
                />
                <span
                  className={`w-2 h-2 rounded-full ${STATUS_DOT[layer.status]}`}
                />
                {layer.name}
              </label>
              {layer.enabled && (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={layer.opacity}
                  onChange={(e) =>
                    onOpacityChange(layer.id, parseFloat(e.target.value))
                  }
                  className="w-full mt-1 h-1 accent-beacon-accent"
                />
              )}
              {layer.lastUpdated && (
                <p className="text-[10px] text-beacon-muted mt-0.5">
                  {new Date(layer.lastUpdated).toLocaleTimeString()}
                </p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
