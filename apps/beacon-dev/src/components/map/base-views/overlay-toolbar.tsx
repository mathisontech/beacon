'use client';

import { useState } from 'react';

export type OverlayType = 'polygons' | 'heatmap' | 'labels';

interface Props {
  active: OverlayType[];
  onChange: (active: OverlayType[]) => void;
}

const overlays: { key: OverlayType; label: string }[] = [
  { key: 'polygons', label: 'Polygons' },
  { key: 'heatmap', label: 'Heatmap' },
  { key: 'labels', label: 'Labels' },
];

const pill: React.CSSProperties = {
  padding: '4px 10px',
  fontSize: 11,
  borderRadius: 4,
  border: '1px solid #d1d5db',
  cursor: 'pointer',
  transition: 'all 0.15s',
};

export default function OverlayToolbar({ active, onChange }: Props) {
  return (
    <div style={{
      position: 'absolute',
      top: 10,
      left: 10,
      zIndex: 20,
      display: 'flex',
      gap: 4,
      background: 'rgba(255,255,255,0.92)',
      borderRadius: 6,
      padding: 4,
      boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
    }}>
      {overlays.map((o) => {
        const on = active.includes(o.key);
        return (
          <button
            key={o.key}
            onClick={() =>
              onChange(on ? active.filter((a) => a !== o.key) : [...active, o.key])
            }
            style={{
              ...pill,
              background: on ? '#111827' : '#fff',
              color: on ? '#fff' : '#374151',
              borderColor: on ? '#111827' : '#d1d5db',
              fontWeight: on ? 600 : 400,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function useOverlays(defaults: OverlayType[] = []) {
  const [active, setActive] = useState<OverlayType[]>(defaults);
  return { active, setActive };
}
