"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./playground.css";
import type { AlertLevel, Volcano } from "./types";
import { VOLCANOES } from "./volcano-data";
import { LEVELS } from "./volcano-levels";
import { makePinIcon } from "./make-pin-icon";
import { useLeafletCdn } from "./use-leaflet-cdn";
import { VolcanoDetailPanel } from "./volcano-detail-panel";
import { getRecentlyErupting } from "./get-recent-eruptions";
import { RecentEruptionsFlyout } from "./recent-eruptions-flyout";
import { volcanoSvg } from "./volcano-svg";

// Minimal surface of the Leaflet globals we touch. Keeps us from
// pulling @types/leaflet into the workspace just for the playground.
type LDivIconOpts = {
  className: string;
  html: string;
  iconSize: [number, number];
  iconAnchor: [number, number];
};
type LGlobal = {
  map: (el: HTMLElement, opts: { zoomControl: boolean; worldCopyJump: boolean }) => LMap;
  tileLayer: (url: string, opts: Record<string, unknown>) => LTile;
  layerGroup: () => LLayerGroup;
  marker: (ll: [number, number], opts: { icon: unknown }) => LMarker;
  divIcon: (opts: LDivIconOpts) => unknown;
};
type LMap = {
  setView: (ll: [number, number], z: number) => LMap;
  flyTo: (ll: [number, number], z: number, opts?: { duration?: number }) => LMap;
  removeLayer: (g: unknown) => void;
  addLayer: (g: unknown) => void;
  remove: () => void;
};
type LTile = { addTo: (m: LMap) => LTile };
type LLayerGroup = {
  addTo: (m: LMap) => LLayerGroup;
  addLayer: (x: unknown) => void;
};
type LMarker = {
  on: (event: string, handler: () => void) => LMarker;
};

export function VolcanoPlayground() {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LMap | null>(null);
  const groupsRef = useRef<Record<AlertLevel, LLayerGroup> | null>(null);
  const L = useLeafletCdn() as LGlobal | null;
  const [offLevels, setOffLevels] = useState<Set<AlertLevel>>(() => new Set());
  const [selected, setSelected] = useState<Volcano | null>(null);
  const [recentOpen, setRecentOpen] = useState(false);

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    LEVELS.forEach((l) => (out[l.id] = 0));
    VOLCANOES.forEach((v) => (out[v.level] = (out[v.level] || 0) + 1));
    return out;
  }, []);

  const visibleCount = useMemo(
    () => VOLCANOES.filter((v) => !offLevels.has(v.level)).length,
    [offLevels]
  );

  const recent = useMemo(() => getRecentlyErupting(), []);

  // Init map once Leaflet is loaded.
  useEffect(() => {
    if (!L || !mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, {
      zoomControl: true,
      worldCopyJump: true,
    }).setView([40, -130], 4);

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles © Esri", maxZoom: 18 }
    ).addTo(map);

    // Dim-everything-except-the-pins overlay. Set opacity to 0 to disable.
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
      { opacity: 0.35, attribution: "" }
    ).addTo(map);

    const groups = Object.fromEntries(
      LEVELS.map((l) => [l.id, L.layerGroup().addTo(map)])
    ) as Record<AlertLevel, LLayerGroup>;

    VOLCANOES.forEach((v) => {
      const icon = makePinIcon(L, v.level);
      const m = L.marker([v.lat, v.lng], { icon });
      m.on("click", () => setSelected(v));
      (groups[v.level] || groups.unknown).addLayer(m);
    });

    mapRef.current = map;
    groupsRef.current = groups;

    return () => {
      map.remove();
      mapRef.current = null;
      groupsRef.current = null;
    };
  }, [L]);

  // Apply per-level visibility when the legend toggles.
  useEffect(() => {
    const map = mapRef.current;
    const groups = groupsRef.current;
    if (!map || !groups) return;
    LEVELS.forEach((l) => {
      const g = groups[l.id];
      if (!g) return;
      if (offLevels.has(l.id)) map.removeLayer(g);
      else map.addLayer(g);
    });
  }, [offLevels]);

  const toggleLevel = (id: AlertLevel) => {
    setOffLevels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const closePanel = useCallback(() => setSelected(null), []);
  const closeFlyout = useCallback(() => setRecentOpen(false), []);

  const flyToVolcano = useCallback((v: Volcano) => {
    const map = mapRef.current;
    if (map) map.flyTo([v.lat, v.lng], 8, { duration: 1.2 });
    setSelected(v);
  }, []);

  return (
    <div className="vp-root">
      <div ref={mapDivRef} className="vp-map" />

      <div className="vp-header">
        <div className="title">Beacon · Volcano Layer</div>
        <div className="stat">
          <b>{visibleCount}</b> of {VOLCANOES.length} volcanoes
        </div>
      </div>

      <div className="vp-legend">
        <h3>Alert Levels (USGS HANS)</h3>
        {LEVELS.filter((l) => counts[l.id] > 0).map((l) => {
          const off = offLevels.has(l.id);
          return (
            <div
              key={l.id}
              className={`vp-legend-row${off ? " off" : ""}`}
              title={l.blurb}
              onClick={() => toggleLevel(l.id)}
            >
              <div
                className={`sw sw-volcano level-${l.id}`}
                dangerouslySetInnerHTML={{ __html: volcanoSvg(l.id, 18) }}
              />
              <div className="lbl">{l.label}</div>
              <div className="ct">{counts[l.id]}</div>
            </div>
          );
        })}

        <div className="vp-legend-divider" />

        <div
          className={`vp-legend-row vp-legend-recent${recentOpen ? " active" : ""}`}
          title="Click to see volcanoes with eruptions in the last 12 months"
          onClick={() => setRecentOpen((v) => !v)}
        >
          <div className="sw sw-recent" />
          <div className="lbl">Recent eruptions</div>
          <div className="ct">{recent.length}</div>
        </div>

        <hr />
        <div className="footnote">
          Click a level to toggle.
          <br />
          Click a pin or a recent row for details.
        </div>
      </div>

      <RecentEruptionsFlyout
        open={recentOpen}
        items={recent}
        onSelect={flyToVolcano}
        onClose={closeFlyout}
      />

      <VolcanoDetailPanel volcano={selected} onClose={closePanel} />
    </div>
  );
}
