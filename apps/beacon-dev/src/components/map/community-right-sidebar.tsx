"use client";

import { useState } from "react";

interface Props {
  activePage: string;
  onPageChange: (page: string) => void;
}

const MENU_ITEMS = [
  {
    section: "COMMUNITY",
    items: [
      { id: "messages", label: "Messages" },
      { id: "contacts", label: "Contacts" },
      { id: "groups", label: "Groups" },
    ],
  },
  {
    section: "ACCOUNT",
    items: [
      { id: "settings", label: "Settings", children: [
        { id: "settings-account", label: "Account Management" },
        { id: "settings-household", label: "Household" },
        { id: "settings-equipment", label: "Equipment & Skills" },
        { id: "settings-vehicles", label: "Vehicles" },
        { id: "settings-emergency", label: "Emergency Contacts" },
        { id: "settings-trusted", label: "Trusted Neighbors" },
        { id: "settings-privacy", label: "Privacy & Location Sharing" },
        { id: "settings-sensors", label: "Sensor Data" },
        { id: "settings-mesh", label: "Mesh Network" },
        { id: "settings-notifications", label: "Notifications" },
        { id: "settings-id", label: "ID Verification" },
        { id: "settings-legal", label: "Legal Releases" },
      ]},
      { id: "history", label: "Account History", children: [
        { id: "history-events", label: "Event History" },
        { id: "history-helping", label: "Helping History" },
        { id: "history-usage", label: "Usage & Battery" },
        { id: "history-location", label: "Location Audit" },
      ]},
    ],
  },
];

const USER = { initials: "KM", name: "Kristin M.", verified: true };

const ChevronDown = ({ color }: { color: string }) => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
);
const ChevronRight = ({ color }: { color: string }) => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
);
const CollapseArrow = ({ direction, color }: { direction: "left" | "right"; color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {direction === "left"
      ? <polyline points="15 18 9 12 15 6"/>
      : <polyline points="9 18 15 12 9 6"/>}
  </svg>
);

const S = {
  sidebar: (open: boolean): React.CSSProperties => ({
    width: open ? 220 : 44,
    height: "100%",
    background: "#ffffff",
    borderLeft: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    transition: "width 0.2s ease",
    overflow: "hidden",
  }),
  header: (open: boolean): React.CSSProperties => ({
    padding: open ? "12px 14px" : "10px 8px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: open ? "flex-start" : "center",
    gap: 10,
    flexShrink: 0,
  }),
  avatar: {
    width: 28, height: 28, borderRadius: "50%", background: "#1f3348",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 700, letterSpacing: "0.5px", flexShrink: 0,
    position: "relative" as const,
  } as React.CSSProperties,
  badge: {
    position: "absolute" as const, bottom: -1, right: -1, width: 10, height: 10,
    borderRadius: "50%", background: "#10b981", border: "1.5px solid #fff",
    display: "flex", alignItems: "center", justifyContent: "center",
  } as React.CSSProperties,
  userName: {
    fontSize: 12, fontWeight: 700, color: "#1f3348", letterSpacing: "0.3px",
    whiteSpace: "nowrap" as const, flex: 1,
  } as React.CSSProperties,
  collapseBtn: {
    cursor: "pointer", flexShrink: 0, display: "flex",
    alignItems: "center", justifyContent: "center",
    width: 20, height: 20, borderRadius: 4,
  } as React.CSSProperties,
  sections: { flex: 1, overflowY: "auto" as const } as React.CSSProperties,
  sectionLabel: {
    fontSize: 9, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase" as const,
    color: "#9ca3af", padding: "12px 14px 4px",
  } as React.CSSProperties,
  item: (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
    fontSize: 11, fontWeight: active ? 700 : 600, letterSpacing: "0.5px",
    textTransform: "uppercase", color: active ? "#1f3348" : "#6b7280",
    background: active ? "#f3f4f6" : "transparent",
    borderLeft: active ? "2px solid #1f3348" : "2px solid transparent",
    cursor: "pointer", transition: "all 0.1s ease",
  }),
  subItem: (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 6, padding: "6px 14px 6px 28px",
    fontSize: 10, fontWeight: active ? 600 : 500, letterSpacing: "0.4px",
    textTransform: "uppercase", color: active ? "#1f3348" : "#9ca3af",
    cursor: "pointer",
  }),
};

const VerifiedCheck = () => (
  <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function CommunityRightSidebar({ activePage, onPageChange }: Props) {
  const [open, setOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems(p => ({ ...p, [id]: !p[id] }));
  };

  if (!open) {
    return (
      <div style={S.sidebar(false)}>
        <div style={S.header(false)}>
          <div style={{ ...S.collapseBtn, cursor: "pointer" }} onClick={() => setOpen(true)}>
            <CollapseArrow direction="left" color="#9ca3af" />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
          <div style={S.avatar}>
            {USER.initials}
            {USER.verified && <div style={S.badge}><VerifiedCheck /></div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.sidebar(true)}>
      <div style={S.header(true)}>
        <div style={S.avatar}>
          {USER.initials}
          {USER.verified && <div style={S.badge}><VerifiedCheck /></div>}
        </div>
        <span style={S.userName}>{USER.name}</span>
        <div style={S.collapseBtn} onClick={() => setOpen(false)}>
          <CollapseArrow direction="right" color="#9ca3af" />
        </div>
      </div>

      <div style={S.sections}>
        {MENU_ITEMS.map((section) => (
          <div key={section.section}>
            <div style={S.sectionLabel}>{section.section}</div>
            {section.items.map((item) => {
              const isActive = activePage === item.id || activePage.startsWith(item.id + "-");
              const hasChildren = "children" in item && item.children;
              const isExpanded = expandedItems[item.id];

              return (
                <div key={item.id}>
                  <div
                    style={S.item(isActive)}
                    onClick={() => {
                      if (hasChildren) toggleExpand(item.id);
                      else onPageChange(item.id);
                    }}
                  >
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {hasChildren && (isExpanded ? <ChevronDown color="#9ca3af" /> : <ChevronRight color="#9ca3af" />)}
                  </div>
                  {hasChildren && isExpanded && (item as any).children.map((child: { id: string; label: string }) => (
                    <div
                      key={child.id}
                      style={S.subItem(activePage === child.id)}
                      onClick={() => onPageChange(child.id)}
                    >
                      {child.label}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
