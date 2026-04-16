import type { LayerCategory } from "./types";

export const REFERENCE: LayerCategory = {
  id: "reference",
  label: "REFERENCE",
  layers: [
    // Boundaries
    { id: "ref-countries", label: "Country Borders", enabled: false, opacity: 0.8, color: "#64748b", path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" },
    { id: "ref-states", label: "State / Province Borders", enabled: false, opacity: 0.7, color: "#78716c", path: "M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" },
    { id: "ref-counties", label: "County / Parish Borders", enabled: false, opacity: 0.5, color: "#a8a29e", path: "M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5z" },
    { id: "ref-zip-codes", label: "Zip Codes", enabled: false, opacity: 0.4, color: "#d6d3d1", path: "M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" },

    // Land ownership (US)
    { id: "ref-federal-land", label: "Federal Land (US)", enabled: false, opacity: 0.4, color: "#16a34a", path: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" },
    { id: "ref-state-land", label: "State Land (US)", enabled: false, opacity: 0.4, color: "#65a30d", path: "M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" },
    { id: "ref-tribal-land", label: "Tribal Land (US)", enabled: false, opacity: 0.4, color: "#ca8a04", path: "M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" },

    // Physical
    { id: "ref-elevation", label: "Elevation / Topography", enabled: false, opacity: 0.5, color: "#78716c", path: "M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z" },
    { id: "ref-bathymetry", label: "Ocean Bathymetry", enabled: false, opacity: 0.4, color: "#0369a1", path: "M17 16.99c-1.35 0-2.2.42-2.95.8-.65.33-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.42-2.95.8c-.65.33-1.18.6-2.05.6v1.95c1.35 0 2.2-.42 2.95-.8.65-.33 1.18-.6 2.05-.6.9 0 1.4.25 2.05.6.75.38 1.57.8 2.95.8s2.2-.42 2.95-.8c.65-.33 1.18-.6 2.05-.6v-1.95c-.9 0-1.4.25-2.05.6-.75.38-1.6.8-2.95.8zm0-4.45c-1.35 0-2.2.43-2.95.8-.65.32-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.43-2.95.8c-.65.32-1.18.6-2.05.6v1.95c1.35 0 2.2-.43 2.95-.8.65-.35 1.15-.6 2.05-.6.9 0 1.4.25 2.05.6.75.38 1.57.8 2.95.8s2.2-.43 2.95-.8c.65-.35 1.15-.6 2.05-.6v-1.95c-.9 0-1.4.25-2.05.6-.75.38-1.6.8-2.95.8zm2.95-8.08c-.75-.38-1.58-.8-2.95-.8s-2.2.42-2.95.8c-.65.32-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6C9.2 4.04 8.37 3.62 7 3.62s-2.2.42-2.95.8c-.65.32-1.18.6-2.05.6v1.93c1.35 0 2.2-.43 2.95-.8.65-.33 1.18-.6 2.05-.6.9 0 1.4.25 2.05.6.75.38 1.57.8 2.95.8s2.2-.43 2.95-.8c.65-.33 1.18-.6 2.05-.6v-1.93c-.9-.02-1.4.23-2.05.58z" },
    { id: "ref-watersheds", label: "Watersheds", enabled: false, opacity: 0.4, color: "#0284c7", path: "M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z" },
    { id: "ref-rivers", label: "Rivers & Waterways", enabled: false, opacity: 0.5, color: "#0ea5e9", path: "M17 16.99c-1.35 0-2.2.42-2.95.8-.65.33-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.42-2.95.8c-.65.33-1.18.6-2.05.6v1.95c1.35 0 2.2-.42 2.95-.8.65-.33 1.18-.6 2.05-.6.9 0 1.4.25 2.05.6.75.38 1.57.8 2.95.8s2.2-.42 2.95-.8c.65-.33 1.18-.6 2.05-.6v-1.95c-.9 0-1.4.25-2.05.6-.75.38-1.6.8-2.95.8z" },
    { id: "ref-coastline", label: "Coastline", enabled: false, opacity: 0.6, color: "#38bdf8", path: "M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.36.2-.8.2-1.15 0l-7.9-4.44c-.32-.17-.52-.5-.52-.88s.21-.71.53-.88L12 11.69l8.47 4.75c.32.17.53.5.53.88z" },

    // Geologic
    { id: "ref-fault-lines", label: "Fault Lines", enabled: false, opacity: 0.7, color: "#b91c1c", path: "M22 18v-2H13.41l3.5-6H22v-2h-5.09c-.33 0-.62.18-.78.47l-3.22 5.53H2v2h10.91c.33 0 .62-.18.78-.47L17.09 10H20v2h-3.41l-3.5 6H2v2h20z" },
    { id: "ref-volcanoes", label: "Volcano Locations", enabled: false, opacity: 0.8, color: "#dc2626", path: "M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6zM12 4l1 2h-2l1-2z" },
    { id: "ref-tectonic-plates", label: "Tectonic Plates", enabled: false, opacity: 0.5, color: "#92400e", path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM6 12l4-4v3h4v2h-4v3l-4-4z" },
    { id: "ref-soil-type", label: "Soil Type", enabled: false, opacity: 0.4, color: "#a16207", path: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" },

    // Human
    { id: "ref-population", label: "Population Density", enabled: false, opacity: 0.5, heatmapFallback: true, color: "#7c3aed", path: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" },
    { id: "ref-buildings", label: "Buildings", enabled: false, opacity: 0.7, minZoom: 13, heatmapFallback: true, color: "#475569", path: "M17 11V3H7v4H1v14h22V11h-6zm-8-6h2v2H9V5zm0 4h2v2H9V9zm0 4h2v2H9v-2zm-4 4H3v-2h2v2zm0-4H3v-2h2v2zm0-4H3V7h2v2zm6 8h-2v-2h2v2zm8 0h-2v-2h2v2zm0-4h-2v-2h2v2z" },
    { id: "ref-roads", label: "Roads", enabled: false, opacity: 0.6, minZoom: 10, heatmapFallback: true, color: "#78716c", path: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" },
    { id: "ref-vegetation", label: "Vegetation / Land Cover", enabled: false, opacity: 0.5, minZoom: 8, heatmapFallback: true, color: "#16a34a", path: "M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" },
    { id: "ref-airports", label: "Airports", enabled: false, opacity: 0.7, color: "#0ea5e9", path: "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" },
    { id: "ref-hospitals", label: "Hospitals", enabled: false, opacity: 0.7, color: "#dc2626", path: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" },
    { id: "ref-schools", label: "Schools", enabled: false, opacity: 0.6, color: "#7c3aed", path: "M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" },
    { id: "ref-fire-stations", label: "Fire Stations", enabled: false, opacity: 0.7, color: "#ef4444", path: "M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z" },
    { id: "ref-police", label: "Police Stations", enabled: false, opacity: 0.7, color: "#2563eb", path: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" },
    { id: "ref-power-plants", label: "Power Plants", enabled: false, opacity: 0.6, color: "#eab308", path: "M7 2v11h3v9l7-12h-4l4-8z" },
    { id: "ref-dams", label: "Dams", enabled: false, opacity: 0.6, color: "#0284c7", path: "M17 16.99c-1.35 0-2.2.42-2.95.8-.65.33-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.42-2.95.8c-.65.33-1.18.6-2.05.6v1.95c1.35 0 2.2-.42 2.95-.8.65-.33 1.18-.6 2.05-.6.9 0 1.4.25 2.05.6.75.38 1.57.8 2.95.8s2.2-.42 2.95-.8c.65-.33 1.18-.6 2.05-.6v-1.95c-.9 0-1.4.25-2.05.6-.75.38-1.6.8-2.95.8zM2 6h20v4H2V6z" },
    { id: "ref-cell-towers", label: "Cell Towers", enabled: false, opacity: 0.5, minZoom: 10, heatmapFallback: true, color: "#6366f1", path: "M6.18 17.82c-2.83-2.83-2.83-7.42 0-10.24l1.42 1.41c-2.05 2.05-2.05 5.37 0 7.42l-1.42 1.41zM3.34 20.66C-.78 16.54-.78 9.86 3.34 5.74l1.42 1.41c-3.33 3.33-3.33 8.75 0 12.09l-1.42 1.42zM12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm5.82-2.42c2.83 2.83 2.83 7.42 0 10.24l-1.42-1.41c2.05-2.05 2.05-5.37 0-7.42l1.42-1.41zm2.84-2.84c4.12 4.12 4.12 10.8 0 14.92l-1.42-1.41c3.33-3.33 3.33-8.75 0-12.09l1.42-1.42z" },
  ],
};
