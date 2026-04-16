'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  VOLCANOES_HREF,
  volcanoNodes,
  UI_MANAGER_LABEL,
  type VolcanoNode,
} from './volcano-nav-tree';
import './volcano-nav.css';

type Props = { pathname: string | null };

// Renders the Volcanoes subtree inside the dashboard sidebar.
// Self-contained: owns expansion state, auto-opens based on pathname.
// Every row uses .vnav-row so font/size stay identical across levels.
export function VolcanoNav({ pathname }: Props) {
  const [rootOpen, setRootOpen] = useState(false);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!pathname) return;
    if (!pathname.startsWith(VOLCANOES_HREF)) return;
    setRootOpen(true);
    // Auto-open every ancestor slug on the current path.
    const rest = pathname.slice(VOLCANOES_HREF.length).replace(/^\//, '');
    if (!rest) return;
    const parts = rest.split('/');
    const toOpen: Record<string, boolean> = {};
    for (let i = 1; i <= parts.length; i++) {
      toOpen[parts.slice(0, i).join('/')] = true;
    }
    setOpenMap((p) => ({ ...p, ...toOpen }));
  }, [pathname]);

  const toggle = (slug: string) =>
    setOpenMap((p) => ({ ...p, [slug]: !p[slug] }));

  // Root row highlights only when a sub-route is active, not on UI Manager itself.
  const rootActive = !!pathname?.startsWith(`${VOLCANOES_HREF}/`);
  const uiManagerActive = pathname === VOLCANOES_HREF;

  return (
    <div className="nav-group">
      <button
        className={`vnav-row vnav-root ${rootActive ? 'active' : ''}`}
        onClick={() => setRootOpen((p) => !p)}
      >
        {rootOpen ? <ChevronDown className="vnav-chevron" /> : <ChevronRight className="vnav-chevron" />}
        <span className="vnav-label">Volcanoes</span>
      </button>
      {rootOpen && (
        <div>
          <Link
            href={VOLCANOES_HREF}
            className={`vnav-row vnav-level-1 ${uiManagerActive ? 'active' : ''}`}
          >
            <span className="vnav-label">{UI_MANAGER_LABEL}</span>
          </Link>

          {volcanoNodes.map((node) => (
            <VolcanoNavNodeRow
              key={node.slug}
              node={node}
              depth={1}
              pathname={pathname}
              openMap={openMap}
              toggle={toggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function VolcanoNavNodeRow({
  node,
  depth,
  pathname,
  openMap,
  toggle,
}: {
  node: VolcanoNode;
  depth: number;
  pathname: string | null;
  openMap: Record<string, boolean>;
  toggle: (slug: string) => void;
}) {
  const nodeHref = `${VOLCANOES_HREF}/${node.slug}`;
  const levelClass = `vnav-level-${depth}`;
  const isOpen = !!openMap[node.slug];

  if (node.kind === 'leaf') {
    const active =
      pathname === nodeHref || pathname?.startsWith(`${nodeHref}/`) || false;
    const hasChildren = !!node.children?.length;

    if (!hasChildren) {
      return (
        <Link
          href={nodeHref}
          className={`vnav-row ${levelClass} ${active ? 'active' : ''}`}
        >
          <span className="vnav-label">{node.label}</span>
        </Link>
      );
    }

    return (
      <>
        <div className={`vnav-row ${levelClass} vnav-row-split ${active ? 'active' : ''}`}>
          <button
            type="button"
            className="vnav-expand"
            onClick={() => toggle(node.slug)}
            aria-label={isOpen ? 'Collapse' : 'Expand'}
          >
            {isOpen ? <ChevronDown className="vnav-chevron" /> : <ChevronRight className="vnav-chevron" />}
          </button>
          <Link href={nodeHref} className="vnav-label-link">
            <span className="vnav-label">{node.label}</span>
          </Link>
        </div>
        {isOpen &&
          node.children!.map((child) => (
            <VolcanoNavNodeRow
              key={child.slug}
              node={child}
              depth={depth + 1}
              pathname={pathname}
              openMap={openMap}
              toggle={toggle}
            />
          ))}
      </>
    );
  }

  // group
  const groupActive =
    pathname?.startsWith(`${nodeHref}/`) || pathname === nodeHref || false;
  return (
    <>
      <button
        className={`vnav-row ${levelClass} vnav-group-parent ${groupActive ? 'has-active' : ''}`}
        onClick={() => toggle(node.slug)}
      >
        {isOpen ? <ChevronDown className="vnav-chevron" /> : <ChevronRight className="vnav-chevron" />}
        <span className="vnav-label">{node.label}</span>
      </button>
      {isOpen &&
        node.children.map((child) => (
          <VolcanoNavNodeRow
            key={child.slug}
            node={child}
            depth={depth + 1}
            pathname={pathname}
            openMap={openMap}
            toggle={toggle}
          />
        ))}
    </>
  );
}
