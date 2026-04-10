export function HelpIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 16v-5a2 2 0 0 0-4 0" />
      <path d="M14 11V6a2 2 0 0 0-4 0v6" />
      <path d="M10 10V5a2 2 0 0 0-4 0v9" />
      <path d="M6 14V9a2 2 0 0 0-4 0v7a8 8 0 0 0 16 0v-3a2 2 0 0 0-4 0" />
    </svg>
  );
}
