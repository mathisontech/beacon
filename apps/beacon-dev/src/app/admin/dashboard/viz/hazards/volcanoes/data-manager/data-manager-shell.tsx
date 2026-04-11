"use client";

import { useState } from "react";
import "./data-manager.css";
import { SourceManagerPanel } from "./source-manager/source-manager-panel";
import { NationsPanel } from "./nations/nations-panel";

type Tab = "source-manager" | "nations";

const TABS: { id: Tab; label: string }[] = [
  { id: "source-manager", label: "Data Source Manager" },
  { id: "nations", label: "Nations" },
];

export function DataManagerShell() {
  const [tab, setTab] = useState<Tab>("source-manager");

  return (
    <div className="vdm-root">
      <header className="vdm-header">
        <div className="vdm-title">Volcano Data Manager</div>
        <div className="vdm-subtitle">
          Internal view. Raw feeds, coverage geometry, and per-volcano processing pipelines.
        </div>
      </header>

      <nav className="vdm-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`vdm-tab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="vdm-body">
        {tab === "source-manager" && <SourceManagerPanel />}
        {tab === "nations" && <NationsPanel />}
      </main>
    </div>
  );
}
