"use client";

import type { TabId } from "./tab-id";
import { TAB_DEFINITIONS } from "./tab-definitions";
import { TabIconFor } from "./icons/tab-icon-for";

export function TabBar({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  return (
    <nav style={S.bar} aria-label="Main tabs">
      {TAB_DEFINITIONS.map((t) => {
        const isActive = active === t.id;
        const color = isActive ? "#1f3348" : "#9ca3af";
        return (
          <button key={t.id} style={S.tab(isActive)} onClick={() => onChange(t.id)}>
            <TabIconFor id={t.id} color={color} />
            <span style={S.label(isActive)}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const S = {
  bar: {
    display: "flex",
    alignItems: "stretch",
    height: 56,
    background: "#ffffff",
    borderTop: "1px solid #e5e7eb",
    flexShrink: 0,
    width: "100%",
  } as React.CSSProperties,
  tab: (active: boolean): React.CSSProperties => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    height: "100%",
    color: active ? "#1f3348" : "#9ca3af",
    background: "transparent",
    border: "none",
    borderTop: active ? "2px solid #1f3348" : "2px solid transparent",
    cursor: "pointer",
    padding: 0,
    transition: "all 0.15s ease",
  }),
  label: (active: boolean): React.CSSProperties => ({
    fontSize: 9,
    fontWeight: active ? 700 : 500,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    color: active ? "#1f3348" : "#9ca3af",
    lineHeight: 1,
  }),
};
