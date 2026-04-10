"use client";

/* eslint-disable @next/next/no-img-element */

interface StreamMessage {
  id: string;
  group: string;
  time: string;
  author: string;
  text: string;
  type?: "status" | "alert" | "help";
  typeText?: string;
  replies: number;
}

const MOCK_STREAMS: StreamMessage[] = [
  {
    id: "s1", group: "Montford Block 7", time: "2m ago", author: "Jake R.",
    text: "Power just flickered on Montford Ave. Anyone else?",
    type: "alert", typeText: "Flood Watch issued for Buncombe County", replies: 3,
  },
  {
    id: "s2", group: "Family", time: "15m ago", author: "Mom",
    text: "Heading to shelter now. Roads clear on I-26.",
    type: "status", typeText: "Mom marked safe", replies: 1,
  },
  {
    id: "s3", group: "Asheville Community", time: "32m ago", author: "Marcus T.",
    text: "Have a portable generator and fuel. Can help neighbors near downtown.",
    type: "help", typeText: "Offering: Generator available for 3 households", replies: 7,
  },
  {
    id: "s4", group: "Montford Block 7", time: "1h ago", author: "Lisa K.",
    text: "Water pressure is low. Filling up bathtubs just in case.",
    replies: 5,
  },
  {
    id: "s5", group: "Family", time: "2h ago", author: "Jake",
    text: "Picked up extra water and batteries from Ingles.",
    replies: 2,
  },
];

const TYPE_STYLES: Record<string, React.CSSProperties> = {
  status: { background: "#f0fdf4", borderLeft: "3px solid #10b981", color: "#065f46" },
  alert: { background: "#fef2f2", borderLeft: "3px solid #ef4444", color: "#991b1b" },
  help: { background: "#faf5ff", borderLeft: "3px solid #8b5cf6", color: "#5b21b6" },
};

const S = {
  container: { flex: 1, overflowY: "auto" as const, padding: "16px" } as React.CSSProperties,
  label: {
    fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" as const,
    color: "#9ca3af", marginBottom: 12,
  } as React.CSSProperties,
  card: {
    background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8,
    padding: 12, marginBottom: 10,
  } as React.CSSProperties,
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8,
  } as React.CSSProperties,
  group: {
    fontSize: 11, fontWeight: 700, color: "#1f3348", letterSpacing: "0.3px",
    textTransform: "uppercase" as const,
  } as React.CSSProperties,
  time: { fontSize: 9, color: "#9ca3af" } as React.CSSProperties,
  typeBadge: {
    padding: "8px 10px", borderRadius: "0 6px 6px 0", marginBottom: 6,
    fontSize: 11, fontWeight: 600,
  } as React.CSSProperties,
  msg: { fontSize: 12, color: "#374151", lineHeight: 1.4, marginBottom: 6 } as React.CSSProperties,
  author: { fontSize: 10, color: "#6b7280" } as React.CSSProperties,
  meta: {
    display: "flex", gap: 12, marginTop: 8, paddingTop: 8,
    borderTop: "1px solid #f3f4f6",
  } as React.CSSProperties,
  metaItem: {
    fontSize: 9, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.3px",
    textTransform: "uppercase" as const, cursor: "pointer",
  } as React.CSSProperties,
};

export default function CommunityStreams() {
  return (
    <div style={S.container}>
      <div style={S.label}>GROUP STREAMS</div>
      {MOCK_STREAMS.map((m) => (
        <div key={m.id} style={S.card}>
          <div style={S.header}>
            <span style={S.group}>{m.group}</span>
            <span style={S.time}>{m.time}</span>
          </div>
          {m.type && m.typeText && (
            <div style={{ ...S.typeBadge, ...TYPE_STYLES[m.type] }}>{m.typeText}</div>
          )}
          <div style={S.msg}>{m.text}</div>
          <div style={S.author}>{m.author}</div>
          <div style={S.meta}>
            <span style={S.metaItem}>{m.replies} replies</span>
            <span style={S.metaItem}>Open group</span>
          </div>
        </div>
      ))}
    </div>
  );
}
