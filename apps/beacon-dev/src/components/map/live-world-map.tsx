"use client";

import { useState, useEffect, useCallback } from "react";
import type { MapView, LayerConfig } from "@/types/map";
import type { ActiveFire } from "@/types/fire";
import ViewSwitcher from "./view-switcher";
import NWSAlertLayer from "./nws-alert-layer";
import FireLayer from "./fire-layer";
import FireSelector from "./fire-selector";
import FireTimeline from "./fire-timeline";
import type { FireProjection } from "./fire-timeline";
import FireDetail from "./fire-detail";
import PublicSidebar from "./public-sidebar";
import PublicTabBar from "./public-tab-bar";
import CommunityRightSidebar from "./community-right-sidebar";
import CommunityMessages from "./community-messages";
import MapLayersPanel from "./map-layers-panel";
import MapSightingReport from "./map-sighting-report";
import MapTimelinePlayback from "./map-timeline-playback";
import MapViewToggle from "./map-view-toggle";
import MapZoomControls from "./map-zoom-controls";
import DevicePreview, { getDeviceDimensions } from "../ui/device-preview";
import { useNWSAlerts } from "@/hooks/use-nws-alerts";
import { useActiveFires } from "@/hooks/use-active-fires";
import { DEFAULT_LAYERS } from "@/lib/layers";

export default function LiveWorldMap() {
  const [activeView, setActiveView] = useState<MapView>("photo");
  const [layers, setLayers] = useState<LayerConfig[]>(DEFAULT_LAYERS);
  const [viewer, setViewer] = useState<unknown>(null);
  const [deviceName, setDeviceName] = useState("Desktop");
  const [activeTab, setActiveTab] = useState("map");
  const [communityPage, setCommunityPage] = useState("messages");
  const [layersPanelOpen, setLayersPanelOpen] = useState(false);
  const [selectedFire, setSelectedFire] = useState<ActiveFire | null>(null);
  const [timelineGeom, setTimelineGeom] = useState<GeoJSON.Geometry | null>(null);
  const [projection, setProjection] = useState<FireProjection | null>(null);
  const [projLoading, setProjLoading] = useState(false);

  const { alerts, loading, lastFetched } = useNWSAlerts(60000);
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

  useEffect(() => {
    const newStatus = loading
      ? "loading"
      : alerts.length > 0
        ? "fresh"
        : "stale";
    setLayers((prev) =>
      prev.map((l) =>
        l.id === "nws-alerts"
          ? { ...l, status: newStatus, lastUpdated: lastFetched?.toISOString() || null }
          : l
      )
    );
  }, [loading, alerts.length, lastFetched]);

  const nws = layers.find((l) => l.id === "nws-alerts");
  const deviceDims = getDeviceDimensions(deviceName);
  const isDesktop = deviceName === "Desktop";

  const mapContent = (
    <>
      <ViewSwitcher
        activeView={activeView}
        onMapClick={() => {}}
        onViewerReady={setViewer}
      />
      {activeView !== "lowdata" && nws && (
        <NWSAlertLayer
          viewer={viewer}
          alerts={alerts}
          opacity={nws.opacity}
          enabled={nws.enabled}
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
    </>
  );

  const isCommunity = activeTab === "community";

  const centerContent = isCommunity ? (
    <div style={{ flex: 1, background: "#f8f9fa", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <CommunityMessages />
    </div>
  ) : (
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      {mapContent}
      <FireSelector
        fires={fires}
        loading={firesLoading}
        lastFetched={firesLastFetched}
        onSelect={handleFireSelect}
        onRefresh={refreshFires}
      />
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
      <MapLayersPanel open={layersPanelOpen} onToggle={() => setLayersPanelOpen((p) => !p)} onFlyTo={handleFlyTo} />
      <MapSightingReport />
      <MapTimelinePlayback />
      <MapViewToggle active={activeView} onChange={setActiveView} />
      <MapZoomControls viewer={viewer} />
    </div>
  );

  const appFrame = (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <PublicSidebar />
        {centerContent}
        {isCommunity && (
          <CommunityRightSidebar activePage={communityPage} onPageChange={setCommunityPage} />
        )}
      </div>
      <PublicTabBar active={activeTab} onChange={setActiveTab} />
    </div>
  );

  return (
    <>
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
    </>
  );
}
