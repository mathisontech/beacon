// Shared placeholder used by every tab in checkpoint 1.
// Replaced by real content in later checkpoints.
export function TabPlaceholder({
  title,
  subtitle,
  checkpoint,
}: {
  title: string;
  subtitle: string;
  checkpoint: string;
}) {
  return (
    <div style={S.wrap}>
      <div style={S.card}>
        <div style={S.checkpoint}>{checkpoint}</div>
        <h1 style={S.title}>{title}</h1>
        <p style={S.subtitle}>{subtitle}</p>
      </div>
    </div>
  );
}

const S = {
  wrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    background: "#f8fafc",
  } as React.CSSProperties,
  card: {
    maxWidth: 440,
    width: "100%",
    padding: 28,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
    textAlign: "center" as const,
  },
  checkpoint: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "1.2px",
    textTransform: "uppercase" as const,
    color: "#9ca3af",
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1f3348",
    margin: "0 0 8px",
    letterSpacing: "-0.02em",
  } as React.CSSProperties,
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    margin: 0,
    lineHeight: 1.5,
  } as React.CSSProperties,
};
