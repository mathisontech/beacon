import { serveUpstream } from "@/lib/data-proxy/serve-upstream";

// USGS Quaternary fault lines. Upstream is a live ArcGIS endpoint; we
// serve a cached snapshot and refresh daily in the background. This
// insulates the map from USGS outages and from the slow full-extent
// query on every page load.
export async function GET(req: Request) {
  return serveUpstream(
    {
      key: "usgs-faults.geojson",
      url:
        "https://earthquake.usgs.gov/arcgis/rest/services/haz/qfaults/MapServer/0/query" +
        "?where=1%3D1&outFields=*&returnGeometry=true&f=geojson&outSR=4326",
      contentType: "application/geo+json",
      // Fault database changes rarely; refresh weekly.
      staleAfterMs: 1000 * 60 * 60 * 24 * 7,
    },
    req
  );
}
