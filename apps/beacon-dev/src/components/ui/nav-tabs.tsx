"use client";

import type { DevTab } from "@/types/map";

interface Props {
  active: DevTab;
  onChange: (tab: DevTab) => void;
}

const TABS: { id: DevTab; label: string }[] = [
  { id: "map", label: "Live World Map" },
  { id: "pipeline", label: "Data Pipeline" },
  { id: "observability", label: "Observability" },
  { id: "simulation", label: "Disaster Sim" },
  { id: "changelog", label: "Changelog" },
  { id: "settings", label: "Settings" },
];

export default function NavTabs({ active, onChange }: Props) {
  return (
    <nav className="flex items-center gap-1 bg-beacon-bg border-b border-beacon-border px-3 h-10">
      <span className="text-sm font-semibold text-beacon-text mr-4">
        Beacon Dev
      </span>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-3 py-1.5 text-xs rounded-t transition-colors ${
            active === tab.id
              ? "bg-beacon-surface text-beacon-text border-t border-x border-beacon-border"
              : "text-beacon-muted hover:text-beacon-text"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
