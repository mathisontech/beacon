import type { TabId } from "../shell/tab-id";
import { MapTab } from "./map-tab";
import { FeedTab } from "./feed-tab";
import { HelpTab } from "./help-tab";
import { CommunityTab } from "./community-tab";

export function TabBody({ active }: { active: TabId }) {
  switch (active) {
    case "map": return <MapTab />;
    case "feed": return <FeedTab />;
    case "help": return <HelpTab />;
    case "community": return <CommunityTab />;
  }
}
