/**
 * Icon Containers - circle badges, teardrop map pins, zone pills
 * Wrap any icon in a colored container per the icon standard
 */
import React from "react";
import { icons } from "../tokens";

type Size = "sm" | "md" | "lg" | "xl";
type BgKey = keyof typeof icons.backgrounds;

interface CircleProps {
  bg: BgKey;
  size?: Size;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function IconCircle({ bg, size = "md", children, style }: CircleProps) {
  const s = icons.circle[size];
  const c = icons.backgrounds[bg];
  return (
    <div
      style={{
        width: s.size,
        height: s.size,
        borderRadius: "50%",
        background: c.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        ...style,
      }}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement<{ size?: number; color?: string }>(child)
          ? React.cloneElement(child, { size: s.iconSize, color: c.text })
          : child
      )}
    </div>
  );
}

interface TeardropProps {
  bg: BgKey;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function IconTeardrop({ bg, children, style }: TeardropProps) {
  const t = icons.teardrop;
  const c = icons.backgrounds[bg];
  return (
    <div
      style={{
        width: t.width,
        height: t.height,
        borderRadius: t.borderRadius,
        transform: t.transform,
        background: c.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        ...style,
      }}
    >
      <div style={{ transform: "rotate(45deg)" }}>
        {React.Children.map(children, (child) =>
          React.isValidElement<{ size?: number; color?: string }>(child)
            ? React.cloneElement(child, { size: t.iconSize, color: c.text })
            : child
        )}
      </div>
    </div>
  );
}

interface ZoneProps {
  bg: BgKey;
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function IconZone({ bg, label, children, style }: ZoneProps) {
  const z = icons.zone;
  const c = icons.backgrounds[bg];
  return (
    <div
      style={{
        height: z.height,
        padding: z.padding,
        borderRadius: z.borderRadius,
        background: c.bg,
        color: c.text,
        display: "inline-flex",
        alignItems: "center",
        gap: z.gap,
        fontSize: z.fontSize,
        fontWeight: z.fontWeight,
        letterSpacing: z.letterSpacing,
        textTransform: z.textTransform,
        flexShrink: 0,
        ...style,
      }}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement<{ size?: number; color?: string }>(child)
          ? React.cloneElement(child, { size: z.iconSize, color: c.text })
          : child
      )}
      <span>{label}</span>
    </div>
  );
}
