// Single source of truth for the 4 tabs. Order here = order in the tab bar.
import type { TabId } from "./tab-id";

export const TAB_DEFINITIONS: { id: TabId; label: string }[] = [
  { id: "map", label: "Map" },
  { id: "feed", label: "Feed" },
  { id: "help", label: "Help" },
  { id: "community", label: "Community" },
];
