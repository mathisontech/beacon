import { BUILTIN_PATHS } from "./registry";
import type { IconSource, BuiltinIconId } from "./types";

interface Props {
  source: IconSource;
  size?: number;
  color?: string;
  subscript?: number;
  active?: boolean;
}

/** Render any icon (builtin SVG or custom image) with optional subscript. */
export function BeaconIcon({
  source,
  size = 20,
  color = "rgba(0,0,0,0.45)",
  subscript,
  active,
}: Props) {
  const finalColor = active ? "#1a2a3a" : color;

  const sub = subscript != null && subscript > 0 ? (
    <span
      style={{
        position: "absolute",
        bottom: -2,
        right: -4,
        fontSize: size * 0.4,
        fontWeight: 700,
        color: active ? "#1a2a3a" : "rgba(0,0,0,0.4)",
        lineHeight: 1,
        fontFamily: "inherit",
      }}
    >
      {subscript}
    </span>
  ) : null;

  if (source.kind === "custom") {
    return (
      <span style={{ position: "relative", display: "inline-flex" }}>
        <img
          src={source.url}
          alt=""
          style={{
            width: size,
            height: size,
            borderRadius: size * 0.2,
            objectFit: "cover",
            opacity: active ? 1 : 0.6,
          }}
        />
        {sub}
      </span>
    );
  }

  const path = BUILTIN_PATHS[source.id as BuiltinIconId] || BUILTIN_PATHS.pin;

  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={finalColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={path} />
      </svg>
      {sub}
    </span>
  );
}
