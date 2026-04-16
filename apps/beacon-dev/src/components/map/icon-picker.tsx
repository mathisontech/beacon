"use client";

import { useState } from "react";
import {
  BeaconIcon,
  ICON_CATEGORIES,
  ICON_LABELS,
  type IconSource,
  type BuiltinIconId,
} from "@/lib/icons";

interface Props {
  value: IconSource;
  onChange: (icon: IconSource) => void;
  onClose: () => void;
}

export default function IconPicker({ value, onChange, onClose }: Props) {
  const [customUrl, setCustomUrl] = useState("");
  const [tab, setTab] = useState<"builtin" | "custom">("builtin");

  const isSelected = (id: BuiltinIconId) =>
    value.kind === "builtin" && value.id === id;

  return (
    <div style={wrap}>
      {/* Tabs */}
      <div style={tabRow}>
        <button
          onClick={() => setTab("builtin")}
          style={tabBtn(tab === "builtin")}
        >
          ICONS
        </button>
        <button
          onClick={() => setTab("custom")}
          style={tabBtn(tab === "custom")}
        >
          CUSTOM
        </button>
        <button onClick={onClose} style={closeBtn}>
          ✕
        </button>
      </div>

      {tab === "builtin" ? (
        <div style={scrollArea}>
          {ICON_CATEGORIES.map((cat) => (
            <div key={cat.label} style={{ marginBottom: 8 }}>
              <div style={catLabel}>{cat.label}</div>
              <div style={grid}>
                {cat.ids.map((id) => (
                  <button
                    key={id}
                    onClick={() => onChange({ kind: "builtin", id })}
                    title={ICON_LABELS[id]}
                    style={iconBtn(isSelected(id))}
                  >
                    <BeaconIcon
                      source={{ kind: "builtin", id }}
                      size={18}
                      active={isSelected(id)}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "8px 10px" }}>
          <div style={catLabel}>Image URL or logo</div>
          <input
            type="text"
            placeholder="https://..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            style={input}
          />
          {customUrl && (
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
              <BeaconIcon
                source={{ kind: "custom", url: customUrl }}
                size={24}
                active
              />
              <button
                onClick={() => {
                  if (customUrl.trim()) onChange({ kind: "custom", url: customUrl.trim() });
                }}
                style={applyBtn}
              >
                USE
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────── */

const wrap: React.CSSProperties = {
  background: "white",
  border: "1px solid rgba(0,0,0,0.1)",
  borderRadius: 6,
  width: 200,
  overflow: "hidden",
  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
};

const tabRow: React.CSSProperties = {
  display: "flex",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const tabBtn = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: "6px 0",
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.8px",
  background: active ? "rgba(0,0,0,0.03)" : "none",
  border: "none",
  borderBottom: active ? "2px solid #2563eb" : "2px solid transparent",
  color: active ? "#1a2a3a" : "rgba(0,0,0,0.35)",
  cursor: "pointer",
  fontFamily: "inherit",
});

const closeBtn: React.CSSProperties = {
  width: 28,
  background: "none",
  border: "none",
  color: "rgba(0,0,0,0.3)",
  cursor: "pointer",
  fontSize: 11,
  fontFamily: "inherit",
};

const scrollArea: React.CSSProperties = {
  maxHeight: 200,
  overflowY: "auto",
  padding: "6px 10px",
};

const catLabel: React.CSSProperties = {
  fontSize: 8,
  fontWeight: 700,
  letterSpacing: "0.8px",
  textTransform: "uppercase",
  color: "rgba(0,0,0,0.35)",
  marginBottom: 4,
};

const grid: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 2,
};

const iconBtn = (selected: boolean): React.CSSProperties => ({
  width: 30,
  height: 30,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 4,
  background: selected ? "rgba(59,130,246,0.12)" : "rgba(0,0,0,0.02)",
  border: selected
    ? "1px solid rgba(59,130,246,0.4)"
    : "1px solid transparent",
  cursor: "pointer",
  padding: 0,
});

const input: React.CSSProperties = {
  width: "100%",
  padding: "5px 7px",
  fontSize: 10,
  background: "rgba(0,0,0,0.04)",
  border: "1px solid rgba(0,0,0,0.1)",
  borderRadius: 3,
  color: "#1a2a3a",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const applyBtn: React.CSSProperties = {
  padding: "4px 10px",
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.5px",
  background: "rgba(59,130,246,0.1)",
  border: "1px solid rgba(59,130,246,0.25)",
  borderRadius: 3,
  color: "#2563eb",
  cursor: "pointer",
  fontFamily: "inherit",
};
