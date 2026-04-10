/**
 * Vibe Check Icons - mood/status faces and symbols
 * Used in: daily check-ins, loved ones status, mood reports
 */
import React from "react";

interface P { size?: number; color?: string }
const D = { size: 24, color: "currentColor" };
const S = { fill: "none", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const VibeGreat = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" />
  </svg>
);

export const VibeGood = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 13a4 4 0 0 0 8 0" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" />
  </svg>
);

export const VibeOkay = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <circle cx="12" cy="12" r="10" />
    <line x1="8" y1="14" x2="16" y2="14" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" />
  </svg>
);

export const VibeWorried = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <circle cx="12" cy="12" r="10" />
    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" />
  </svg>
);

export const VibeBad = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <circle cx="12" cy="12" r="10" />
    <path d="M16 16a4 4 0 0 0-8 0" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" />
  </svg>
);

export const VibeUnsafe = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <circle cx="12" cy="12" r="10" />
    <path d="M16 16a4 4 0 0 0-8 0" />
    <line x1="8" y1="8" x2="10" y2="10" />
    <line x1="10" y1="8" x2="8" y2="10" />
    <line x1="14" y1="8" x2="16" y2="10" />
    <line x1="16" y1="8" x2="14" y2="10" />
  </svg>
);

export const Heart = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const ThumbsUp = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M14 9V5a3 3 0 0 0-6 0v4" />
    <path d="M5 11h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z" />
    <path d="M10 11l1-4 1.5-1H17a2 2 0 0 1 2 2v1l-1 5H10z" />
  </svg>
);

export const CheckIn = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="16 10 11 15 8 12" />
  </svg>
);
