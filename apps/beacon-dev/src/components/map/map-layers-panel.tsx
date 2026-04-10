"use client";

import { useState } from "react";
import MapLocations from "./map-locations";

// Layer category definitions
const LAYER_CATEGORIES = [
  {
    id: "weather",
    label: "WEATHER",
    layers: [
      { id: "radar", label: "Radar (NEXRAD)", on: true },
      { id: "satellite", label: "Satellite Imagery", on: false },
      { id: "temperature", label: "Temperature", on: false },
      { id: "wind", label: "Wind Speed & Direction", on: false },
      { id: "precipitation", label: "Precipitation", on: false },
      { id: "lightning", label: "Lightning Strikes", on: false },
      { id: "visibility", label: "Visibility", on: false },
    ],
  },
  {
    id: "hazards",
    label: "NATURAL HAZARDS",
    layers: [
      { id: "nws-alerts", label: "NWS Alerts & Warnings", on: true },
      { id: "wildfires", label: "Active Wildfires (NIFC)", on: false },
      { id: "earthquakes", label: "Earthquakes (USGS)", on: false },
      { id: "volcanic", label: "Volcanic Activity", on: false },
      { id: "tsunami", label: "Tsunami Warnings", on: false },
      { id: "tropical", label: "Tropical Cyclone Tracks", on: false },
      { id: "tornado-warn", label: "Tornado Warnings", on: true },
      { id: "flood-warn", label: "Flood Warnings", on: true },
    ],
  },
  {
    id: "risk-zones",
    label: "RISK ZONES",
    layers: [
      { id: "flood-zones", label: "FEMA Flood Zones", on: false },
      { id: "fire-risk", label: "Wildfire Risk Areas", on: false },
      { id: "seismic", label: "Seismic Hazard Zones", on: false },
      { id: "volcanic-risk", label: "Volcanic Risk Regions", on: false },
      { id: "storm-proj", label: "Projected Storm Paths", on: true },
      { id: "surge", label: "Storm Surge Zones", on: false },
      { id: "landslide", label: "Landslide Susceptibility", on: false },
    ],
  },
  {
    id: "sensors",
    label: "OPEN SENSORS",
    layers: [
      { id: "river-gauges", label: "River Gauges (USGS)", on: false },
      { id: "tide-gauges", label: "Tide Gauges (NOAA)", on: false },
      { id: "air-quality", label: "Air Quality (AQI)", on: false },
      { id: "seismographs", label: "Seismograph Network", on: false },
      { id: "weather-stations", label: "Weather Stations", on: false },
      { id: "buoys", label: "Ocean Buoys", on: false },
    ],
  },
  {
    id: "people",
    label: "PEOPLE & HELP",
    layers: [
      { id: "loved-ones", label: "Loved Ones Locations", on: true },
      { id: "help-requests", label: "People Needing Help", on: true },
      { id: "helpers", label: "Active Helpers", on: false },
      { id: "shelters", label: "Open Shelters", on: false },
      { id: "evacuation-routes", label: "Evacuation Routes", on: false },
    ],
  },
  {
    id: "user-reports",
    label: "USER REPORTS",
    layers: [
      { id: "sightings", label: "User Sighting Reports", on: true },
      { id: "road-closures", label: "Road Condition Reports", on: false },
      { id: "damage", label: "Damage Reports", on: false },
      { id: "power-outage", label: "Power Outage Reports", on: false },
    ],
  },
  {
    id: "infrastructure",
    label: "INFRASTRUCTURE",
    layers: [
      { id: "cctv", label: "CCTV / Traffic Cameras", on: false },
      { id: "aircraft", label: "Aircraft (ADS-B)", on: false },
      { id: "power-grid", label: "Power Grid Status", on: false },
      { id: "cell-towers", label: "Cell Tower Status", on: false },
    ],
  },
  {
    id: "events",
    label: "ACTIVE EVENTS",
    layers: [
      { id: "declared-events", label: "Declared Emergencies", on: true },
      { id: "event-perimeters", label: "Event Perimeters", on: false },
      { id: "ems-operations", label: "EMS Operations", on: false },
    ],
  },
];

type LayerState = Record<string, boolean>;

interface Props {
  open: boolean;
  onToggle: () => void;
  onFlyTo?: (lat: number, lng: number, zoom: number) => void;
}

export default function MapLayersPanel({ open, onToggle, onFlyTo }: Props) {
  const [layerState, setLayerState] = useState<LayerState>(() => {
    const init: LayerState = {};
    LAYER_CATEGORIES.forEach((cat) =>
      cat.layers.forEach((l) => (init[l.id] = l.on))
    );
    return init;
  });
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  const toggle = (id: string) =>
    setLayerState((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleCat = (id: string) =>
    setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));

  const activeCount = Object.values(layerState).filter(Boolean).length;

  // Filter layers by search
  const filtered = search.trim()
    ? LAYER_CATEGORIES.map((cat) => ({
        ...cat,
        layers: cat.layers.filter((l) =>
          l.label.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((cat) => cat.layers.length > 0)
    : LAYER_CATEGORIES;

  if (!open) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
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
        }}
        title="Layers"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
        {activeCount > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            fontSize: 8, fontWeight: 700, color: "white",
            background: "#3b82f6", borderRadius: 6,
            padding: "1px 4px", minWidth: 14, textAlign: "center",
          }}>
            {activeCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div style={{
      position: "absolute",
      top: 0,
      right: 0,
      width: 260,
      height: "100%",
      background: "linear-gradient(180deg, #162636 0%, #1f3348 50%, #2a4560 100%)",
      backdropFilter: "blur(12px)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      zIndex: 20,
      borderLeft: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "-4px 0 12px rgba(0,0,0,0.25)",
      transition: "transform 0.2s ease",
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase" }}>
            LAYERS
          </span>
          <span style={{
            fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.4)",
            background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 4,
          }}>
            {activeCount}
          </span>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 4,
            display: "flex", alignItems: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Locations */}
      {onFlyTo && <MapLocations onFlyTo={onFlyTo} />}

      {/* Search */}
      <div style={{ padding: "8px 12px", flexShrink: 0 }}>
        <input
          type="text"
          placeholder="Search layers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "6px 8px",
            fontSize: 10,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 4,
            color: "white",
            outline: "none",
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Layer list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 0 8px" }}>
        {filtered.map((cat) => {
          const isExpanded = expandedCats[cat.id] ?? false;
          const catActiveCount = cat.layers.filter((l) => layerState[l.id]).length;
          return (
            <div key={cat.id}>
              <button
                onClick={() => toggleCat(cat.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "7px 12px",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {isExpanded
                      ? <polyline points="6 9 12 15 18 9" />
                      : <polyline points="9 6 15 12 9 18" />}
                  </svg>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: "1px",
                    color: "rgba(255,255,255,0.5)", textTransform: "uppercase",
                  }}>
                    {cat.label}
                  </span>
                </div>
                {catActiveCount > 0 && (
                  <span style={{
                    fontSize: 8, fontWeight: 600,
                    color: "rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.06)",
                    padding: "1px 4px", borderRadius: 3,
                  }}>
                    {catActiveCount}
                  </span>
                )}
              </button>
              {isExpanded && (
                <div style={{ padding: "2px 0" }}>
                  {cat.layers.map((layer) => (
                    <button
                      key={layer.id}
                      onClick={() => toggle(layer.id)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "5px 12px 5px 28px",
                        background: layerState[layer.id]
                          ? "rgba(59,130,246,0.1)"
                          : "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {/* Toggle indicator */}
                      <div style={{
                        width: 14,
                        height: 14,
                        borderRadius: 3,
                        border: layerState[layer.id]
                          ? "2px solid #3b82f6"
                          : "2px solid rgba(255,255,255,0.2)",
                        background: layerState[layer.id]
                          ? "#3b82f6"
                          : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        {layerState[layer.id] && (
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span style={{
                        fontSize: 10,
                        color: layerState[layer.id]
                          ? "rgba(255,255,255,0.9)"
                          : "rgba(255,255,255,0.5)",
                        fontWeight: layerState[layer.id] ? 600 : 400,
                        textAlign: "left",
                      }}>
                        {layer.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
