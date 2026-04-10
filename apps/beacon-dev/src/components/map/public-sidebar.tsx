"use client";

import { useState } from "react";

/* eslint-disable @next/next/no-img-element */

// ── Mock data for demo ──────────────────────────────────────────────
const MOCK = {
  location: { name: "Asheville, NC", summary: "Sunny, mid 70s" },
  threats: [
    { level: "elevated" as const, label: "Flood Watch", timeframe: "Now" },
    { level: "high" as const, label: "Hurricane Milton", timeframe: "~4 days" },
    { level: "elevated" as const, label: "High Fire Risk", timeframe: "Tomorrow" },
  ],
  status: {
    current: "sheltering" as const,
    sharing: ["EMS", "Contacts"],
  },
  requests: [
    { id: "r1", type: "auto" as const, text: "Are you safe?" },
    { id: "r2", type: "nearby" as const, text: "Help needed 0.3mi away" },
  ],
  lovedOnes: [
    { name: "Mom", hazard: true, mood: "okay" },
    { name: "Jake", hazard: false, mood: "good" },
    { name: "Sarah", hazard: false, mood: null },
  ],
  locations: [
    { name: "Home", change: true },
    { name: "Office", change: false },
  ],
  groups: [
    { name: "Neighborhood", alerts: 1 },
    { name: "Family", alerts: 0 },
  ],
  php: { active: 2, nearby: 1 },
};

// ── Threat levels available: none, elevated, high, severe ───────────

// ── Status labels ───────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  okay: "ALL CLEAR",
  sheltering: "SHELTERING",
  evacuating: "EVACUATING",
  helping: "EN ROUTE TO HELP",
  needsHelp: "NEEDS HELP",
};

// ── Styles (monochrome white on dark, no colored dots/badges) ───────
const S = {
  sidebar: (open: boolean): React.CSSProperties => ({
    width: open ? 220 : 44,
    height: "100%",
    background: "linear-gradient(180deg, #162636 0%, #1f3348 50%, #2a4560 100%)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    transition: "width 0.2s ease",
    overflow: "hidden",
    position: "relative",
    boxShadow: "4px 0 12px rgba(0,0,0,0.25)",
  }),
  header: (open: boolean): React.CSSProperties => ({
    padding: open ? "16px 14px" : "14px 8px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: open ? "flex-start" : "center",
    gap: 10,
    cursor: "pointer",
    flexShrink: 0,
  }),
  logo: { width: 28, height: 16, objectFit: "contain" as const, flexShrink: 0 },
  title: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: "3px",
    color: "white",
    whiteSpace: "nowrap" as const,
  },
  locationBar: {
    padding: "10px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    flexShrink: 0,
    cursor: "pointer",
  } as React.CSSProperties,
  locationName: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.8px",
    textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.85)",
  } as React.CSSProperties,
  locationSummary: {
    fontSize: 9,
    color: "rgba(255,255,255,0.4)",
    marginTop: 2,
    letterSpacing: "0.3px",
  } as React.CSSProperties,
  clickable: {
    cursor: "pointer",
  } as React.CSSProperties,
  sections: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "4px 0",
  },
  section: {
    padding: "8px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "1.2px",
    textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.3)",
    marginBottom: 5,
  } as React.CSSProperties,
  row: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "3px 0",
    fontSize: 10,
    color: "rgba(255,255,255,0.65)",
  } as React.CSSProperties,
  dim: { color: "rgba(255,255,255,0.35)", fontSize: 9 } as React.CSSProperties,
  bright: { color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: 10 } as React.CSSProperties,
  tag: {
    fontSize: 8,
    fontWeight: 500,
    letterSpacing: "0.3px",
    padding: "1px 4px",
    borderRadius: 2,
    background: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.35)",
  } as React.CSSProperties,
  requestCard: {
    padding: "6px 8px",
    margin: "4px 0",
    borderRadius: 6,
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 10,
    color: "rgba(255,255,255,0.9)",
    fontWeight: 600,
  } as React.CSSProperties,
  requestActions: {
    display: "flex",
    gap: 6,
    marginTop: 5,
  } as React.CSSProperties,
  actionBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 22,
    height: 22,
    borderRadius: 4,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    cursor: "pointer",
  } as React.CSSProperties,
  count: {
    fontSize: 9,
    fontWeight: 700,
    color: "rgba(255,255,255,0.5)",
    marginLeft: 4,
  } as React.CSSProperties,
  vibeBtn: {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.5px",
    padding: "3px 8px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.45)",
    border: "none",
    cursor: "pointer",
    marginTop: 4,
    display: "inline-block",
    fontFamily: "inherit",
    textTransform: "uppercase" as const,
  } as React.CSSProperties,
};

export default function PublicSidebar() {
  const [open, setOpen] = useState(true);
  const d = MOCK;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          width: 40,
          height: 40,
          borderRadius: 20,
          background: "rgba(31,51,72,0.85)",
          border: "1px solid rgba(255,255,255,0.15)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20,
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          padding: 0,
          flexShrink: 0,
        }}
        title="Open menu"
      >
        <img src="/logo.png" alt="Beacon" style={{ width: 24, height: 14, objectFit: "contain" }} />
      </button>
    );
  }

  return (
    <div style={S.sidebar(true)}>
      {/* Header */}
      <div style={S.header(true)} onClick={() => setOpen(false)}>
        <img src="/logo.png" alt="Beacon" style={S.logo} />
        <span style={S.title}>BEACON</span>
      </div>

      {/* Location overview */}
      <div style={S.locationBar}>
        <div style={S.locationName}>{d.location.name}</div>
        <div style={S.locationSummary}>{d.location.summary}</div>
      </div>

      {/* Status sections */}
      <div style={S.sections}>

        {/* 1. THREAT LEVEL */}
        <div style={S.section}>
          <div style={S.sectionLabel}>THREATS</div>
          {d.threats.map((t, i) => (
            <div key={i} style={{ ...S.row, ...S.clickable, justifyContent: "space-between" }}>
              <span style={S.bright}>{t.label}</span>
              <span style={S.dim}>{t.timeframe}</span>
            </div>
          ))}
        </div>

        {/* 2. YOUR STATUS */}
        <div style={{ ...S.section, ...S.clickable }}>
          <div style={S.sectionLabel}>YOUR STATUS</div>
          <div style={{ ...S.row, justifyContent: "space-between" }}>
            <span style={S.bright}>{STATUS_LABELS[d.status.current] || "OK"}</span>
            <div style={{ display: "flex", gap: 3 }}>
              {d.status.sharing.map((s) => (
                <span key={s} style={S.tag}>{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. REQUESTS */}
        <div style={{ ...S.section, background: "rgba(255,255,255,0.03)", borderLeft: "2px solid rgba(255,255,255,0.2)" }}>
          <div style={{ ...S.sectionLabel, color: "rgba(255,255,255,0.5)" }}>
            REQUESTS
            {d.requests.length > 0 && <span style={{ ...S.count, color: "rgba(255,255,255,0.7)" }}>{d.requests.length}</span>}
          </div>
          {d.requests.map((r) => (
            <div key={r.id} style={S.requestCard}>
              <div>{r.text}</div>
              <div style={S.requestActions}>
                {r.type === "auto" ? (
                  <>
                    {/* Check = I'm safe */}
                    <div style={S.actionBtn} title="I'm safe">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    {/* X = Need help */}
                    <div style={S.actionBtn} title="Need help">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                    {/* Message = Reply */}
                    <div style={S.actionBtn} title="Reply">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Arrow = Go help */}
                    <div style={S.actionBtn} title="Go help">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </svg>
                    </div>
                    {/* Dismiss */}
                    <div style={S.actionBtn} title="Dismiss">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 4. LOVED ONES */}
        <div style={S.section}>
          <div style={S.sectionLabel}>LOVED ONES</div>
          {d.lovedOnes
            .sort((a, b) => (b.hazard ? 1 : 0) - (a.hazard ? 1 : 0))
            .map((p) => (
              <div key={p.name} style={{ ...S.row, ...S.clickable, justifyContent: "space-between" }}>
                <span style={p.hazard ? S.bright : undefined}>{p.name}</span>
                {p.hazard && <span style={S.dim}>in hazard zone</span>}
                {!p.hazard && p.mood && <span style={S.dim}>{p.mood}</span>}
              </div>
            ))}
          <button style={S.vibeBtn}>DAILY CHECK-IN</button>
        </div>

        {/* 5. SAVED LOCATIONS */}
        <div style={S.section}>
          <div style={S.sectionLabel}>SAVED LOCATIONS</div>
          {d.locations.map((loc) => (
            <div key={loc.name} style={{ ...S.row, ...S.clickable, justifyContent: "space-between" }}>
              <span>{loc.name}</span>
              {loc.change && <span style={{ ...S.dim, fontWeight: 600 }}>risk changed</span>}
            </div>
          ))}
        </div>

        {/* 6. GROUPS */}
        <div style={S.section}>
          <div style={S.sectionLabel}>GROUPS</div>
          {d.groups.map((g) => (
            <div key={g.name} style={{ ...S.row, ...S.clickable, justifyContent: "space-between" }}>
              <span>{g.name}</span>
              {g.alerts > 0 && <span style={S.count}>{g.alerts}</span>}
            </div>
          ))}
        </div>

        {/* 7. PEOPLE HELPING PEOPLE */}
        <div style={{ ...S.section, ...S.clickable }}>
          <div style={S.sectionLabel}>PEOPLE HELPING PEOPLE</div>
          <div style={{ ...S.row, justifyContent: "space-between" }}>
            <span>{d.php.active} active nearby</span>
            <span style={S.dim}>{d.php.nearby} request near you</span>
          </div>
        </div>

      </div>
    </div>
  );
}
