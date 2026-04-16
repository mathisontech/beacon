/**
 * Proximity Detection Module
 *
 * Provides utilities for detecting if a user's trajectory intersects with
 * active alert zones. Uses simple geometric calculations to project user
 * position forward in time and check for hazard intersections.
 */

// Earth's radius in meters (WGS84 mean radius)
const EARTH_RADIUS_METERS = 6371008.8;

/**
 * Converts degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Converts radians to degrees
 */
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calculates the haversine distance between two points in meters
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Projects a position forward given heading and distance
 *
 * @param lat - Starting latitude in degrees
 * @param lng - Starting longitude in degrees
 * @param heading - Heading in degrees (0 = North, 90 = East)
 * @param distanceMeters - Distance to project in meters
 * @returns Projected position as [lat, lng]
 */
export function projectPosition(
  lat: number,
  lng: number,
  heading: number,
  distanceMeters: number
): { lat: number; lng: number } {
  const lat1 = toRadians(lat);
  const lng1 = toRadians(lng);
  const bearing = toRadians(heading);
  const angularDistance = distanceMeters / EARTH_RADIUS_METERS;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
  );

  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    lat: toDegrees(lat2),
    lng: toDegrees(lng2),
  };
}

/**
 * Projects user position at multiple time intervals
 *
 * @param lat - Current latitude
 * @param lng - Current longitude
 * @param heading - Heading in degrees
 * @param speedMps - Speed in meters per second
 * @param minuteIntervals - Array of time intervals in minutes
 * @returns Array of projected positions with time info
 */
export function projectTrajectory(
  lat: number,
  lng: number,
  heading: number,
  speedMps: number,
  minuteIntervals: number[]
): Array<{
  minutes: number;
  lat: number;
  lng: number;
  distanceMeters: number;
}> {
  return minuteIntervals.map((minutes) => {
    const distanceMeters = speedMps * minutes * 60;
    const position = projectPosition(lat, lng, heading, distanceMeters);
    return {
      minutes,
      ...position,
      distanceMeters,
    };
  });
}

/**
 * Checks if a point is inside a circular alert zone
 */
export function isPointInCircle(
  pointLat: number,
  pointLng: number,
  centerLat: number,
  centerLng: number,
  radiusMiles: number
): boolean {
  const radiusMeters = radiusMiles * 1609.34;
  const distance = haversineDistance(pointLat, pointLng, centerLat, centerLng);
  return distance <= radiusMeters;
}

/**
 * Checks if a point is inside a polygon using ray casting algorithm
 *
 * @param pointLat - Point latitude
 * @param pointLng - Point longitude
 * @param polygon - Array of [lng, lat] coordinates (GeoJSON format)
 */
export function isPointInPolygon(
  pointLat: number,
  pointLng: number,
  polygon: Array<[number, number]>
): boolean {
  let inside = false;
  const x = pointLng;
  const y = pointLat;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Checks if a line segment intersects with a circular alert zone
 *
 * @param startLat - Start point latitude
 * @param startLng - Start point longitude
 * @param endLat - End point latitude
 * @param endLng - End point longitude
 * @param centerLat - Circle center latitude
 * @param centerLng - Circle center longitude
 * @param radiusMiles - Circle radius in miles
 */
export function doesPathIntersectCircle(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  centerLat: number,
  centerLng: number,
  radiusMiles: number
): boolean {
  // Check if either endpoint is inside the circle
  if (isPointInCircle(startLat, startLng, centerLat, centerLng, radiusMiles)) {
    return true;
  }
  if (isPointInCircle(endLat, endLng, centerLat, centerLng, radiusMiles)) {
    return true;
  }

  // Check intermediate points along the path
  const numChecks = 10;
  for (let i = 1; i < numChecks; i++) {
    const t = i / numChecks;
    const checkLat = startLat + t * (endLat - startLat);
    const checkLng = startLng + t * (endLng - startLng);

    if (isPointInCircle(checkLat, checkLng, centerLat, centerLng, radiusMiles)) {
      return true;
    }
  }

  return false;
}

/**
 * Represents an alert zone for proximity checking
 */
export interface AlertZone {
  id: string;
  title: string;
  severity: string;
  alertType: string;

  // Circle-based zone
  centerLat?: number;
  centerLng?: number;
  radiusMiles?: number;

  // Polygon-based zone (GeoJSON Polygon coordinates)
  polygon?: Array<Array<[number, number]>>;

  // Zip codes
  zipCodes?: string[];
}

/**
 * Result of a proximity check for a single alert
 */
export interface ProximityResult {
  alertId: string;
  alertTitle: string;
  severity: string;
  alertType: string;
  willIntersect: boolean;
  estimatedMinutesToIntersection: number | null;
  estimatedDistanceMeters: number | null;
  intersectionPoint: { lat: number; lng: number } | null;
}

/**
 * Checks if a user's trajectory will intersect with alert zones
 *
 * @param lat - Current latitude
 * @param lng - Current longitude
 * @param heading - Heading in degrees
 * @param speedMps - Speed in meters per second
 * @param projectionMinutes - Array of time intervals to check
 * @param alertZones - Array of alert zones to check against
 * @returns Array of proximity results
 */
export function checkTrajectoryIntersections(
  lat: number,
  lng: number,
  heading: number,
  speedMps: number,
  projectionMinutes: number[],
  alertZones: AlertZone[]
): ProximityResult[] {
  // Get sorted minute intervals for ordered checking
  const sortedMinutes = [...projectionMinutes].sort((a, b) => a - b);

  // Project trajectory points
  const projectedPoints = projectTrajectory(lat, lng, heading, speedMps, sortedMinutes);

  const results: ProximityResult[] = [];

  for (const zone of alertZones) {
    let willIntersect = false;
    let estimatedMinutes: number | null = null;
    let estimatedDistance: number | null = null;
    let intersectionPoint: { lat: number; lng: number } | null = null;

    // Check if currently inside the zone
    let isCurrentlyInside = false;

    // Check circle-based zones
    if (
      zone.centerLat !== undefined &&
      zone.centerLng !== undefined &&
      zone.radiusMiles !== undefined
    ) {
      isCurrentlyInside = isPointInCircle(
        lat,
        lng,
        zone.centerLat,
        zone.centerLng,
        zone.radiusMiles
      );

      if (isCurrentlyInside) {
        willIntersect = true;
        estimatedMinutes = 0;
        estimatedDistance = 0;
        intersectionPoint = { lat, lng };
      } else {
        // Check each projected point
        let prevLat = lat;
        let prevLng = lng;

        for (const point of projectedPoints) {
          if (
            doesPathIntersectCircle(
              prevLat,
              prevLng,
              point.lat,
              point.lng,
              zone.centerLat,
              zone.centerLng,
              zone.radiusMiles
            )
          ) {
            willIntersect = true;
            estimatedMinutes = point.minutes;
            estimatedDistance = point.distanceMeters;
            intersectionPoint = { lat: point.lat, lng: point.lng };
            break;
          }
          prevLat = point.lat;
          prevLng = point.lng;
        }
      }
    }

    // Check polygon-based zones
    if (!willIntersect && zone.polygon && zone.polygon.length > 0) {
      // GeoJSON Polygon has outer ring as first array
      const outerRing = zone.polygon[0];

      isCurrentlyInside = isPointInPolygon(lat, lng, outerRing);

      if (isCurrentlyInside) {
        willIntersect = true;
        estimatedMinutes = 0;
        estimatedDistance = 0;
        intersectionPoint = { lat, lng };
      } else {
        // Check each projected point
        for (const point of projectedPoints) {
          if (isPointInPolygon(point.lat, point.lng, outerRing)) {
            willIntersect = true;
            estimatedMinutes = point.minutes;
            estimatedDistance = point.distanceMeters;
            intersectionPoint = { lat: point.lat, lng: point.lng };
            break;
          }
        }
      }
    }

    results.push({
      alertId: zone.id,
      alertTitle: zone.title,
      severity: zone.severity,
      alertType: zone.alertType,
      willIntersect,
      estimatedMinutesToIntersection: estimatedMinutes,
      estimatedDistanceMeters: estimatedDistance,
      intersectionPoint,
    });
  }

  // Sort results: intersecting alerts first, then by estimated time
  return results.sort((a, b) => {
    if (a.willIntersect && !b.willIntersect) return -1;
    if (!a.willIntersect && b.willIntersect) return 1;
    if (a.willIntersect && b.willIntersect) {
      return (a.estimatedMinutesToIntersection ?? 0) - (b.estimatedMinutesToIntersection ?? 0);
    }
    return 0;
  });
}

/**
 * Filters alerts to only return those that will be intersected
 */
export function getIntersectingAlerts(results: ProximityResult[]): ProximityResult[] {
  return results.filter((r) => r.willIntersect);
}

/**
 * Maps severity to a numeric priority (higher = more severe)
 */
export function severityToPriority(severity: string): number {
  const priorities: Record<string, number> = {
    MINOR: 1,
    MODERATE: 2,
    SEVERE: 3,
    EXTREME: 4,
    CATASTROPHIC: 5,
  };
  return priorities[severity] ?? 0;
}

/**
 * Filters results by minimum severity level
 */
export function filterBySeverity(
  results: ProximityResult[],
  minSeverity: string
): ProximityResult[] {
  const minPriority = severityToPriority(minSeverity);
  return results.filter((r) => severityToPriority(r.severity) >= minPriority);
}
