import { serveUpstream } from "@/lib/data-proxy/serve-upstream";

// Cache-proxied country-borders GeoJSON. Browsers + CDN can hold this
// for a day; Beacon refreshes from upstream in the background.
export async function GET(req: Request) {
  return serveUpstream(
    {
      key: "countries.geojson",
      url: "https://cdn.jsdelivr.net/gh/datasets/geo-countries@master/data/countries.geojson",
      contentType: "application/geo+json",
    },
    req
  );
}
