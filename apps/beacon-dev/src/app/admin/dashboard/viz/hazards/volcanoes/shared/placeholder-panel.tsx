import Link from "next/link";
import "./placeholder-panel.css";

type Props = {
  title: string;
  parent?: { label: string; href: string };
  description?: string;
  bullets?: string[];
  badge?: string;
};

export function PlaceholderPanel({ title, parent, description, bullets, badge }: Props) {
  return (
    <div className="vp-root">
      <header className="vp-header">
        <div className="vp-crumbs">
          <Link href="/admin/dashboard/viz/hazards/volcanoes" className="vp-back">Volcanoes</Link>
          {parent && (
            <>
              <span className="vp-sep">/</span>
              <Link href={parent.href} className="vp-back">{parent.label}</Link>
            </>
          )}
          <span className="vp-sep">/</span>
          <span className="vp-title">{title}</span>
        </div>
      </header>
      <main className="vp-body">
        <div className="vp-card">
          <h2>{title}</h2>
          {description && <p>{description}</p>}
          {bullets && bullets.length > 0 && (
            <ul>
              {bullets.map((b) => <li key={b}>{b}</li>)}
            </ul>
          )}
          {badge && <span className="vp-badge">{badge}</span>}
        </div>
      </main>
    </div>
  );
}
