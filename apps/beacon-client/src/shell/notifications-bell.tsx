"use client";

import { BellIcon } from "./icons/bell-icon";

export function NotificationsBell({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button style={S.btn} onClick={onClick} aria-label="Notifications">
      <BellIcon color="#1f3348" />
      {count > 0 && <span style={S.badge}>{count > 99 ? "99+" : count}</span>}
    </button>
  );
}

const S = {
  btn: {
    position: "relative",
    width: 34,
    height: 34,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 17,
    cursor: "pointer",
  } as React.CSSProperties,
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    padding: "0 4px",
    borderRadius: 8,
    background: "#dc2626",
    color: "#ffffff",
    fontSize: 9,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1.5px solid #ffffff",
  } as React.CSSProperties,
};
