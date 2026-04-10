"use client";

import { useState } from "react";

// ── Types ──
type Mailbox = "all" | "contacts" | "groups" | "requests";

interface Reaction { emoji: string; count: number; reacted: boolean }

interface Message {
  id: string;
  author: string;
  initials: string;
  text: string;
  time: string;
  isMe?: boolean;
  replyTo?: { author: string; text: string };
  reactions: Reaction[];
}

interface Thread {
  id: string;
  name: string;
  type: "group" | "contact" | "request";
  lastMsg: string;
  time: string;
  unread: number;
  avatar: string;
  messages: Message[];
}

// ── Mock Data ──
const THREADS: Thread[] = [
  {
    id: "t1", name: "Montford Block 7", type: "group", lastMsg: "Power just flickered on Montford Ave", time: "2m", unread: 3, avatar: "M7",
    messages: [
      { id: "m1", author: "Jake R.", initials: "JR", text: "Power just flickered on Montford Ave. Anyone else?", time: "2:41 PM", reactions: [{ emoji: "!", count: 4, reacted: false }] },
      { id: "m2", author: "Lisa K.", initials: "LK", text: "Same here. Lights dimmed twice.", time: "2:42 PM", reactions: [], replyTo: { author: "Jake R.", text: "Power just flickered on Montford Ave" } },
      { id: "m3", author: "You", initials: "KM", text: "We still have power but it's been unstable since noon", time: "2:43 PM", isMe: true, reactions: [{ emoji: "OK", count: 2, reacted: false }] },
      { id: "m4", author: "Marcus T.", initials: "MT", text: "Duke Energy says they're aware. ETA 45 min for a crew.", time: "2:45 PM", reactions: [{ emoji: "OK", count: 5, reacted: true }] },
    ],
  },
  {
    id: "t2", name: "Family", type: "group", lastMsg: "Heading to shelter now", time: "15m", unread: 1, avatar: "FA",
    messages: [
      { id: "m5", author: "Mom", initials: "MO", text: "Heading to shelter now. Roads clear on I-26.", time: "2:28 PM", reactions: [{ emoji: "OK", count: 3, reacted: true }] },
      { id: "m6", author: "You", initials: "KM", text: "Stay safe. Text when you arrive.", time: "2:30 PM", isMe: true, reactions: [] },
      { id: "m7", author: "Jake", initials: "JK", text: "I can pick up Dad on the way if needed", time: "2:31 PM", reactions: [] },
    ],
  },
  {
    id: "t3", name: "Mom", type: "contact", lastMsg: "Made it to the shelter. All good here.", time: "8m", unread: 1, avatar: "MO",
    messages: [
      { id: "m8", author: "Mom", initials: "MO", text: "Made it to the shelter. All good here.", time: "2:35 PM", reactions: [] },
      { id: "m9", author: "You", initials: "KM", text: "So glad. I'll check in tonight.", time: "2:36 PM", isMe: true, reactions: [{ emoji: "OK", count: 1, reacted: false }] },
    ],
  },
  {
    id: "t4", name: "Jake", type: "contact", lastMsg: "Picked up extra water and batteries", time: "2h", unread: 0, avatar: "JK",
    messages: [
      { id: "m10", author: "Jake", initials: "JK", text: "Picked up extra water and batteries from Ingles. Need anything?", time: "12:15 PM", reactions: [] },
      { id: "m11", author: "You", initials: "KM", text: "Can you grab a flashlight? Ours died.", time: "12:18 PM", isMe: true, reactions: [] },
      { id: "m12", author: "Jake", initials: "JK", text: "Got it", time: "12:20 PM", reactions: [{ emoji: "OK", count: 1, reacted: true }] },
    ],
  },
  {
    id: "t5", name: "Sarah M.", type: "request", lastMsg: "Hi, I live on Montford too. Can I join your block group?", time: "1h", unread: 1, avatar: "SM",
    messages: [
      { id: "m13", author: "Sarah M.", initials: "SM", text: "Hi, I live on Montford too. Can I join your block group?", time: "1:30 PM", reactions: [] },
    ],
  },
  {
    id: "t6", name: "Tom R.", type: "request", lastMsg: "Saw you have a generator listed. Could I borrow it?", time: "3h", unread: 1, avatar: "TR",
    messages: [
      { id: "m14", author: "Tom R.", initials: "TR", text: "Saw you have a generator listed. Could I borrow it during the outage?", time: "11:45 AM", reactions: [] },
    ],
  },
];

// ── Reaction Picker ──
const QUICK_REACTIONS = ["OK", "!", "?", "...", "+1"];

// ── Styles ──
const S = {
  wrap: { display: "flex", flexDirection: "column" as const, height: "100%", overflow: "hidden" },
  tabs: {
    display: "flex", borderBottom: "1px solid #e5e7eb", flexShrink: 0, background: "#fff",
  } as React.CSSProperties,
  tab: (active: boolean): React.CSSProperties => ({
    flex: 1, padding: "10px 0", textAlign: "center", fontSize: 10, fontWeight: active ? 700 : 600,
    letterSpacing: "0.5px", textTransform: "uppercase", color: active ? "#1f3348" : "#9ca3af",
    borderBottom: active ? "2px solid #1f3348" : "2px solid transparent",
    cursor: "pointer", position: "relative",
  }),
  badge: (count: number): React.CSSProperties => ({
    display: count > 0 ? "inline-flex" : "none",
    width: 14, height: 14, borderRadius: "50%", background: "#ef4444", color: "#fff",
    fontSize: 8, fontWeight: 700, alignItems: "center", justifyContent: "center",
    position: "absolute", top: 4, right: "calc(50% - 24px)",
  }),
  // Thread list
  threadList: { flex: 1, overflowY: "auto" as const } as React.CSSProperties,
  threadItem: (active: boolean, unread: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
    background: active ? "#f3f4f6" : "transparent",
    borderLeft: active ? "2px solid #1f3348" : "2px solid transparent",
    cursor: "pointer",
  }),
  threadAvatar: (type: string): React.CSSProperties => ({
    width: 32, height: 32, borderRadius: type === "group" ? 6 : "50%",
    background: type === "request" ? "#f3f4f6" : "#1f3348",
    color: type === "request" ? "#6b7280" : "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 700, flexShrink: 0,
    border: type === "request" ? "1px dashed #d1d5db" : "none",
  }),
  threadInfo: { flex: 1, overflow: "hidden" } as React.CSSProperties,
  threadName: (unread: boolean): React.CSSProperties => ({
    fontSize: 12, fontWeight: unread ? 700 : 500, color: "#1f3348",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  }),
  threadPreview: { fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" as const } as React.CSSProperties,
  threadMeta: { display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: 2, flexShrink: 0 } as React.CSSProperties,
  threadTime: { fontSize: 9, color: "#9ca3af" } as React.CSSProperties,
  unreadDot: { width: 8, height: 8, borderRadius: "50%", background: "#1f3348" } as React.CSSProperties,
  // Chat view
  chatHeader: {
    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
    borderBottom: "1px solid #e5e7eb", background: "#fff", flexShrink: 0,
  } as React.CSSProperties,
  backBtn: {
    width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", borderRadius: 4, flexShrink: 0,
  } as React.CSSProperties,
  chatName: { fontSize: 13, fontWeight: 700, color: "#1f3348" } as React.CSSProperties,
  chatType: { fontSize: 9, color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: "0.5px" } as React.CSSProperties,
  msgList: { flex: 1, overflowY: "auto" as const, padding: "12px 14px", display: "flex", flexDirection: "column" as const, gap: 6 } as React.CSSProperties,
  msgRow: (isMe: boolean): React.CSSProperties => ({
    display: "flex", flexDirection: isMe ? "row-reverse" : "row",
    alignItems: "flex-end", gap: 6, maxWidth: "85%",
    alignSelf: isMe ? "flex-end" : "flex-start",
  }),
  msgAvatar: {
    width: 24, height: 24, borderRadius: "50%", background: "#1f3348", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 8, fontWeight: 700, flexShrink: 0,
  } as React.CSSProperties,
  msgBubble: (isMe: boolean): React.CSSProperties => ({
    padding: "8px 12px", borderRadius: 16,
    background: isMe ? "#1f3348" : "#f3f4f6",
    color: isMe ? "#fff" : "#1f3348",
    fontSize: 12, lineHeight: 1.4,
    borderBottomRightRadius: isMe ? 4 : 16,
    borderBottomLeftRadius: isMe ? 16 : 4,
  }),
  replyRef: (isMe: boolean): React.CSSProperties => ({
    fontSize: 10, padding: "4px 8px", marginBottom: 4, borderRadius: 8,
    background: isMe ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.04)",
    color: isMe ? "rgba(255,255,255,0.6)" : "#6b7280",
    borderLeft: isMe ? "2px solid rgba(255,255,255,0.3)" : "2px solid #d1d5db",
  }),
  msgTime: (isMe: boolean): React.CSSProperties => ({
    fontSize: 8, color: isMe ? "rgba(255,255,255,0.5)" : "#9ca3af", marginTop: 2,
    textAlign: isMe ? "right" : "left",
  }),
  reactions: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" as const } as React.CSSProperties,
  reaction: (reacted: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 3, padding: "2px 6px",
    borderRadius: 10, fontSize: 9, fontWeight: 600, cursor: "pointer",
    background: reacted ? "#e8e3f3" : "#f3f4f6",
    color: reacted ? "#5b21b6" : "#6b7280",
    border: reacted ? "1px solid #c4b5fd" : "1px solid #e5e7eb",
  }),
  // Action bar
  actionBar: {
    display: "flex", alignItems: "center", gap: 4, padding: "4px 6px",
    background: "#fff", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    position: "absolute" as const, fontSize: 10,
  } as React.CSSProperties,
  actionBtn: {
    padding: "3px 6px", borderRadius: 4, cursor: "pointer", fontSize: 10, fontWeight: 600,
    color: "#6b7280", background: "transparent",
  } as React.CSSProperties,
  // Compose
  compose: {
    display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
    borderTop: "1px solid #e5e7eb", background: "#fff", flexShrink: 0,
  } as React.CSSProperties,
  composeReply: {
    display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
    background: "#f9fafb", borderTop: "1px solid #e5e7eb", fontSize: 10, color: "#6b7280",
  } as React.CSSProperties,
  input: {
    flex: 1, padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 20,
    fontSize: 12, outline: "none", fontFamily: "inherit",
  } as React.CSSProperties,
  sendBtn: {
    width: 28, height: 28, borderRadius: "50%", background: "#1f3348",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
  } as React.CSSProperties,
  requestBanner: {
    padding: "8px 14px", background: "#fef3c7", fontSize: 10, fontWeight: 600,
    color: "#92400e", textAlign: "center" as const, borderBottom: "1px solid #fde68a",
  } as React.CSSProperties,
};

export default function CommunityMessages() {
  const [mailbox, setMailbox] = useState<Mailbox>("all");
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);

  const filtered = THREADS.filter(t => {
    if (mailbox === "all") return true;
    if (mailbox === "contacts") return t.type === "contact";
    if (mailbox === "groups") return t.type === "group";
    if (mailbox === "requests") return t.type === "request";
    return true;
  });

  const counts = {
    all: THREADS.reduce((s, t) => s + t.unread, 0),
    contacts: THREADS.filter(t => t.type === "contact").reduce((s, t) => s + t.unread, 0),
    groups: THREADS.filter(t => t.type === "group").reduce((s, t) => s + t.unread, 0),
    requests: THREADS.filter(t => t.type === "request").reduce((s, t) => s + t.unread, 0),
  };

  const thread = activeThread ? THREADS.find(t => t.id === activeThread) : null;

  // Thread list view
  if (!thread) {
    return (
      <div style={S.wrap}>
        <div style={S.tabs}>
          {(["all", "contacts", "groups", "requests"] as Mailbox[]).map(m => (
            <div key={m} style={S.tab(mailbox === m)} onClick={() => setMailbox(m)}>
              {m === "all" ? "All" : m === "contacts" ? "People" : m === "groups" ? "Groups" : "Requests"}
              <div style={S.badge(counts[m])}>{counts[m]}</div>
            </div>
          ))}
        </div>
        <div style={S.threadList}>
          {filtered.length === 0 && (
            <div style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 11 }}>No messages</div>
          )}
          {filtered.map(t => (
            <div key={t.id} style={S.threadItem(false, t.unread > 0)} onClick={() => setActiveThread(t.id)}>
              <div style={S.threadAvatar(t.type)}>{t.avatar}</div>
              <div style={S.threadInfo}>
                <div style={S.threadName(t.unread > 0)}>{t.name}</div>
                <div style={S.threadPreview}>{t.lastMsg}</div>
              </div>
              <div style={S.threadMeta}>
                <span style={S.threadTime}>{t.time}</span>
                {t.unread > 0 && <div style={S.unreadDot} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Chat view
  return (
    <div style={S.wrap}>
      <div style={S.chatHeader}>
        <div style={S.backBtn} onClick={() => { setActiveThread(null); setReplyTo(null); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1f3348" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </div>
        <div style={S.threadAvatar(thread.type)}>{thread.avatar}</div>
        <div>
          <div style={S.chatName}>{thread.name}</div>
          <div style={S.chatType}>{thread.type === "group" ? "group" : thread.type === "request" ? "message request" : "contact"}</div>
        </div>
      </div>

      {thread.type === "request" && (
        <div style={S.requestBanner}>Message request - not in your contacts</div>
      )}

      <div style={S.msgList}>
        {thread.messages.map(m => (
          <div
            key={m.id}
            style={{ position: "relative" }}
            onMouseEnter={() => setHoveredMsg(m.id)}
            onMouseLeave={() => setHoveredMsg(null)}
          >
            <div style={S.msgRow(!!m.isMe)}>
              {!m.isMe && <div style={S.msgAvatar}>{m.initials}</div>}
              <div>
                {!m.isMe && (
                  <div style={{ fontSize: 9, fontWeight: 600, color: "#6b7280", marginBottom: 2 }}>{m.author}</div>
                )}
                {m.replyTo && (
                  <div style={S.replyRef(!!m.isMe)}>
                    {m.replyTo.author}: {m.replyTo.text.slice(0, 40)}{m.replyTo.text.length > 40 ? "..." : ""}
                  </div>
                )}
                <div style={S.msgBubble(!!m.isMe)}>{m.text}</div>
                <div style={S.msgTime(!!m.isMe)}>{m.time}</div>
                {m.reactions.length > 0 && (
                  <div style={S.reactions}>
                    {m.reactions.map((r, i) => (
                      <div key={i} style={S.reaction(r.reacted)}>{r.emoji} {r.count}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Hover action bar */}
            {hoveredMsg === m.id && (
              <div style={{
                ...S.actionBar,
                top: 0,
                ...(m.isMe ? { left: 0 } : { right: 0 }),
              }}>
                {QUICK_REACTIONS.map(r => (
                  <span key={r} style={S.actionBtn} title={`React ${r}`}>{r}</span>
                ))}
                <span
                  style={{ ...S.actionBtn, borderLeft: "1px solid #e5e7eb", paddingLeft: 8 }}
                  onClick={() => setReplyTo(m)}
                  title="Reply"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reply indicator */}
      {replyTo && (
        <div style={S.composeReply}>
          <span style={{ flex: 1 }}>Replying to {replyTo.author}: {replyTo.text.slice(0, 30)}...</span>
          <span style={{ cursor: "pointer", fontWeight: 700 }} onClick={() => setReplyTo(null)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </span>
        </div>
      )}

      <div style={S.compose}>
        <input style={S.input} placeholder="Message..." />
        <div style={S.sendBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </div>
      </div>
    </div>
  );
}
