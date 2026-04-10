"use client";

import { useState } from "react";

export interface SavedLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zoom: number;
}

interface Props {
  onFlyTo: (lat: number, lng: number, zoom: number) => void;
}

export default function MapLocations({ onFlyTo }: Props) {
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [locating, setLocating] = useState(false);

  const handleMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onFlyTo(pos.coords.latitude, pos.coords.longitude, 12);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  const handleAdd = () => {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (!name.trim() || isNaN(parsedLat) || isNaN(parsedLng)) return;
    const loc: SavedLocation = {
      id: Date.now().toString(),
      name: name.trim(),
      lat: parsedLat,
      lng: parsedLng,
      zoom: 10,
    };
    setLocations((prev) => [...prev, loc]);
    setName("");
    setLat("");
    setLng("");
    setAdding(false);
  };

  const handleRemove = (id: string) =>
    setLocations((prev) => prev.filter((l) => l.id !== id));

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "5px 7px",
    fontSize: 10,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 3,
    color: "white",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  return (
    <div style={{ padding: "8px 12px 4px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      {/* My Location button */}
      <button
        onClick={handleMyLocation}
        disabled={locating}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 8px",
          background: "rgba(59,130,246,0.12)",
          border: "1px solid rgba(59,130,246,0.25)",
          borderRadius: 5,
          cursor: locating ? "wait" : "pointer",
          fontFamily: "inherit",
          marginBottom: 6,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
        </svg>
        <span style={{ fontSize: 10, fontWeight: 600, color: "#93bbfc", letterSpacing: "0.5px", textTransform: "uppercase" }}>
          {locating ? "Locating..." : "My Location"}
        </span>
      </button>

      {/* Saved locations list */}
      {locations.map((loc) => (
        <div
          key={loc.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 3,
          }}
        >
          <button
            onClick={() => onFlyTo(loc.lat, loc.lng, loc.zoom)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "5px 8px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 4,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 500, textAlign: "left" }}>
              {loc.name}
            </span>
          </button>
          <button
            onClick={() => handleRemove(loc.id)}
            style={{
              width: 22,
              height: 22,
              borderRadius: 3,
              background: "none",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            title="Remove"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}

      {/* Add location form */}
      {adding ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
          <div style={{ display: "flex", gap: 4 }}>
            <input
              type="text"
              placeholder="Lat"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Lng"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
            <button
              onClick={handleAdd}
              style={{
                flex: 1,
                padding: "5px 0",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                background: "rgba(59,130,246,0.2)",
                border: "1px solid rgba(59,130,246,0.3)",
                borderRadius: 3,
                color: "#93bbfc",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Save
            </button>
            <button
              onClick={() => { setAdding(false); setName(""); setLat(""); setLng(""); }}
              style={{
                flex: 1,
                padding: "5px 0",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                background: "none",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 3,
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "6px 8px",
            background: "none",
            border: "1px dashed rgba(255,255,255,0.15)",
            borderRadius: 4,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
            Add Location
          </span>
        </button>
      )}
    </div>
  );
}
