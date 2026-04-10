"use client";

// Start Button = the me+mine cockpit trigger.
// Checkpoint 1: renders a labeled button. Checkpoint 3 opens the cockpit panel.

import type { ScopeId } from "./scope-id";
import { SCOPE_LABELS } from "./scope-definitions";

export function StartButton({ scope, onClick }: { scope: ScopeId; onClick: () => void }) {
  return (
    <button style={S.btn} onClick={onClick} aria-label="Open cockpit">
      <span style={S.dot} />
      <span style={S.label}>{SCOPE_LABELS[scope]}</span>
    </button>
  );
}

const S = {
  btn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    height: 34,
    padding: "0 14px",
    background: "linear-gradient(135deg, #1f3348 0%, #162636 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: 17,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(31, 51, 72, 0.25)",
  } as React.CSSProperties,
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#10b981",
    boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.25)",
  } as React.CSSProperties,
  label: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.8px",
    textTransform: "uppercase" as const,
    color: "#ffffff",
  },
};
