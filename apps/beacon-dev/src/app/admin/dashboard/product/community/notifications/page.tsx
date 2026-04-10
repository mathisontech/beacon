"use client";

import { useState } from "react";

type Filter = "all" | "contacts" | "groups" | "requests";

interface Notification {
  id: string;
  type: "contact-msg" | "group-msg" | "request-msg" | "status" | "help" | "alert";
  source: string;
  mailbox: "contacts" | "groups" | "requests";
  text: string;
  time: string;
  read: boolean;
}

const MOCK: Notification[] = [
  { id: "n1", type: "contact-msg", source: "Mom", mailbox: "contacts", text: "Made it to the shelter. All good here.", time: "8m ago", read: false },
  { id: "n2", type: "group-msg", source: "Montford Block 7", mailbox: "groups", text: "Jake R.: Power just flickered on Montford Ave", time: "2m ago", read: false },
  { id: "n3", type: "group-msg", source: "Family", mailbox: "groups", text: "Mom marked safe", time: "15m ago", read: false },
  { id: "n4", type: "request-msg", source: "Sarah M.", mailbox: "requests", text: "Hi, I live on Montford too. Can I join your block group?", time: "1h ago", read: false },
  { id: "n5", type: "request-msg", source: "Tom R.", mailbox: "requests", text: "Saw you have a generator listed. Could I borrow it?", time: "3h ago", read: true },
  { id: "n6", type: "group-msg", source: "Asheville Community", mailbox: "groups", text: "Marcus T.: Generator available for 3 households", time: "32m ago", read: true },
  { id: "n7", type: "contact-msg", source: "Jake", mailbox: "contacts", text: "Got it", time: "2h ago", read: true },
  { id: "n8", type: "help", source: "System", mailbox: "contacts", text: "Help needed 0.3mi away - water supplies", time: "45m ago", read: true },
  { id: "n9", type: "status", source: "System", mailbox: "contacts", text: "Mom entered a hazard zone", time: "1h ago", read: true },
];

const TYPE_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  "contact-msg": { bg: "#f0fdf4", border: "#10b981", label: "CONTACT" },
  "group-msg": { bg: "#eff6ff", border: "#3b82f6", label: "GROUP" },
  "request-msg": { bg: "#fef3c7", border: "#f59e0b", label: "REQUEST" },
  status: { bg: "#f3f4f6", border: "#6b7280", label: "STATUS" },
  help: { bg: "#faf5ff", border: "#8b5cf6", label: "HELP" },
  alert: { bg: "#fef2f2", border: "#ef4444", label: "ALERT" },
};

const S = {
  page: { padding: 24, fontFamily: "inherit" } as React.CSSProperties,
  title: { fontSize: 14, fontWeight: 700, letterSpacing: "0.5px", color: "#1f3348", marginBottom: 4 } as React.CSSProperties,
  subtitle: { fontSize: 11, color: "#6b7280", marginBottom: 20 } as React.CSSProperties,
  tabs: { display: "flex", gap: 0, borderBottom: "1px solid #e5e7eb", marginBottom: 16 } as React.CSSProperties,
  tab: (active: boolean): React.CSSProperties => ({
    padding: "8px 16px", fontSize: 11, fontWeight: active ? 700 : 600,
    letterSpacing: "0.5px", textTransform: "uppercase", color: active ? "#1f3348" : "#9ca3af",
    borderBottom: active ? "2px solid #1f3348" : "2px solid transparent",
    cursor: "pointer",
  }),
  stats: { display: "flex", gap: 12, marginBottom: 20 } as React.CSSProperties,
  stat: (color: string): React.CSSProperties => ({
    flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e5e7eb",
    borderLeft: `3px solid ${color}`,
  }),
  statVal: { fontSize: 18, fontWeight: 700, color: "#1f3348" } as React.CSSProperties,
  statLabel: { fontSize: 9, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" as const, color: "#9ca3af", marginTop: 2 } as React.CSSProperties,
  item: (read: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px",
    borderBottom: "1px solid #f3f4f6", background: read ? "transparent" : "#fafbfc",
    opacity: read ? 0.7 : 1,
  }),
  typeBadge: (type: string): React.CSSProperties => ({
    fontSize: 8, fontWeight: 700, letterSpacing: "0.5px", padding: "2px 6px",
    borderRadius: 3, flexShrink: 0, marginTop: 2,
    background: TYPE_COLORS[type]?.bg || "#f3f4f6",
    color: TYPE_COLORS[type]?.border || "#6b7280",
    border: `1px solid ${TYPE_COLORS[type]?.border || "#e5e7eb"}`,
  }),
  itemContent: { flex: 1 } as React.CSSProperties,
  itemSource: { fontSize: 12, fontWeight: 600, color: "#1f3348" } as React.CSSProperties,
  itemText: { fontSize: 11, color: "#6b7280", marginTop: 2 } as React.CSSProperties,
  itemTime: { fontSize: 9, color: "#9ca3af", flexShrink: 0, marginTop: 2 } as React.CSSProperties,
  unreadDot: { width: 6, height: 6, borderRadius: "50%", background: "#1f3348", flexShrink: 0, marginTop: 6 } as React.CSSProperties,
};

export default function NotificationManagerPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = MOCK.filter(n => {
    if (filter === "all") return true;
    return n.mailbox === filter;
  });

  const unreadByMailbox = {
    contacts: MOCK.filter(n => n.mailbox === "contacts" && !n.read).length,
    groups: MOCK.filter(n => n.mailbox === "groups" && !n.read).length,
    requests: MOCK.filter(n => n.mailbox === "requests" && !n.read).length,
  };

  return (
    <div style={S.page}>
      <div style={S.title}>Notification Manager</div>
      <div style={S.subtitle}>Messages from contacts, groups, and non-contact requests route to separate mailboxes</div>

      <div style={S.stats}>
        <div style={S.stat("#10b981")}>
          <div style={S.statVal}>{unreadByMailbox.contacts}</div>
          <div style={S.statLabel}>Contact Messages</div>
        </div>
        <div style={S.stat("#3b82f6")}>
          <div style={S.statVal}>{unreadByMailbox.groups}</div>
          <div style={S.statLabel}>Group Messages</div>
        </div>
        <div style={S.stat("#f59e0b")}>
          <div style={S.statVal}>{unreadByMailbox.requests}</div>
          <div style={S.statLabel}>Message Requests</div>
        </div>
      </div>

      <div style={S.tabs}>
        {(["all", "contacts", "groups", "requests"] as Filter[]).map(f => (
          <div key={f} style={S.tab(filter === f)} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "contacts" ? "Contacts" : f === "groups" ? "Groups" : "Requests"}
          </div>
        ))}
      </div>

      {filtered.map(n => (
        <div key={n.id} style={S.item(n.read)}>
          {!n.read && <div style={S.unreadDot} />}
          <div style={S.typeBadge(n.type)}>{TYPE_COLORS[n.type]?.label}</div>
          <div style={S.itemContent}>
            <div style={S.itemSource}>{n.source}</div>
            <div style={S.itemText}>{n.text}</div>
          </div>
          <div style={S.itemTime}>{n.time}</div>
        </div>
      ))}
    </div>
  );
}
