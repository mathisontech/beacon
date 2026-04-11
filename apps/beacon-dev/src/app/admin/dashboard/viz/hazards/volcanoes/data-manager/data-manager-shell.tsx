"use client";

import { useState } from "react";
import Link from "next/link";
import "./data-manager.css";
import { SourceManagerPanel } from "./source-manager/source-manager-panel";
import { ProcessorsPanel } from "./processors/processors-panel";

type Tab = "source-manager" | "processors";

const TABS: { id: Tab; label: string }[] = [
  { id: "source-manager", label: "Data Source Manager" },
  { id: "processors", label: "Data Source Processors" },
];

export function DataManagerShell() {
  const [tab, setTab] = useState<Tab>("source-manager");

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
        {tab === "source-manager" && <SourceManagerPanel />}
        {tab === "processors" && <ProcessorsPanel />}
      </main>
    </div>
  );
}
