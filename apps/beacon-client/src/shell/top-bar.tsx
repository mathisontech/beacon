"use client";

import type { ScopeId } from "./scope-id";
import { StartButton } from "./start-button";
import { NotificationsBell } from "./notifications-bell";

export function TopBar({
  scope,
  notificationCount,
  onStartClick,
  onBellClick,
}: {
  scope: ScopeId;
  notificationCount: number;
  onStartClick: () => void;
  onBellClick: () => void;
}) {
  return (
    <header style={S.bar}>
      <StartButton scope={scope} onClick={onStartClick} />
      <div style={S.title}>BEACON</div>
      <NotificationsBell count={notificationCount} onClick={onBellClick} />
    </header>
  );
}

const S = {
  bar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    height: 56,
    padding: "0 14px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    flexShrink: 0,
  } as React.CSSProperties,
  title: {
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: "2.5px",
    color: "#1f3348",
  } as React.CSSProperties,
};
