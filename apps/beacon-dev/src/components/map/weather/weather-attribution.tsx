"use client";

/**
 * Required attribution footer for weather data sources.
 * Must remain visible when any weather overlay is enabled to satisfy
 * Open-Meteo's CC-BY 4.0 license and NOAA's courtesy attribution request.
 */
export default function WeatherAttribution() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 6,
        right: 10,
        color: "#fff",
        fontSize: 10,
        background: "rgba(0,0,0,0.55)",
        padding: "3px 8px",
        borderRadius: 4,
        pointerEvents: "none",
        zIndex: 40,
        maxWidth: 380,
        textAlign: "right",
        lineHeight: 1.3,
      }}
    >
      Weather data by{" "}
      <a
        href="https://open-meteo.com/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#7dd3fc", pointerEvents: "auto" }}
      >
        Open-Meteo.com
      </a>
      {" · "}
      Hurricane data: NOAA NHC, GDACS
      {" · "}
      Imagery: NASA GIBS, NOAA NWS
    </div>
  );
}
