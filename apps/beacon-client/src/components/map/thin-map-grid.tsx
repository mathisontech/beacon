// Bare equirectangular grid for the no-base-map display.
// Just a rectangle with a few lat/lng gridlines and the equator/prime meridian.
// Base-map builder (C6) replaces this with real tiles.

interface Props {
  width: number;
  height: number;
}

export function ThinMapGrid({ width, height }: Props) {
  const gridStroke = "#1e293b";
  const axisStroke = "#475569";
  const bg = "#0b0f2a";

  const lngLines = [-120, -60, 0, 60, 120];
  const latLines = [-60, -30, 30, 60];

  return (
    <g>
      <rect x={0} y={0} width={width} height={height} fill={bg} />
      {lngLines.map((lng) => {
        const x = ((lng + 180) / 360) * width;
        return (
          <line
            key={`lng-${lng}`}
            x1={x}
            y1={0}
            x2={x}
            y2={height}
            stroke={gridStroke}
            strokeWidth={1}
          />
        );
      })}
      {latLines.map((lat) => {
        const y = ((90 - lat) / 180) * height;
        return (
          <line
            key={`lat-${lat}`}
            x1={0}
            y1={y}
            x2={width}
            y2={y}
            stroke={gridStroke}
            strokeWidth={1}
          />
        );
      })}
      {/* Equator */}
      <line
        x1={0}
        y1={height / 2}
        x2={width}
        y2={height / 2}
        stroke={axisStroke}
        strokeWidth={1.2}
      />
      {/* Prime meridian */}
      <line
        x1={width / 2}
        y1={0}
        x2={width / 2}
        y2={height}
        stroke={axisStroke}
        strokeWidth={1.2}
      />
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="none"
        stroke="#334155"
        strokeWidth={1}
      />
    </g>
  );
}
