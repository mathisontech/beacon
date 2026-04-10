/**
 * Common Icons - general-purpose UI icons
 * Used in: navigation, actions, status indicators
 */
import React from "react";

interface P { size?: number; color?: string }
const D = { size: 24, color: "currentColor" };
const S = { fill: "none", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const MapPin = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const Navigation = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <polygon points="3 11 22 2 13 21 11 13 3 11" />
  </svg>
);

export const Check = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const X = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const ChevronRight = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const ChevronDown = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const Bell = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export const Eye = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const People = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const Person = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const Message = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const Share = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export const Settings = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.08z" />
  </svg>
);

export const Clock = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const Shield = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const Info = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2.5" />
  </svg>
);

export const ArrowRight = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
