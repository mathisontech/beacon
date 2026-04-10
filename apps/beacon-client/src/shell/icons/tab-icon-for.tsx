import type { TabId } from "../tab-id";
import { MapIcon } from "./map-icon";
import { FeedIcon } from "./feed-icon";
import { HelpIcon } from "./help-icon";
import { CommunityIcon } from "./community-icon";

export function TabIconFor({ id, color, size }: { id: TabId; color: string; size?: number }) {
  switch (id) {
    case "map": return <MapIcon color={color} size={size} />;
    case "feed": return <FeedIcon color={color} size={size} />;
    case "help": return <HelpIcon color={color} size={size} />;
    case "community": return <CommunityIcon color={color} size={size} />;
  }
}
