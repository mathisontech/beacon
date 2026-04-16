import { serveUpstream } from "@/lib/data-proxy/serve-upstream";

export async function GET(req: Request) {
  return serveUpstream(
    {
      key: "us-states.geojson",
      url: "https://cdn.jsdelivr.net/gh/PublicaMundi/MappingAPI@master/data/geojson/us-states.json",
      contentType: "application/geo+json",
    },
    req
  );
}
