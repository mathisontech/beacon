"use client";

import { useState } from "react";
import type { ActiveFire } from "@/types/fire";
import { fireColor, formatAcres } from "@/lib/fire-data";

interface Props {
  fires: ActiveFire[];
  loading: boolean;
  lastFetched: Date | null;
  onSelect: (fire: ActiveFire) => void;
  onRefresh: () => void;
}

export default function FireSelector({
  fires,
  loading,
  lastFetched,
  onSelect,
  onRefresh,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = fires.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      position: "absolute",
      top: 10,
      right: 10,
      zIndex: 20,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
    }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          background: open ? "#dc2626" : "rgba(30,30,30,0.85)",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "6px 12px",
          fontSize: 12,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Fires {fires.length > 0 ? `(${fires.length})` : ""}
      </button>

      {open && (
        <div style={{
          marginTop: 6,
          width: 280,
          maxHeight: 360,
          background: "rgba(20,20,20,0.92)",
          borderRadius: 8,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}>
          {/* header */}
          <div style={{
            padding: "8px 10px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <input
              type="text"
              placeholder="Search fires..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 4,
                padding: "4px 8px",
                color: "#fff",
                fontSize: 11,
                outline: "none",
              }}
            />
            <button
              onClick={onRefresh}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.5)",
                cursor: "pointer",
                fontSize: 10,
                padding: "2px 6px",
              }}
            >
              {loading ? "..." : "refresh"}
            </button>
          </div>

          {/* status */}
          {lastFetched && (
            <div style={{
              padding: "3px 10px",
              fontSize: 9,
              color: "rgba(255,255,255,0.35)",
            }}>
              Updated {lastFetched.toLocaleTimeString()}
            </div>
          )}

          {/* list */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.length === 0 && (
              <div style={{
                padding: 16,
                textAlign: "center",
                color: "rgba(255,255,255,0.3)",
                fontSize: 11,
              }}>
                {loading ? "Loading..." : "No fires found"}
              </div>
            )}
            {filtered.map((fire) => (
              <button
                key={fire.id}
                onClick={() => onSelect(fire)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "7px 10px",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  cursor: "pointer",
                  textAlign: "left",
                  color: "#fff",
                }}
              >
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: fireColor(fire.acres),
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {fire.name}
                  </div>
                  <div style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.4)",
                  }}>
                    {formatAcres(fire.acres)} acres
                    {fire.containment > 0 ? ` / ${fire.containment}%` : ""}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
