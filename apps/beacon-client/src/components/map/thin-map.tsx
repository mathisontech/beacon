// Thin map — no base tiles, just a coordinate plane with pins.
// Polls /api/events through useEventsPoll and renders every event as a dot.

"use client";

import { useEffect, useRef, useState } from "react";
import { useEventsPoll } from "./use-events-poll";
import { ThinMapGrid } from "./thin-map-grid";
import { ThinMapPin } from "./thin-map-pin";
import { ThinMapLegend } from "./thin-map-legend";

export function ThinMap() {
  const { snapshot, loading, error } = useEventsPoll(30_000);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.max(320, rect.width);
      setDims({ width: w, height: w / 2 });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const events = snapshot?.events ?? [];
  const feeds = snapshot?.feeds ?? [];

  return (
    <div style={S.root}>
      <div style={S.header}>
        <span style={S.title}>Thin map — C1 public feed ingestions</span>
        <span style={S.status}>
          {loading && !snapshot
            ? "loading…"
            : error
              ? `error: ${error}`
              : `${events.length} events`}
        </span>
      </div>
      <div ref={containerRef} style={S.svgWrap}>
        <svg
          width={dims.width}
          height={dims.height}
          viewBox={`0 0 ${dims.width} ${dims.height}`}
          style={{ display: "block" }}
        >
          <ThinMapGrid width={dims.width} height={dims.height} />
          {events.map((e) => (
            <ThinMapPin
              key={e.id}
              event={e}
              width={dims.width}
              height={dims.height}
            />
          ))}
        </svg>
      </div>
      <ThinMapLegend feeds={feeds} />
    </div>
  );
}

const S = {
  root: {
    display: "flex",
    flexDirection: "column" as const,
    flex: 1,
    background: "#0b0f2a",
    color: "#f8fafc",
    overflow: "hidden" as const,
  },
  header: {
    display: "flex",
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: "10px 14px",
    borderBottom: "1px solid #1e293b",
    fontFamily: "Inter, sans-serif",
  },
  title: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#cbd5e1",
  },
  status: {
    fontSize: 11,
    color: "#94a3b8",
    fontVariantNumeric: "tabular-nums" as const,
  },
  svgWrap: {
    flex: 1,
    padding: 12,
    display: "flex",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    overflow: "auto" as const,
  },
};
