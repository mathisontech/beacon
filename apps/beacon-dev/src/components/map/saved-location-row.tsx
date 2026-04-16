"use client";

import { useState } from "react";
import { BeaconIcon, type IconSource } from "@/lib/icons";
import type { SavedLocation } from "@/lib/saved-locations";
import IconPicker from "./icon-picker";

interface Props {
  locations: SavedLocation[];
  activeId: string | null;
  /** null = global view is active */
  onSelect: (id: string) => void;
  onGlobal: () => void;
  globalActive: boolean;
  onAdd: (loc: Omit<SavedLocation, "id">) => void;
  onRemove: (id: string) => void;
  /** Map of location id → notification count */
  notifications?: Record<string, number>;
}

export default function SavedLocationRow({
  locations,
  activeId,
  onSelect,
  onGlobal,
  globalActive,
  onAdd,
  onRemove,
  notifications = {},
}: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [icon, setIcon] = useState<IconSource>({ kind: "builtin", id: "home" });
  const [subscript, setSubscript] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [contextId, setContextId] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setLat("");
    setLng("");
    setIcon({ kind: "builtin", id: "home" });
    setSubscript("");
    setAdding(false);
    setPickerOpen(false);
  };

  const handleAdd = () => {
    const pLat = parseFloat(lat);
    const pLng = parseFloat(lng);
    if (!name.trim() || isNaN(pLat) || isNaN(pLng)) return;
    const sub = parseInt(subscript, 10);
    onAdd({
      name: name.trim(),
      lat: pLat,
      lng: pLng,
      zoom: 12,
      icon,
      subscript: isNaN(sub) || sub <= 0 ? undefined : sub,
    });
    reset();
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(5));
        setLng(pos.coords.longitude.toFixed(5));
      },
      () => {},
      { timeout: 8000 }
    );
  };

  return (
    <div style={wrap}>
      {/* Icon row */}
      <div style={row}>
        {/* Globe = global view */}
        <button
          onClick={onGlobal}
          title="Global view"
          style={iconCircle(globalActive)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={globalActive ? "#2563eb" : "rgba(0,0,0,0.4)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <ellipse cx="12" cy="12" rx="4" ry="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
          </svg>
        </button>

        {locations.map((loc) => {
          const count = notifications[loc.id] || 0;
          return (
            <div key={loc.id} style={{ position: "relative" }}>
              <button
                onClick={() => onSelect(loc.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextId(contextId === loc.id ? null : loc.id);
                }}
                title={loc.name}
                style={iconCircle(loc.id === activeId)}
              >
                <BeaconIcon
                  source={loc.icon}
                  size={16}
                  subscript={loc.subscript}
                  active={loc.id === activeId}
                />
              </button>
              {count > 0 && <span style={notifBadge}>{count > 9 ? "9+" : count}</span>}
              {contextId === loc.id && (
                <div style={contextMenu}>
                  <button
                    onClick={() => { onRemove(loc.id); setContextId(null); }}
                    style={contextItem}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Add button */}
        <button
          onClick={() => setAdding(!adding)}
          title="Add location"
          style={addBtn}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Add location form */}
      {adding && (
        <div style={formWrap}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={input}
          />
          <div style={{ display: "flex", gap: 4 }}>
            <input type="text" placeholder="Lat" value={lat} onChange={(e) => setLat(e.target.value)} style={input} />
            <input type="text" placeholder="Lng" value={lng} onChange={(e) => setLng(e.target.value)} style={input} />
          </div>
          <button onClick={useMyLocation} style={linkBtn}>Use current location</button>

          {/* Icon select */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <button onClick={() => setPickerOpen(!pickerOpen)} style={iconSelectBtn}>
              <BeaconIcon source={icon} size={16} active />
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>Change icon</span>
            </button>
            <input
              type="text"
              placeholder="#"
              value={subscript}
              onChange={(e) => setSubscript(e.target.value.replace(/\D/g, ""))}
              style={{ ...input, width: 28, textAlign: "center", padding: "4px 2px" }}
              title="Subscript number"
            />
          </div>

          {pickerOpen && (
            <div style={{ marginTop: 4 }}>
              <IconPicker
                value={icon}
                onChange={(ic) => { setIcon(ic); setPickerOpen(false); }}
                onClose={() => setPickerOpen(false)}
              />
            </div>
          )}

          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
            <button onClick={handleAdd} style={saveBtn}>Save</button>
            <button onClick={reset} style={cancelBtn}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────── */

const wrap: React.CSSProperties = {
  padding: "6px 14px 8px",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
};

const row: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  flexWrap: "wrap",
};

const iconCircle = (active: boolean): React.CSSProperties => ({
  width: 30,
  height: 30,
  borderRadius: 15,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: active ? "rgba(59,130,246,0.15)" : "rgba(0,0,0,0.03)",
  border: active
    ? "1.5px solid rgba(59,130,246,0.5)"
    : "1.5px solid rgba(0,0,0,0.1)",
  cursor: "pointer",
  padding: 0,
  transition: "all 0.15s ease",
});

const notifBadge: React.CSSProperties = {
  position: "absolute",
  top: -3,
  right: -3,
  minWidth: 14,
  height: 14,
  borderRadius: 7,
  background: "#ef4444",
  color: "white",
  fontSize: 8,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 3px",
  lineHeight: 1,
  pointerEvents: "none",
  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
};

const addBtn: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 15,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "none",
  border: "1.5px dashed rgba(0,0,0,0.15)",
  cursor: "pointer",
  padding: 0,
};

const contextMenu: React.CSSProperties = {
  position: "absolute",
  top: 32,
  left: 0,
  background: "white",
  border: "1px solid rgba(0,0,0,0.1)",
  borderRadius: 4,
  zIndex: 30,
  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
};

const contextItem: React.CSSProperties = {
  padding: "5px 12px",
  fontSize: 9,
  fontWeight: 600,
  color: "#f87171",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  whiteSpace: "nowrap",
};

const formWrap: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  marginTop: 6,
};

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

const linkBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 9,
  color: "#2563eb",
  cursor: "pointer",
  fontFamily: "inherit",
  padding: "2px 0",
  textAlign: "left",
};

const iconSelectBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "4px 8px",
  background: "rgba(0,0,0,0.03)",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 4,
  cursor: "pointer",
  fontFamily: "inherit",
};

const saveBtn: React.CSSProperties = {
  flex: 1,
  padding: "5px 0",
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  background: "rgba(59,130,246,0.1)",
  border: "1px solid rgba(59,130,246,0.25)",
  borderRadius: 3,
  color: "#2563eb",
  cursor: "pointer",
  fontFamily: "inherit",
};

const cancelBtn: React.CSSProperties = {
  flex: 1,
  padding: "5px 0",
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  background: "none",
  border: "1px solid rgba(0,0,0,0.1)",
  borderRadius: 3,
  color: "rgba(0,0,0,0.4)",
  cursor: "pointer",
  fontFamily: "inherit",
};
