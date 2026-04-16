// Geographic utility functions

/**
 * Calculate distance between two points using Haversine formula
 * @param {[lon, lat]} point1
 * @param {[lon, lat]} point2
 * @returns {number} Distance in miles
 */
export function haversineDistance(point1, point2) {
  const R = 3959; // Earth's radius in miles
  const [lon1, lat1] = point1;
  const [lon2, lat2] = point2;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians) {
  return radians * 180 / Math.PI;
}

/**
 * Calculate a point at a given distance and bearing from a starting point
 * @param {[lon, lat]} start
 * @param {number} bearing - Direction in degrees (0 = North, 90 = East)
 * @param {number} distance - Distance in miles
 * @returns {[lon, lat]} New point coordinates
 */
export function destinationPoint(start, bearing, distance) {
  const R = 3959; // Earth's radius in miles
  const [lon1, lat1] = start;

  const δ = distance / R; // Angular distance
  const θ = toRadians(bearing);

  const φ1 = toRadians(lat1);
  const λ1 = toRadians(lon1);

  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) +
    Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
  );

  const λ2 = λ1 + Math.atan2(
    Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
    Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
  );

  return [toDegrees(λ2), toDegrees(φ2)];
}

/**
 * Find the closest point on a line segment to a given point
 * @param {[lon, lat]} point
 * @param {[lon, lat]} lineStart
 * @param {[lon, lat]} lineEnd
 * @returns {{closestPoint: [lon, lat], distanceToLine: number, distanceAlongLine: number}}
 */
export function closestPointOnLine(point, lineStart, lineEnd) {
  const [px, py] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    // Line is a point
    return {
      closestPoint: lineStart,
      distanceToLine: haversineDistance(point, lineStart),
      distanceAlongLine: 0
    };
  }

  // Calculate parameter t that minimizes distance to line
  const t = Math.max(0, Math.min(1,
    ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)
  ));

  const closestPoint = [
    x1 + t * dx,
    y1 + t * dy
  ];

  return {
    closestPoint,
    distanceToLine: haversineDistance(point, closestPoint),
    distanceAlongLine: haversineDistance(lineStart, closestPoint)
  };
}

/**
 * Generate a random point within a given radius of a center point
 * @param {[lon, lat]} center
 * @param {number} radiusMiles
 * @returns {[lon, lat]}
 */
export function randomPointInRadius(center, radiusMiles) {
  const angle = Math.random() * 360;
  const distance = Math.random() * radiusMiles;
  return destinationPoint(center, angle, distance);
}
