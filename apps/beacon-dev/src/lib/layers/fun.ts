import type { LayerCategory } from "./types";

export const FUN: LayerCategory = {
  id: "fun",
  label: "FUN",
  layers: [
    { id: "fun-satellites", label: "Satellite Locations", enabled: false, opacity: 0.8, color: "#6366f1", path: "M6.05 4.14l-.39-.39c-.39-.39-1.02-.39-1.41 0l-.01.01c-.39.39-.39 1.02 0 1.41l.39.39c.39.39 1.03.39 1.42 0 .39-.39.39-1.03 0-1.42zM4.04 12.56H2.11c-.55 0-1 .45-1 1s.45 1 1 1h1.93c.55 0 1-.45 1-1s-.45-1-1-1zm10-9.82V.69c0-.55-.45-1-1-1s-1 .45-1 1v1.93c0 .55.45 1 1 1s1-.45 1-1zm5.36 2.44c-.39-.39-1.02-.39-1.41 0l-.39.39c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l.39-.39c.39-.38.39-1.02 0-1.41zM18 12.56c-.55 0-1 .45-1 1s.45 1 1 1h1.93c.55 0 1-.45 1-1s-.45-1-1-1H18z" },
    { id: "fun-iss", label: "ISS Tracker", enabled: false, opacity: 1, color: "#14b8a6", path: "M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" },
    { id: "fun-flights", label: "Flight Tracker", enabled: false, opacity: 0.6, color: "#0ea5e9", path: "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" },
    { id: "fun-ships", label: "Ship Tracker (AIS)", enabled: false, opacity: 0.6, color: "#2563eb", path: "M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.14.52-.05.78L3.95 19z" },
    { id: "fun-aurora", label: "Aurora Forecast", enabled: false, opacity: 0.5, color: "#a855f7", path: "M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" },
    { id: "fun-sun-moon", label: "Sun & Moon Position", enabled: false, opacity: 0.5, color: "#f59e0b", path: "M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" },
    { id: "fun-light-pollution", label: "Light Pollution", enabled: false, opacity: 0.5, color: "#fbbf24", path: "M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3z" },
    { id: "fun-time-zones", label: "Time Zones", enabled: false, opacity: 0.4, color: "#64748b", path: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" },
  ],
};
