import Link from "next/link";
import "./data-manager.css";

export const metadata = {
  title: "Volcano Data Manager — Beacon Dev",
};

export default function DataManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="vdm-root">
      <header className="vdm-header">
        <div className="vdm-crumbs">
          <Link href="/admin/dashboard/viz/hazards/volcanoes" className="vdm-back">
            Volcanoes
          </Link>
          <span className="vdm-sep">/</span>
          <span className="vdm-title">Volcano Data Manager</span>
        </div>
        <div className="vdm-subtitle">
          Internal view. Raw feeds, coverage geometry, and per-volcano processing pipelines.
        </div>
      </header>
      <main className="vdm-body">{children}</main>
    </div>
  );
}
