import type { LayerCategory } from "./types";

export const LIVE: LayerCategory = {
  id: "live",
  label: "LIVE",
  layers: [
    { id: "live-traffic", label: "Traffic", enabled: false, opacity: 0.7, color: "#ef4444", path: "M20 5h-2.17l-1.24-1.35A1.99 1.99 0 0015.12 3H8.88c-.56 0-1.1.24-1.48.65L6.17 5H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-8 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3z" },
    { id: "live-evacuation", label: "Evacuation Zones", enabled: false, opacity: 0.7, color: "#f97316", path: "M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 15h2v2h-2v-2zm0-8h2v6h-2V9z" },
    { id: "live-shelters", label: "Open Shelters / Doors", enabled: false, opacity: 0.8, color: "#22c55e", path: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" },
    { id: "live-road-closures", label: "Road Closures", enabled: false, opacity: 0.8, color: "#dc2626", path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" },
    { id: "live-power-outages", label: "Power Outages", enabled: false, opacity: 0.7, color: "#eab308", path: "M7 2v11h3v9l7-12h-4l4-8z" },
    { id: "live-911-calls", label: "911 Call Volume", enabled: false, opacity: 0.5, color: "#b91c1c", path: "M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 4 3 4.24 3 5c0 9.39 7.61 17 17 17 .71 0 1-.63 1-1.18v-3.45c0-.54-.45-.99-.99-.99z" },
    { id: "live-webcams", label: "Webcams", enabled: false, opacity: 1, color: "#6366f1", path: "M17 10.5V7c0-.55-.45-1-1-1H2c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" },
    { id: "live-user-reports", label: "User Reports", enabled: false, opacity: 0.8, color: "#8b5cf6", path: "M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z" },
    { id: "live-nws-alerts", label: "NWS Alerts", enabled: false, opacity: 0.7, color: "#f59e0b", path: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" },
    { id: "live-nifc-fires", label: "NIFC Active Fires", enabled: true, opacity: 0.9, color: "#ef4444", path: "M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" },
    { id: "live-feeds-master", label: "Live Data Feeds", enabled: true, opacity: 0.8, color: "#14b8a6", path: "M6.18 17.82c-2.83-2.83-2.83-7.42 0-10.24l1.42 1.41c-2.05 2.05-2.05 5.37 0 7.42l-1.42 1.41zM3.34 20.66C-.78 16.54-.78 9.86 3.34 5.74l1.42 1.41c-3.33 3.33-3.33 8.75 0 12.09l-1.42 1.42zM12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm5.82-2.42c2.83 2.83 2.83 7.42 0 10.24l-1.42-1.41c2.05-2.05 2.05-5.37 0-7.42l1.42-1.41zm2.84-2.84c4.12 4.12 4.12 10.8 0 14.92l-1.42-1.41c3.33-3.33 3.33-8.75 0-12.09l1.42-1.42z" },
  ],
};
