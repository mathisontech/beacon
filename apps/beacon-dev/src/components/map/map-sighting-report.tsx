"use client";

import { useState } from "react";

const CATEGORIES = [
  { id: "fire", label: "Fire / Smoke" },
  { id: "flood", label: "Flooding" },
  { id: "tornado", label: "Tornado / Funnel" },
  { id: "wind-damage", label: "Wind Damage" },
  { id: "hail", label: "Hail" },
  { id: "road", label: "Road Hazard" },
  { id: "power", label: "Power Outage" },
  { id: "landslide", label: "Landslide / Debris" },
  { id: "animal", label: "Animal in Danger" },
  { id: "other", label: "Other" },
];

export default function MapSightingReport() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    // Mock submit
    setOpen(false);
    setSelected(null);
    setDescription("");
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          width: 40,
          height: 40,
          borderRadius: 20,
          background: "rgba(31,51,72,0.85)",
          border: "1px solid rgba(255,255,255,0.15)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20,
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
        title="Report Sighting"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    );
  }

  return (
    <div style={{
      position: "absolute",
      bottom: 16,
      right: 16,
      width: 240,
      background: "rgba(31,51,72,0.92)",
      backdropFilter: "blur(12px)",
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.1)",
      color: "white",
      zIndex: 20,
      boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>
          REPORT SIGHTING
        </span>
        <button
          onClick={() => { setOpen(false); setSelected(null); setDescription(""); }}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Category grid */}
      <div style={{
        padding: "8px 10px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 4,
        maxHeight: 180,
        overflowY: "auto",
      }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelected(cat.id === selected ? null : cat.id)}
            style={{
              padding: "6px 8px",
              fontSize: 9,
              fontWeight: selected === cat.id ? 700 : 500,
              background: selected === cat.id
                ? "rgba(59,130,246,0.25)"
                : "rgba(255,255,255,0.06)",
              border: selected === cat.id
                ? "1px solid rgba(59,130,246,0.5)"
                : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 5,
              color: selected === cat.id
                ? "rgba(255,255,255,0.95)"
                : "rgba(255,255,255,0.6)",
              cursor: "pointer",
              fontFamily: "inherit",
              textAlign: "left",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <div style={{ padding: "6px 10px" }}>
        <textarea
          placeholder="What do you see? (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          style={{
            width: "100%",
            padding: "6px 8px",
            fontSize: 10,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 4,
            color: "white",
            outline: "none",
            fontFamily: "inherit",
            resize: "none",
          }}
        />
      </div>

      {/* Location indicator + submit */}
      <div style={{
        padding: "6px 10px 10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>
          Using current location
        </span>
        <button
          onClick={handleSubmit}
          disabled={!selected}
          style={{
            padding: "5px 14px",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.5px",
            background: selected ? "#3b82f6" : "rgba(255,255,255,0.08)",
            color: selected ? "white" : "rgba(255,255,255,0.3)",
            border: "none",
            borderRadius: 5,
            cursor: selected ? "pointer" : "default",
            fontFamily: "inherit",
          }}
        >
          SUBMIT
        </button>
      </div>
    </div>
  );
}
