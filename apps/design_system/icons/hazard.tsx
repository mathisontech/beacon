/**
 * Hazard Icons - one per hazard type
 * Used in: threat lists, map pins, zone indicators, alerts
 */
import React from "react";

interface P { size?: number; color?: string }
const D = { size: 24, color: "currentColor" };
const S = { fill: "none", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

// --- WATER ---

export const Flood = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M2 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    <path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    <path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    <line x1="12" y1="2" x2="12" y2="8" />
    <polyline points="9 5 12 2 15 5" />
  </svg>
);

export const Hurricane = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0" />
    <path d="M4 12c0-5 4-8 8-8 6 0 4 6 0 6" />
    <path d="M20 12c0 5-4 8-8 8-6 0-4-6 0-6" />
  </svg>
);

export const Tsunami = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M2 18c3-4 5-8 10-8 3 0 4 2 6 2s3-1 4-2" />
    <path d="M2 22c3-4 5-8 10-8 3 0 4 2 6 2s3-1 4-2" />
    <line x1="4" y1="6" x2="4" y2="10" />
    <line x1="8" y1="4" x2="8" y2="10" />
  </svg>
);

export const StormSurge = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    <polyline points="6 14 6 6 10 10 14 4 18 8 18 14" />
  </svg>
);

// --- FIRE ---

export const Wildfire = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M12 2c-2 4-6 6-6 11a6 6 0 0 0 12 0c0-5-4-7-6-11z" />
    <path d="M12 22a3 3 0 0 1-3-3c0-2 3-4 3-4s3 2 3 4a3 3 0 0 1-3 3z" />
  </svg>
);

export const HighFireRisk = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M12 2c-2 4-6 6-6 11a6 6 0 0 0 12 0c0-5-4-7-6-11z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
  </svg>
);

// --- EARTH ---

export const Earthquake = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <polyline points="2 12 5 12 7 8 10 16 13 6 16 18 19 12 22 12" />
    <line x1="2" y1="20" x2="8" y2="20" />
    <line x1="16" y1="20" x2="22" y2="20" />
    <path d="M10 20l1-4" />
    <path d="M14 20l-1-4" />
  </svg>
);

export const Landslide = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M4 20L14 4l6 16H4z" />
    <circle cx="8" cy="16" r="1.5" fill={color} stroke="none" />
    <circle cx="13" cy="14" r="1" fill={color} stroke="none" />
    <circle cx="11" cy="18" r="1" fill={color} stroke="none" />
  </svg>
);

export const Volcano = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M2 22L8 8l4 6 4-6 6 14H2z" />
    <path d="M10 2c0 2 2 3 2 5" />
    <path d="M14 2c0 2-2 3-2 5" />
  </svg>
);

export const Sinkhole = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <ellipse cx="12" cy="14" rx="8" ry="4" />
    <path d="M4 14c0 4 3.6 7 8 7s8-3 8-7" />
    <line x1="12" y1="4" x2="12" y2="10" />
    <polyline points="9 7 12 10 15 7" />
  </svg>
);

// --- WIND ---

export const Tornado = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M4 4h16" />
    <path d="M6 8h14" />
    <path d="M8 12h10" />
    <path d="M10 16h6" />
    <path d="M11 20h2" />
  </svg>
);

export const HighWind = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M9.59 4.59A2 2 0 1 1 11 8H2" />
    <path d="M12.59 19.41A2 2 0 1 0 14 16H2" />
    <path d="M17.73 7.73A2.5 2.5 0 1 1 19.5 12H2" />
  </svg>
);

// --- TEMPERATURE ---

export const ExtremeHeat = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    <circle cx="11.5" cy="17.5" r="2" fill={color} stroke="none" />
    <line x1="19" y1="6" x2="21" y2="4" />
    <line x1="19" y1="10" x2="22" y2="10" />
    <line x1="19" y1="14" x2="21" y2="16" />
  </svg>
);

export const ExtremeCold = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="4" y1="7" x2="20" y2="17" />
    <line x1="20" y1="7" x2="4" y2="17" />
    <line x1="12" y1="2" x2="14.5" y2="4.5" />
    <line x1="12" y1="2" x2="9.5" y2="4.5" />
    <line x1="12" y1="22" x2="14.5" y2="19.5" />
    <line x1="12" y1="22" x2="9.5" y2="19.5" />
  </svg>
);

export const Blizzard = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M18 7h-1.26A8 8 0 1 0 9 15h9a5 5 0 0 0 0-10z" />
    <line x1="8" y1="17" x2="7" y2="22" />
    <line x1="12" y1="17" x2="12" y2="22" />
    <line x1="16" y1="17" x2="15" y2="22" />
    <path d="M2 18l2 1 2-1" />
    <path d="M18 18l2 1 2-1" />
  </svg>
);

// --- OTHER ---

export const PowerOutage = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    <line x1="4" y1="4" x2="20" y2="20" strokeWidth="2" />
  </svg>
);

export const Hazmat = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
    <line x1="12" y1="2" x2="12" y2="9" />
    <line x1="3.5" y1="17" x2="9.8" y2="13.5" />
    <line x1="20.5" y1="17" x2="14.2" y2="13.5" />
  </svg>
);

export const AirQuality = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M8 16s1-2 4-2 4 2 4 2" />
    <circle cx="12" cy="8" r="5" />
    <line x1="12" y1="6" x2="12" y2="8" strokeWidth="2.5" />
    <path d="M3 20h18" />
  </svg>
);

export const AlertTriangle = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
  </svg>
);
