"use client";

const DEVICES = [
  { name: "Desktop", w: 1920, h: 1080 },
  { name: "iPad (Portrait)", w: 1024, h: 1366 },
  { name: "iPad (Landscape)", w: 1366, h: 1024 },
  { name: "iPhone 15 Pro", w: 393, h: 852 },
  { name: "iPhone 15 Pro (Landscape)", w: 852, h: 393 },
  { name: "iPhone SE", w: 375, h: 667 },
  { name: "iPhone SE (Landscape)", w: 667, h: 375 },
  { name: "Android Mid", w: 360, h: 800 },
  { name: "Android Mid (Landscape)", w: 800, h: 360 },
];

// Pairs for rotation toggle
const ROTATION_PAIRS: Record<string, string> = {
  "iPad (Portrait)": "iPad (Landscape)",
  "iPad (Landscape)": "iPad (Portrait)",
  "iPhone 15 Pro": "iPhone 15 Pro (Landscape)",
  "iPhone 15 Pro (Landscape)": "iPhone 15 Pro",
  "iPhone SE": "iPhone SE (Landscape)",
  "iPhone SE (Landscape)": "iPhone SE",
  "Android Mid": "Android Mid (Landscape)",
  "Android Mid (Landscape)": "Android Mid",
};

interface Props {
  selected: string;
  onSelect: (name: string) => void;
}

export default function DevicePreview({ selected, onSelect }: Props) {
  const canRotate = selected in ROTATION_PAIRS;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {canRotate && (
        <button
          onClick={() => onSelect(ROTATION_PAIRS[selected])}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 6,
            border: "1px solid #d1d5db",
            background: "#fff",
            cursor: "pointer",
            color: "#6b7280",
            transition: "border-color 0.15s, color 0.15s",
          }}
          title="Rotate device"
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1f3348"; e.currentTarget.style.color = "#1f3348"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.color = "#6b7280"; }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: selected.includes("Landscape") ? "rotate(90deg)" : "none",
              transition: "transform 0.2s",
            }}
          >
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <path d="M12 18h.01" />
          </svg>
        </button>
      )}
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="beacon-select"
      >
        {DEVICES.map((d) => (
          <option key={d.name} value={d.name}>
            {d.name}{d.name !== "Desktop" ? ` (${d.w}x${d.h})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

export function getDeviceDimensions(
  name: string
): { w: number; h: number } | null {
  return DEVICES.find((d) => d.name === name) || null;
}
