// Feed-status strip under the thin map. Shows every registered feed,
// its pin count, and whether it errored on the last pass.

import type { FeedStatus } from "./use-events-poll";

interface Props {
  feeds: FeedStatus[];
}

export function ThinMapLegend({ feeds }: Props) {
  if (feeds.length === 0) {
    return (
      <div style={S.empty}>Waiting for first poll…</div>
    );
  }
  return (
    <div style={S.row}>
      {feeds.map((f) => (
        <div key={f.feedId} style={S.chip}>
          <span style={S.dot(f.lastError ? "#dc2626" : "#10b981")} />
          <span style={S.name}>{f.feedId}</span>
          <span style={S.count}>{f.count}</span>
          {f.lastError && <span style={S.err} title={f.lastError}>err</span>}
        </div>
      ))}
    </div>
  );
}

const S = {
  row: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 8,
    padding: "8px 12px",
    background: "#0f172a",
    borderTop: "1px solid #1e293b",
    fontFamily: "Inter, sans-serif",
    fontSize: 11,
    color: "#94a3b8",
  },
  empty: {
    padding: "8px 12px",
    background: "#0f172a",
    borderTop: "1px solid #1e293b",
    color: "#64748b",
    fontSize: 11,
    fontFamily: "Inter, sans-serif",
  },
  chip: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 8px",
    background: "#1e293b",
    borderRadius: 4,
  },
  dot: (color: string) => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: color,
    display: "inline-block",
  }),
  name: {
    color: "#cbd5e1",
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    fontWeight: 500,
  },
  count: {
    color: "#f8fafc",
    fontVariantNumeric: "tabular-nums" as const,
    fontWeight: 600,
  },
  err: {
    color: "#fca5a5",
    textTransform: "uppercase" as const,
    fontSize: 9,
    fontWeight: 700,
  },
};
