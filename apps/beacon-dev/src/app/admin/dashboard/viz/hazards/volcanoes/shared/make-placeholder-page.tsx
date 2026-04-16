import { PlaceholderPanel } from "./placeholder-panel";
import { findVolcanoLeaf, findVolcanoGroup, VOLCANOES_HREF } from "../nav/volcano-nav-tree";

// Builds a route page from a leaf slug. Pulls label/description from volcano-nav-tree.
export function makeVolcanoPlaceholder(slug: string) {
  const leaf = findVolcanoLeaf(slug);
  if (!leaf) throw new Error(`Unknown volcano leaf: ${slug}`);

  // If the slug is nested under a group, surface the parent crumb.
  const parentSlug = slug.includes("/") ? slug.split("/")[0] : undefined;
  const parentGroup = parentSlug ? findVolcanoGroup(parentSlug) : undefined;
  const parent = parentGroup
    ? { label: parentGroup.label, href: `${VOLCANOES_HREF}/${parentGroup.slug}` }
    : undefined;

  return function VolcanoPlaceholderPage() {
    return (
      <PlaceholderPanel
        title={leaf.label}
        parent={parent}
        description={leaf.description}
        bullets={leaf.bullets}
      />
    );
  };
}
