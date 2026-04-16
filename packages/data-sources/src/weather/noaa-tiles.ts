// NOAA tile/imagery services — public domain (17 U.S.C. §105).
// Courtesy attribution: "Imagery: NOAA NESDIS".
//
// We expose simple URL builders rather than full fetchers because Cesium's
// imagery providers consume templated URLs directly (WebMapServiceImageryProvider,
// UrlTemplateImageryProvider, etc). Callers pass these into Cesium.

export interface WmsServiceSpec {
  /** GetMap WMS endpoint */
  url: string;
  /** Comma-separated layer IDs */
  layers: string;
  /** Short human label for attribution */
  credit: string;
}

/**
 * GOES East GeoColor cloud cover — NOAA NESDIS IDP GIS.
 * Layer 1 = GeoColor full-disk composite, updated ~every 10 min.
 */
export const GOES_CLOUD_COVER: WmsServiceSpec = {
  url: "https://idpgis.ncep.noaa.gov/arcgis/services/NOAA/GOES_EastConusDayCloudPhase/MapServer/WmsServer",
  layers: "0",
  credit: "NOAA NESDIS / GOES East",
};

/**
 * NWS base reflectivity radar mosaic — CONUS.
 * NOAA NWS MapServices WMS (public, commercial-safe).
 */
export const MRMS_RADAR: WmsServiceSpec = {
  url: "https://mapservices.weather.noaa.gov/eventdriven/services/radar/radar_base_reflectivity/MapServer/WmsServer",
  layers: "1",
  credit: "NOAA NWS Radar",
};

/**
 * National Weather Service active watches / warnings / advisories WMS.
 */
export const NWS_ALERTS_WMS: WmsServiceSpec = {
  url: "https://mapservices.weather.noaa.gov/eventdriven/services/WWA/watch_warn_adv/MapServer/WmsServer",
  layers: "1",
  credit: "NOAA NWS",
};

/**
 * Build the standard EPSG:4326 WMS GetMap request parameters that Cesium
 * WebMapServiceImageryProvider uses. The provider fills in BBOX/WIDTH/HEIGHT
 * automatically, so we only return the static parameters here.
 */
export function wmsParameters(): Record<string, string> {
  return {
    service: "WMS",
    version: "1.3.0",
    request: "GetMap",
    format: "image/png",
    transparent: "true",
  };
}
