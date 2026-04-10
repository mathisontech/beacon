"use client";

// SVG icons as inline components (no external deps)
const MapIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

const UserReportsIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const AlertsIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const HelpingIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 16v-5a2 2 0 0 0-4 0" />
    <path d="M14 11V6a2 2 0 0 0-4 0v6" />
    <path d="M10 10V5a2 2 0 0 0-4 0v9" />
    <path d="M6 14V9a2 2 0 0 0-4 0v7a8 8 0 0 0 16 0v-3a2 2 0 0 0-4 0" />
  </svg>
);

const CommunityIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TABS = [
  { id: "map", label: "Map", Icon: MapIcon },
  { id: "reports", label: "User Reports", Icon: UserReportsIcon },
  { id: "alerts", label: "Alerts", Icon: AlertsIcon },
  { id: "php", label: "Helping", Icon: HelpingIcon },
  { id: "community", label: "Community", Icon: CommunityIcon },
];

interface Props {
  active: string;
  onChange: (id: string) => void;
}

const S = {
  bar: {
    display: "flex",
    alignItems: "stretch",
    height: 48,
    background: "#f5f6f8",
    borderTop: "1px solid #e0e2e6",
    flexShrink: 0,
    width: "100%",
  } as React.CSSProperties,
  tab: (active: boolean): React.CSSProperties => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    height: "100%",
    color: active ? "#1f3348" : "#9ca3af",
    background: active ? "#ffffff" : "transparent",
    border: "none",
    cursor: "pointer",
    transition: "all 0.15s ease",
    borderTop: active ? "2px solid #1f3348" : "2px solid transparent",
    fontFamily: "inherit",
    padding: 0,
  }),
  label: (active: boolean): React.CSSProperties => ({
    fontSize: 7,
    fontWeight: active ? 700 : 500,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    color: active ? "#1f3348" : "#9ca3af",
    lineHeight: 1,
  }),
};

export default function PublicTabBar({ active, onChange }: Props) {
  return (
    <div style={S.bar}>
      {TABS.map((t) => {
        const isActive = active === t.id;
        const color = isActive ? "#1f3348" : "#9ca3af";
        return (
          <button
            key={t.id}
            style={S.tab(isActive)}
            onClick={() => onChange(t.id)}
          >
            <t.Icon color={color} />
            <span style={S.label(isActive)}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
