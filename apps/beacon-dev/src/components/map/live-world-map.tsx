"use client";

import { useState, useEffect, useCallback } from "react";
import type { MapView } from "@/types/map";
import type { ActiveFire } from "@/types/fire";
import ViewSwitcher from "./view-switcher";
import NWSAlertLayer from "./nws-alert-layer";
import FireLayer from "./fire-layer";
import VolcanoLayer from "./volcano-layer";
import CountryBordersLayer from "./country-borders-layer";
import StatesLayer from "./states-layer";
import FaultLinesLayer from "./fault-lines-layer";
import FeedEventsLayer from "./feed-events-layer";
import FireTimeline from "./fire-timeline";
import type { FireProjection } from "./fire-timeline";
import FireDetail from "./fire-detail";
import PublicSidebar from "./public-sidebar";
import SavedLocationRow from "./saved-location-row";
import PublicTabBar from "./public-tab-bar";
import CommunityRightSidebar from "./community-right-sidebar";
import CommunityMessages from "./community-messages";
import FullLayersPanel from "./full-layers-panel";
import {
  WeatherProvider,
  WeatherOverlays,
  WeatherTimeScrubber,
  WeatherAttribution,
  ActiveStormsPanel,
  useWeather,
} from "./weather";
import { DeckOverlay } from "./deck";
import { buildWeatherLayers } from "./weather/weather-deck-layers";
import MapSightingReport from "./map-sighting-report";
import MapTimelinePlayback from "./map-timeline-playback";
import MapViewToggle from "./map-view-toggle";
import MapZoomControls from "./map-zoom-controls";
import DevicePreview, { getDeviceDimensions } from "../ui/device-preview";
import { useNWSAlerts } from "@/hooks/use-nws-alerts";
import { useActiveFires } from "@/hooks/use-active-fires";
import { useFeedEvents } from "@/hooks/use-feed-events";
import { useUserLocation } from "@/hooks/use-user-location";
import { useSavedLocations } from "@/hooks/use-saved-locations";
import { LAYER_REGISTRY } from "@/lib/layers";
import { ALL_FEEDS } from "@beacon/data-sources";

/**
 * Renders the unified deck.gl weather layers via DeckOverlay. Lives inside
 * WeatherProvider so it can read the current storms list. Picks Cesium or
 * MapLibre target based on which prop is set; identical layer code drives both.
 */
function WeatherDeckLayers({ viewer, map }: { viewer?: unknown; map?: unknown }) {
  const w = useWeather();
  const layers = buildWeatherLayers({ storms: w.storms });
  return <DeckOverlay viewer={viewer} map={map} layers={layers} />;
}

function collectDefaultEnabled(): Set<string> {
  const ids = new Set<string>();
  for (const cat of [LAYER_REGISTRY.baseMap, LAYER_REGISTRY.weather, LAYER_REGISTRY.reference, LAYER_REGISTRY.live, LAYER_REGISTRY.fun]) {
    for (const l of cat.layers) if (l.enabled) ids.add(l.id);
  }
  return ids;
}

export default function LiveWorldMap() {
  const [activeView, setActiveView] = useState<MapView>("photo");
  const [viewer, setViewer] = useState<unknown>(null);
  const [maplibreMap, setMaplibreMap] = useState<unknown>(null);
  const [deviceName, setDeviceName] = useState("iPhone 15 Pro");
  const [activeTab, setActiveTab] = useState("feed");
  const [communityPage, setCommunityPage] = useState("messages");
  const [fullLayersPanelOpen, setFullLayersPanelOpen] = useState(false);
  const [enabledLayers, setEnabledLayers] = useState<Set<string>>(collectDefaultEnabled);
  const [enabledHazardSublayers, setEnabledHazardSublayers] = useState<Set<string>>(new Set());
  const [selectedFire, setSelectedFire] = useState<ActiveFire | null>(null);
  const [timelineGeom, setTimelineGeom] = useState<GeoJSON.Geometry | null>(null);
  const [projection, setProjection] = useState<FireProjection | null>(null);
  const [projLoading, setProjLoading] = useState(false);
  const [liveFeedsEnabled, setLiveFeedsEnabled] = useState(true);
  const [feedsEnabled, setFeedsEnabled] = useState<Record<string, boolean>>(
    () => Object.fromEntries(ALL_FEEDS.map((f) => [f.id, true]))
  );
  const [activeHazards, setActiveHazards] = useState<Set<string>>(new Set());

  const toggleHazard = useCallback((id: string) => {
    setActiveHazards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleLayer = useCallback((id: string) => {
    setEnabledLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleHazardSublayer = useCallback((_hazardId: string, sublayerId: string) => {
    setEnabledHazardSublayers((prev) => {
      const next = new Set(prev);
      if (next.has(sublayerId)) next.delete(sublayerId);
      else next.add(sublayerId);
      return next;
    });
  }, []);

  const { events: feedEvents } = useFeedEvents(60000);
  const toggleFeed = useCallback((id: string) => {
    if (id === "live-feeds") {
      setLiveFeedsEnabled((v) => !v);
      return;
    }
    setFeedsEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const userLocation = useUserLocation();
  const savedLocs = useSavedLocations();

  // Fly to user location once geolocation resolves and viewer is ready
  useEffect(() => {
    if (userLocation.loading || !viewer || !userLocation.name) return;
    (async () => {
      const { flyTo } = await import("@/lib/cesium-init");
      flyTo(viewer, userLocation.lat, userLocation.lng, null, 150000);
    })();
  }, [userLocation.loading, userLocation.name, viewer]);

  const handleSavedSelect = useCallback(
    async (id: string) => {
      const loc = savedLocs.locations.find((l) => l.id === id);
      if (!loc || !viewer) return;
      savedLocs.select(id);
      const { flyTo } = await import("@/lib/cesium-init");
      const altitude = Math.max(500, 40000000 / Math.pow(2, loc.zoom));
      flyTo(viewer, loc.lat, loc.lng, null, altitude);
    },
    [viewer, savedLocs]
  );

  const handleGlobalView = useCallback(async () => {
    savedLocs.select("");
    if (!viewer) return;
    const { flyTo } = await import("@/lib/cesium-init");
    flyTo(viewer, 39.8, -98.5, null, 15000000);
  }, [viewer, savedLocs]);

  const { alerts } = useNWSAlerts(60000);
  const {
    fires,
    loading: firesLoading,
    lastFetched: firesLastFetched,
    refresh: refreshFires,
  } = useActiveFires(300000);

  const handleFlyTo = useCallback(async (lat: number, lng: number, zoom: number) => {
    if (!viewer) return;
    const { flyTo } = await import("@/lib/cesium-init");
    const altitude = Math.max(500, 40000000 / Math.pow(2, zoom));
    flyTo(viewer, lat, lng, null, altitude);
  }, [viewer]);

  const handleFireSelect = useCallback(async (fire: ActiveFire) => {
    if (!viewer) return;
    setSelectedFire(fire);
    const { flyTo } = await import("@/lib/cesium-init");
    const altitude = fire.acres >= 10000 ? 120000 : fire.acres >= 1000 ? 60000 : 25000;
    flyTo(viewer, fire.lat, fire.lng, null, altitude);
  }, [viewer]);

  const handleTimelineClose = useCallback(() => {
    setSelectedFire(null);
    setTimelineGeom(null);
    setProjection(null);
  }, []);

  const handleTimelineGeom = useCallback((geom: GeoJSON.Geometry | null) => {
    setTimelineGeom(geom);
  }, []);

  const handleProjection = useCallback((proj: FireProjection | null, loading: boolean) => {
    setProjection(proj);
    setProjLoading(loading);
  }, []);

  const nwsEnabled = enabledLayers.has("live-nws-alerts");
  const deviceDims = getDeviceDimensions(deviceName);
  const isDesktop = deviceName === "Desktop";

  const mapContent = (
    <>
      <ViewSwitcher
        activeView={activeView}
        onMapClick={() => {}}
        onViewerReady={setViewer}
        onMapReady={setMaplibreMap}
      />
      <WeatherDeckLayers
        viewer={activeView !== "lowdata" ? viewer : undefined}
        map={activeView === "lowdata" ? maplibreMap : undefined}
      />
      {activeView !== "lowdata" && (
        <NWSAlertLayer
          viewer={viewer}
          alerts={alerts}
          opacity={0.7}
          enabled={nwsEnabled}
        />
      )}
      {activeView !== "lowdata" && (
        <FireLayer
          viewer={viewer}
          fires={fires}
          enabled={true}
          timelineGeometry={timelineGeom}
        />
      )}
      {activeView !== "lowdata" && (
        <VolcanoLayer
          viewer={viewer}
          enabled={
            activeHazards.has("volcano") || enabledLayers.has("ref-volcanoes")
          }
        />
      )}
      {activeView !== "lowdata" && (
        <CountryBordersLayer
          viewer={viewer}
          enabled={enabledLayers.has("ref-countries")}
        />
      )}
      {activeView !== "lowdata" && (
        <StatesLayer
          viewer={viewer}
          enabled={enabledLayers.has("ref-states")}
        />
      )}
      {activeView !== "lowdata" && (
        <FaultLinesLayer
          viewer={viewer}
          enabled={enabledLayers.has("ref-fault-lines")}
        />
      )}
      {activeView !== "lowdata" && (
        <FeedEventsLayer
          viewer={viewer}
          events={feedEvents}
          feedsEnabled={feedsEnabled}
          enabled={liveFeedsEnabled}
        />
      )}
      {activeView !== "lowdata" && <WeatherOverlays viewer={viewer} />}
    </>
  );

  const weatherFlyTo = async (lat: number, lng: number) => {
    if (!viewer) return;
    const { flyTo } = await import("@/lib/cesium-init");
    flyTo(viewer, lat, lng, null, 1_500_000);
  };

  const mapTab = (
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      {mapContent}
      {selectedFire && (
        <>
          <FireDetail
            fire={selectedFire}
            projection={projection}
            loading={projLoading}
          />
          <FireTimeline
            fire={selectedFire}
            onGeometryChange={handleTimelineGeom}
            onProjection={handleProjection}
            onClose={handleTimelineClose}
          />
        </>
      )}
      <FullLayersPanel
        open={fullLayersPanelOpen}
        onToggle={() => setFullLayersPanelOpen((p) => !p)}
        onLayerToggle={toggleLayer}
        onHazardToggle={toggleHazard}
        onHazardSublayerToggle={toggleHazardSublayer}
        activeHazards={activeHazards}
        enabledLayers={enabledLayers}
        enabledHazardSublayers={enabledHazardSublayers}
      />
      <MapSightingReport />
      <MapTimelinePlayback />
      <MapViewToggle active={activeView} onChange={setActiveView} />
      <MapZoomControls viewer={viewer} />
      <ActiveStormsPanel onFly={weatherFlyTo} />
      <WeatherTimeScrubber />
      <WeatherAttribution />
    </div>
  );

  const feedTab = (
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      {mapContent}
      {selectedFire && (
        <>
          <FireDetail
            fire={selectedFire}
            projection={projection}
            loading={projLoading}
          />
          <FireTimeline
            fire={selectedFire}
            onGeometryChange={handleTimelineGeom}
            onProjection={handleProjection}
            onClose={handleTimelineClose}
          />
        </>
      )}
      <FullLayersPanel
        open={fullLayersPanelOpen}
        onToggle={() => setFullLayersPanelOpen((p) => !p)}
        onLayerToggle={toggleLayer}
        onHazardToggle={toggleHazard}
        onHazardSublayerToggle={toggleHazardSublayer}
        activeHazards={activeHazards}
        enabledLayers={enabledLayers}
        enabledHazardSublayers={enabledHazardSublayers}
      />
      <MapSightingReport />
      <MapTimelinePlayback />
      <MapViewToggle active={activeView} onChange={setActiveView} />
      <MapZoomControls viewer={viewer} />
      <ActiveStormsPanel onFly={weatherFlyTo} />
      <WeatherTimeScrubber />
      <WeatherAttribution />
    </div>
  );

  let centerContent: React.ReactNode;
  if (activeTab === "community") {
    centerContent = (
      <div style={{ flex: 1, background: "#f8f9fa", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <CommunityMessages />
      </div>
    );
  } else if (activeTab === "feed") {
    centerContent = feedTab;
  } else {
    centerContent = mapTab;
  }

  const appFrame = (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <PublicSidebar
          locationName={userLocation.name}
          savedLocationsSlot={
            <SavedLocationRow
              locations={savedLocs.locations}
              activeId={savedLocs.activeId}
              onSelect={handleSavedSelect}
              onGlobal={handleGlobalView}
              globalActive={!savedLocs.activeId}
              onAdd={savedLocs.add}
              onRemove={savedLocs.remove}
              notifications={{}}
            />
          }
        />
        {centerContent}
        {activeTab === "community" && (
          <CommunityRightSidebar activePage={communityPage} onPageChange={setCommunityPage} />
        )}
      </div>
      <PublicTabBar active={activeTab} onChange={setActiveTab} />
    </div>
  );

  return (
    <WeatherProvider>
      <div className="beacon-toolbar">
        <span className="beacon-toolbar-label">Public</span>
        <DevicePreview selected={deviceName} onSelect={setDeviceName} />
      </div>

      <div style={{
        flex: 1,
        padding: 20,
        background: "#fff",
        overflow: "hidden",
        display: "flex",
        minWidth: 0,
        boxSizing: "border-box",
      }}>
        {isDesktop ? (
          <div style={{
            flex: 1,
            position: "relative",
            borderRadius: 4,
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
              {appFrame}
            </div>
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
          }}>
            <div style={{
              position: "relative",
              overflow: "hidden",
              background: "#000",
              width: deviceDims ? Math.min(deviceDims.w, window.innerWidth - 340) : 393,
              height: deviceDims ? Math.min(deviceDims.h, window.innerHeight - 120) : 852,
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              border: "3px solid #d1d5db",
            }}>
              {appFrame}
            </div>
          </div>
        )}
      </div>
    </WeatherProvider>
  );
}
