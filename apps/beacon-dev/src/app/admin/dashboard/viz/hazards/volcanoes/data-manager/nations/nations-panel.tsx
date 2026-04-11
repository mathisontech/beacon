"use client";

import { useMemo, useState } from "react";
import { bucketVolcanoesByNation } from "../../volcano-country";
import { NationView } from "./nation-view";

export function NationsPanel() {
  const buckets = useMemo(() => bucketVolcanoesByNation(), []);
  const [active, setActive] = useState<string>(buckets[0]?.name ?? "");

  const current = buckets.find((b) => b.name === active) ?? buckets[0];

  if (!current) {
    return (
      <div className="vdm-placeholder">
        <h2>No volcanoes loaded</h2>
      </div>
    );
  }

  return (
    <div className="vdm-nations">
      <aside className="vdm-nation-list" role="tablist" aria-label="Nations">
        {buckets.map((b) => (
          <button
            key={b.name}
            role="tab"
            aria-selected={b.name === active}
            className={`vdm-nation-chip${b.name === active ? " active" : ""}`}
            onClick={() => setActive(b.name)}
          >
            <span className="name">{b.name}</span>
            <span className="count">{b.volcanoes.length}</span>
          </button>
        ))}
      </aside>
      <div className="vdm-nation-body">
        <NationView nation={current} />
      </div>
    </div>
  );
}
