'use client';

// SF downtown at z16 — shows individual buildings and streets
const z = 16, x = 10482, y = 25332;

const styles = [
  { name: 'OpenStreetMap', sub: 'Standard road map', url: `https://tile.openstreetmap.org/${z}/${x}/${y}.png` },
  { name: 'OpenTopoMap', sub: 'Contour lines + roads', url: `https://tile.opentopomap.org/${z}/${x}/${y}.png` },
  { name: 'ESRI Satellite', sub: 'High-res imagery', url: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}` },
  { name: 'ESRI Topo', sub: 'Topographic + labels', url: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}` },
  { name: 'ESRI Street', sub: 'Detailed streets', url: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}` },
  { name: 'ESRI Light Gray', sub: 'Minimal light', url: `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/${z}/${y}/${x}` },
  { name: 'ESRI Dark Gray', sub: 'Minimal dark', url: `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/${z}/${y}/${x}` },
  { name: 'ESRI NatGeo', sub: 'National Geographic', url: `https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/${z}/${y}/${x}` },
  { name: 'ESRI Terrain', sub: 'Shaded relief', url: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/${z}/${y}/${x}` },
  { name: 'ESRI Ocean', sub: 'Bathymetry + ocean', url: `https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/${z}/${y}/${x}` },
  { name: 'CartoDB Positron', sub: 'Clean light', url: `https://basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png` },
  { name: 'CartoDB Dark Matter', sub: 'Clean dark', url: `https://basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png` },
  { name: 'CartoDB Voyager', sub: 'Colorful, readable', url: `https://basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png` },
  { name: 'CartoDB Positron No Labels', sub: 'Light, no text', url: `https://basemaps.cartocdn.com/light_nolabels/${z}/${x}/${y}.png` },
  { name: 'CartoDB Dark No Labels', sub: 'Dark, no text', url: `https://basemaps.cartocdn.com/dark_nolabels/${z}/${x}/${y}.png` },
  { name: 'OSM Humanitarian', sub: 'Infrastructure focus', url: `https://tile-a.openstreetmap.fr/hot/${z}/${x}/${y}.png` },
];

export default function TileStylesPage() {
  return (
    <div style={{ padding: 24, background: '#111', minHeight: '100vh', overflowY: 'auto', maxHeight: '100vh' }}>
      <h1 style={{ fontSize: 16, color: '#fff', marginBottom: 16 }}>2D Tile Styles — SF Downtown z16 (building level)</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {styles.map((s) => (
          <div key={s.name} style={{ borderRadius: 6, overflow: 'hidden', background: '#1a1a2e', border: '1px solid #2a2a4a' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.url}
              alt={s.name}
              style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block', background: '#222' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div style={{ padding: '8px 10px', fontSize: 13, fontWeight: 600, color: '#e0e0e0' }}>{s.name}</div>
            <div style={{ padding: '0 10px 8px', fontSize: 11, color: '#888' }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
