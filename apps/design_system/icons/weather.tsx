/**
 * Weather Icons - simplified outlines, 24x24 viewBox
 * Used in: status sidebar, map pins, daily reports
 */
import React from "react";

interface P { size?: number; color?: string }
const D = { size: 24, color: "currentColor" };
const S = { fill: "none", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const Sunny = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

export const PartlyCloudy = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <circle cx="10" cy="8" r="4" />
    <line x1="10" y1="1" x2="10" y2="2.5" />
    <line x1="4" y1="8" x2="2.5" y2="8" />
    <line x1="5" y1="3.5" x2="4" y2="2.5" />
    <path d="M7 15H6a4 4 0 0 1 0-8h.5" />
    <path d="M20 17a3 3 0 0 0-3-3h-1a5 5 0 0 0-10 0 4 4 0 0 0 0 8h14a3 3 0 0 0 0-6z" />
  </svg>
);

export const Cloudy = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
);

export const Rain = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M18 8h-1.26A8 8 0 1 0 9 16h9a5 5 0 0 0 0-10z" />
    <line x1="8" y1="19" x2="7" y2="22" />
    <line x1="12" y1="19" x2="11" y2="22" />
    <line x1="16" y1="19" x2="15" y2="22" />
  </svg>
);

export const HeavyRain = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M18 7h-1.26A8 8 0 1 0 9 15h9a5 5 0 0 0 0-10z" />
    <line x1="7" y1="17" x2="5" y2="22" />
    <line x1="11" y1="17" x2="9" y2="22" />
    <line x1="15" y1="17" x2="13" y2="22" />
    <line x1="19" y1="17" x2="17" y2="22" />
  </svg>
);

export const Thunderstorm = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M18 7h-1.26A8 8 0 1 0 9 15h9a5 5 0 0 0 0-10z" />
    <polyline points="13 16 11 20 14 20 12 24" />
  </svg>
);

export const Snow = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M18 8h-1.26A8 8 0 1 0 9 16h9a5 5 0 0 0 0-10z" />
    <line x1="8" y1="19" x2="8" y2="19.5" strokeWidth="2.5" />
    <line x1="12" y1="20" x2="12" y2="20.5" strokeWidth="2.5" />
    <line x1="16" y1="19" x2="16" y2="19.5" strokeWidth="2.5" />
    <line x1="10" y1="22" x2="10" y2="22.5" strokeWidth="2.5" />
    <line x1="14" y1="22" x2="14" y2="22.5" strokeWidth="2.5" />
  </svg>
);

export const Wind = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M9.59 4.59A2 2 0 1 1 11 8H2" />
    <path d="M12.59 19.41A2 2 0 1 0 14 16H2" />
    <path d="M17.73 7.73A2.5 2.5 0 1 1 19.5 12H2" />
  </svg>
);

export const Fog = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <line x1="3" y1="8" x2="21" y2="8" />
    <line x1="5" y1="12" x2="19" y2="12" />
    <line x1="3" y1="16" x2="21" y2="16" />
    <line x1="7" y1="20" x2="17" y2="20" />
  </svg>
);

export const Hot = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
  </svg>
);

export const Cold = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="4" y1="7" x2="20" y2="17" />
    <line x1="20" y1="7" x2="4" y2="17" />
    <line x1="12" y1="2" x2="14" y2="4" />
    <line x1="12" y1="2" x2="10" y2="4" />
    <line x1="12" y1="22" x2="14" y2="20" />
    <line x1="12" y1="22" x2="10" y2="20" />
  </svg>
);

export const Hail = ({ size = D.size, color = D.color }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...S}>
    <path d="M18 8h-1.26A8 8 0 1 0 9 16h9a5 5 0 0 0 0-10z" />
    <circle cx="8" cy="20" r="1" fill={color} stroke="none" />
    <circle cx="12" cy="22" r="1" fill={color} stroke="none" />
    <circle cx="16" cy="20" r="1" fill={color} stroke="none" />
  </svg>
);
