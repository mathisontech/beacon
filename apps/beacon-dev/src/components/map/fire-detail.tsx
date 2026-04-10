"use client";

import type { ActiveFire } from "@/types/fire";
import { fireColor, formatAcres } from "@/lib/fire-data";

interface Projection {
  spreadRateAcresPerHour: number;
  movementBearingDeg: number;
  movementLabel: string;
  movementDistKmPerDay: number;
  projectedAcres24h: number;
  projectedAcres48h: number;
  confidence: "high" | "medium" | "low";
}

interface Props {
  fire: ActiveFire;
  projection: Projection | null;
  loading: boolean;
}

function formatDuration(startISO: string, endISO?: string): string {
  if (!startISO) return "Unknown";
  const start = new Date(startISO).getTime();
  if (isNaN(start)) return "Unknown";
  const end = endISO ? new Date(endISO).getTime() : NaN;
  const ref = isNaN(end) ? Date.now() : end;
  const hours = Math.floor((ref - start) / 3600000);
  if (hours < 1) return "<1 hr";
  if (hours < 24) return `${hours} hr`;
  const days = Math.floor(hours / 24);
  const rem = hours % 24;
  if (days === 1) return rem > 0 ? `1 day ${rem} hr` : "1 day";
  return rem > 0 ? `${days} days ${rem} hr` : `${days} days`;
}

function isStale(fire: ActiveFire): boolean {
  const ref = fire.updated || fire.discoveryDate || fire.discovered || "";
  if (!ref) return false;
  const ms = Date.now() - new Date(ref).getTime();
  return ms > 30 * 24 * 3600000; // no update in 30+ days
}

function fireStatus(fire: ActiveFire): { label: string; done: boolean } {
  if (fire.fireOutDate) return { label: "Out", done: true };
  if (fire.controlDate) return { label: "Controlled", done: true };
  if (fire.containmentDate) return { label: "Contained", done: true };
  if (fire.containment >= 100) return { label: "Contained", done: true };
  const rx = fire.name?.toUpperCase().startsWith("RX ") || fire.incidentType === "RX";
  if (rx && isStale(fire)) return { label: "Rx Complete", done: true };
  if (isStale(fire)) return { label: "Inactive", done: true };
  return { label: rx ? "Rx Active" : "Active", done: false };
}

function formatDate(isoDate: string): string {
  if (!isoDate) return "--";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return "--";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "3px 0",
  fontSize: 10,
};
const label: React.CSSProperties = { color: "rgba(255,255,255,0.45)" };
const value: React.CSSProperties = { color: "#fff", fontWeight: 500, textAlign: "right" };

export default function FireDetail({ fire, projection, loading }: Props) {
  const disc = fire.discoveryDate || fire.discovered || "";
  const status = fireStatus(fire);
  const endDate = fire.fireOutDate || fire.controlDate || fire.containmentDate || "";

  return (
    <div style={{
      position: "absolute",
      top: 10,
      left: 10,
      zIndex: 22,
      width: 240,
      background: "rgba(20,20,20,0.92)",
      borderRadius: 8,
      padding: "10px 12px",
      color: "#fff",
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    }}>
      {/* Name + color dot + status */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: status.done ? "#6b7280" : fireColor(fire.acres), flexShrink: 0,
        }} />
        <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {fire.name}
        </div>
        <div style={{
          fontSize: 8,
          fontWeight: 600,
          padding: "1px 5px",
          borderRadius: 3,
          background: status.done ? "rgba(107,114,128,0.4)" : "rgba(239,68,68,0.3)",
          color: status.done ? "#9ca3af" : "#fca5a5",
          flexShrink: 0,
        }}>
          {status.label}
        </div>
      </div>

      {/* Core stats */}
      {fire.incidentType && (
        <div style={row}>
          <span style={label}>Type</span>
          <span style={value}>
            {fire.incidentType === "RX" || fire.name?.toUpperCase().startsWith("RX ")
              ? "Prescribed"
              : fire.incidentType === "WF" ? "Wildfire"
              : fire.incidentType === "CX" ? "Complex"
              : fire.incidentType}
          </span>
        </div>
      )}
      <div style={row}>
        <span style={label}>Started</span>
        <span style={value}>{formatDate(disc)}</span>
      </div>
      <div style={row}>
        <span style={label}>{status.done ? "Burned for" : "Burning for"}</span>
        <span style={value}>{formatDuration(disc, status.done ? endDate : undefined)}</span>
      </div>
      {status.done && endDate && (
        <div style={row}>
          <span style={label}>{fire.fireOutDate ? "Out" : "Contained"}</span>
          <span style={value}>{formatDate(endDate)}</span>
        </div>
      )}
      {fire.updated && (
        <div style={row}>
          <span style={label}>Last update</span>
          <span style={value}>{formatDate(fire.updated)}</span>
        </div>
      )}
      <div style={row}>
        <span style={label}>Size</span>
        <span style={value}>{formatAcres(fire.acres)} acres</span>
      </div>
      <div style={row}>
        <span style={label}>Containment</span>
        <span style={value}>{fire.containment}%</span>
      </div>
      {fire.cause && fire.cause !== "Unknown" && (
        <div style={row}>
          <span style={label}>Cause</span>
          <span style={value}>{fire.cause}</span>
        </div>
      )}
      {fire.behavior && (
        <div style={row}>
          <span style={label}>Behavior</span>
          <span style={{
            ...value,
            maxWidth: 140,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {[fire.behavior, fire.behavior2, fire.behavior3].filter(Boolean).join(", ")}
          </span>
        </div>
      )}
      {fire.state && (
        <div style={row}>
          <span style={label}>Location</span>
          <span style={value}>
            {[fire.county, fire.state].filter(Boolean).join(", ")}
          </span>
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", margin: "6px 0" }} />

      {/* Projection */}
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>
        Projected Movement
      </div>
      {loading && (
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", padding: "4px 0" }}>
          Calculating...
        </div>
      )}
      {!loading && !projection && (
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", padding: "4px 0" }}>
          Insufficient perimeter data
        </div>
      )}
      {!loading && projection && (
        <>
          <div style={row}>
            <span style={label}>Spread rate</span>
            <span style={value}>{projection.spreadRateAcresPerHour} ac/hr</span>
          </div>
          <div style={row}>
            <span style={label}>Direction</span>
            <span style={value}>{projection.movementLabel} ({projection.movementBearingDeg}°)</span>
          </div>
          <div style={row}>
            <span style={label}>Movement</span>
            <span style={value}>{projection.movementDistKmPerDay} km/day</span>
          </div>
          <div style={row}>
            <span style={label}>24h est.</span>
            <span style={value}>{formatAcres(projection.projectedAcres24h)} acres</span>
          </div>
          <div style={row}>
            <span style={label}>48h est.</span>
            <span style={value}>{formatAcres(projection.projectedAcres48h)} acres</span>
          </div>
          <div style={{
            fontSize: 8,
            color: "rgba(255,255,255,0.25)",
            marginTop: 4,
            fontStyle: "italic",
          }}>
            {projection.confidence} confidence — based on perimeter history
          </div>
        </>
      )}
    </div>
  );
}
