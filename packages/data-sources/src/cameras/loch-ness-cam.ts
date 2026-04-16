// Loch Ness live webcam — single static pin over the loch.
// Public stream page, no polling API; fetch() returns a fixed event.

import type { Feed, FeedEvent } from "../types";

const FEED_ID = "loch-ness-cam";
const STREAM_URL = "https://www.visitinvernesslochness.com/live-stream";

const LOCH_NESS_CAM: FeedEvent = {
  id: `${FEED_ID}:urquhart-bay`,
  feedId: FEED_ID,
  category: "cameras",
  lat: 57.3243,
  lng: -4.4423,
  title: "Loch Ness Live Cam",
  severity: "info",
  timestamp: new Date(0).toISOString(),
  url: STREAM_URL,
  meta: {
    location: "Urquhart Bay, Loch Ness, Scotland",
    streamUrl: STREAM_URL,
  },
};

export const lochNessCam: Feed = {
  id: FEED_ID,
  name: "Loch Ness Live Cam",
  category: "cameras",
  pollIntervalMs: 24 * 60 * 60_000,
  fetch: async () => [LOCH_NESS_CAM],
};
