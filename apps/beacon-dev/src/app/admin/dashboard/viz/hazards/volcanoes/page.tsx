import { VolcanoPlayground } from "./volcano-playground";

export const metadata = {
  title: "Volcanoes — Beacon Dev",
};

export default function VolcanoesPage() {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <VolcanoPlayground />
    </div>
  );
}
