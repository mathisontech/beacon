/**
 * Help Icons - requesting/offering resources, shelters, actions
 * Purple bg = offering help. Orange bg = requesting help.
 * Used in: map pins, sidebar, PHP section, alerts
 */
import React from "react";

interface P { size?: number; color?: string }
const D = { size: 24, color: "currentColor" };
const S = { fill: "none", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

// --- REQUESTING HELP (orange bg context) ---

export const NeedHelp = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
  </svg>
);

export const NeedWater = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M12 2c-3 5-7 8-7 13a7 7 0 0 0 14 0c0-5-4-8-7-13z" />
  </svg>
);

export const NeedFood = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
);

export const NeedMedical = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export const NeedShelter = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const NeedTransport = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <rect x="1" y="6" width="15" height="10" rx="2" />
    <path d="M16 10h4l3 3v3h-7V10z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

export const NeedPower = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const NeedRescue = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="8" />
    <line x1="12" y1="16" x2="12" y2="22" />
    <line x1="2" y1="12" x2="8" y2="12" />
    <line x1="16" y1="12" x2="22" y2="12" />
  </svg>
);

export const Trapped = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20v-2a8 8 0 0 1 16 0v2" />
    <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" />
  </svg>
);

// --- OFFERING HELP (purple bg context) ---

export const OfferShelter = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
    <path d="M10 8h4" />
    <path d="M12 6v4" />
  </svg>
);

export const OfferRide = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <rect x="1" y="6" width="15" height="10" rx="2" />
    <path d="M16 10h4l3 3v3h-7V10z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
    <path d="M10 4h4" />
    <path d="M12 2v4" />
  </svg>
);

export const OfferFood = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <path d="M8 4h4" />
    <path d="M10 2v4" />
  </svg>
);

export const OfferMedical = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export const OfferSupplies = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

export const OfferSnowTires = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="3" x2="12" y2="8" />
    <line x1="12" y1="16" x2="12" y2="21" />
    <line x1="3" y1="12" x2="8" y2="12" />
    <line x1="16" y1="12" x2="21" y2="12" />
  </svg>
);

export const OfferGenerator = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <polyline points="12 11 10 15 14 15 12 19" />
    <line x1="7" y1="7" x2="7" y2="3" />
    <line x1="17" y1="7" x2="17" y2="3" />
  </svg>
);

export const VolunteerHand = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M18 16v-5a2 2 0 0 0-4 0" />
    <path d="M14 11V6a2 2 0 0 0-4 0v6" />
    <path d="M10 10V5a2 2 0 0 0-4 0v9" />
    <path d="M6 14V9a2 2 0 0 0-4 0v7a8 8 0 0 0 16 0v-3a2 2 0 0 0-4 0" />
  </svg>
);
