"use client";

import type { MapView } from "@/types/map";

interface Props {
  active: MapView;
  onChange: (view: MapView) => void;
}

const VIEWS: { id: MapView; label: string }[] = [
  { id: "photo", label: "3D Photo" },
  { id: "clay", label: "3D Clay" },
  { id: "lowdata", label: "2D Low-Data" },
];

export default function ViewToggle({ active, onChange }: Props) {
  return (
    <div className="flex bg-white border border-[#e5e7eb] rounded-md overflow-hidden">
      {VIEWS.map((v) => (
        <button
          key={v.id}
          onClick={() => onChange(v.id)}
          className={`px-3 py-1.5 text-xs transition-colors ${
            active === v.id
              ? "bg-[#1f3348] text-white"
              : "text-[#6b7280] hover:text-[#333]"
          }`}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
