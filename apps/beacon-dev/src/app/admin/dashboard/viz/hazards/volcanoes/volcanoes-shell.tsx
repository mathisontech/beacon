"use client";

import { useState } from "react";
import "./volcanoes-shell.css";
import { VolcanoPlayground } from "./volcano-playground";
import { DataManagerShell } from "./data-manager/data-manager-shell";

type TopTab = "map" | "data-manager";

const TOP_TABS: { id: TopTab; label: string }[] = [
  { id: "map", label: "Map" },
  { id: "data-manager", label: "Volcano Data Manager" },
];

export function VolcanoesShell() {
  const [tab, setTab] = useState<TopTab>("map");

  return (
    <div className="vsh-root">
      <nav className="vsh-tabs" role="tablist">
        {TOP_TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`vsh-tab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div className="vsh-body">
        {tab === "map" && <VolcanoPlayground />}
        {tab === "data-manager" && <DataManagerShell />}
      </div>
    </div>
  );
}
