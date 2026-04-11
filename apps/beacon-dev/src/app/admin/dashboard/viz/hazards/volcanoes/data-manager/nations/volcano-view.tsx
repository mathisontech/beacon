"use client";

import { useState } from "react";
import type { Volcano } from "../../types";
import { VolcanoPipeline } from "./volcano-pipeline";
import { VolcanoOverview } from "./volcano-overview";

type VTab = "pipeline" | "overview";

const VOLCANO_TABS: { id: VTab; label: string }[] = [
  { id: "pipeline", label: "Data Pipeline" },
  { id: "overview", label: "Current Overview" },
];

interface Props {
  volcano: Volcano;
}

export function VolcanoView({ volcano }: Props) {
  const [tab, setTab] = useState<VTab>("overview");

  return (
    <section className="vdm-volcano-view">
      <header className="vdm-volcano-head">
        <div className="vdm-volcano-title">{volcano.name}</div>
        <div className="vdm-volcano-sub">
          {volcano.region} · {volcano.obs} · {volcano.level}
        </div>
      </header>

      <nav className="vdm-subtabs" role="tablist" aria-label="Volcano detail tabs">
        {VOLCANO_TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`vdm-subtab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="vdm-volcano-body">
        {tab === "pipeline" && <VolcanoPipeline volcano={volcano} />}
        {tab === "overview" && <VolcanoOverview volcano={volcano} />}
      </div>
    </section>
  );
}
