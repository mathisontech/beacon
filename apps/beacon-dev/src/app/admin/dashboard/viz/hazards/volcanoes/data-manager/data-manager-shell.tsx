"use client";

import { useState } from "react";
import Link from "next/link";
import "./data-manager.css";
import { SourcesPanel } from "./sources/sources-panel";
import { PipelinesPanel } from "./pipelines/pipelines-panel";

type Tab = "sources" | "pipelines";

const TABS: { id: Tab; label: string }[] = [
  { id: "sources", label: "Data Sources" },
  { id: "pipelines", label: "Per-Volcano Pipelines" },
];

export function DataManagerShell() {
  const [tab, setTab] = useState<Tab>("sources");

  return (
    <div className="vdm-root">
      <header className="vdm-header">
        <div className="vdm-crumbs">
          <Link href="/admin/dashboard/viz/hazards/volcanoes" className="vdm-back">
            Back to map
          </Link>
          <span className="vdm-sep">/</span>
          <span className="vdm-title">Volcano Data Manager</span>
        </div>
        <div className="vdm-subtitle">
          Internal view. Raw feeds, ingestion health, and per-volcano aggregation.
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
        {tab === "sources" && <SourcesPanel />}
        {tab === "pipelines" && <PipelinesPanel />}
      </main>
    </div>
  );
}
