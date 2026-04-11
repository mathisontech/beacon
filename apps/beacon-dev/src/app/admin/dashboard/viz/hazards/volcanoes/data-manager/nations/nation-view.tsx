"use client";

import { useEffect, useState } from "react";
import type { NationBucket } from "../../volcano-country";
import type { Volcano } from "../../types";
import { VolcanoView } from "./volcano-view";

interface Props {
  nation: NationBucket;
}

export function NationView({ nation }: Props) {
  const [selected, setSelected] = useState<Volcano | null>(
    nation.volcanoes[0] ?? null
  );

  // When the active nation changes, reset the selected volcano to
  // its first entry so we never dangle on a volcano from another nation.
  useEffect(() => {
    setSelected(nation.volcanoes[0] ?? null);
  }, [nation.name, nation.volcanoes]);

  return (
    <div className="vdm-nation-view">
      <div className="vdm-nation-header">
        <h2 className="vdm-nation-name">{nation.name}</h2>
        <div className="vdm-nation-meta">
          {nation.volcanoes.length} volcano
          {nation.volcanoes.length === 1 ? "" : "es"} tracked
        </div>
      </div>

      <div className="vdm-volcano-list" role="tablist" aria-label="Volcanoes">
        {nation.volcanoes.map((v) => (
          <button
            key={v.id}
            role="tab"
            aria-selected={selected?.id === v.id}
            className={`vdm-volcano-chip level-${v.level}${
              selected?.id === v.id ? " active" : ""
            }`}
            onClick={() => setSelected(v)}
            title={v.region}
          >
            {v.name}
          </button>
        ))}
      </div>

      {selected && <VolcanoView volcano={selected} />}
    </div>
  );
}
