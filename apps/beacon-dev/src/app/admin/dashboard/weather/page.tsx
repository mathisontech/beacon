"use client";

import dynamic from "next/dynamic";

const WeatherWorldMap = dynamic(
  () => import("@/components/map/weather-world-map"),
  { ssr: false },
);

export default function WeatherPage() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <div
        style={{
          flex: 1,
          padding: 20,
          background: "#fff",
          overflow: "hidden",
          display: "flex",
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            flex: 1,
            position: "relative",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <WeatherWorldMap />
        </div>
      </div>
    </div>
  );
}
