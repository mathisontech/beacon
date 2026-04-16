import { destinationPoint, closestPointOnLine } from './geoUtils';

/**
 * Project tornado path forward with timestamps
 * @param {Object} tornado - {position: [lon, lat], direction: degrees, speed: mph}
 * @param {number} lookaheadMinutes - How far into the future to project
 * @param {number} intervalMinutes - Time interval between points
 * @returns {Array} Array of {position: [lon, lat], time: minutes, strength: EF rating}
 */
export function projectTornadoPath(tornado, lookaheadMinutes = 30, intervalMinutes = 5) {
  const { position, direction, speed, efRating = 3 } = tornado;
  const path = [];

  for (let time = 0; time <= lookaheadMinutes; time += intervalMinutes) {
    const distanceMiles = (speed * time) / 60; // Convert time to hours
    const projectedPosition = destinationPoint(position, direction, distanceMiles);

    // Tornado strength might decay over time (simplified model)
    const strengthDecay = Math.max(0, 1 - (time / 60)); // Decays over 60 minutes
    const currentStrength = Math.max(0, Math.round(efRating * strengthDecay));

    path.push({
      position: projectedPosition,
      time, // minutes from now
      strength: currentStrength,
      windSpeed: getWindSpeedForEF(currentStrength)
    });
  }

  return path;
}

/**
 * Get estimated wind speed for EF rating
 */
function getWindSpeedForEF(efRating) {
  const windSpeeds = {
    0: 85,   // 65-85 mph
    1: 110,  // 86-110 mph
    2: 135,  // 111-135 mph
    3: 165,  // 136-165 mph
    4: 200,  // 166-200 mph
    5: 220   // >200 mph
  };
  return windSpeeds[efRating] || 0;
}

/**
 * Calculate time to impact for a location
 * @param {[lon, lat]} location
 * @param {Object} tornado
 * @param {number} lookaheadMinutes
 * @returns {Object} {timeToImpact: minutes, distanceToPath: miles, closestPoint, willImpact: boolean}
 */
export function calculateTimeToImpact(location, tornado, lookaheadMinutes = 30) {
  const { position, direction, speed } = tornado;

  // Project tornado path end point
  const endPoint = destinationPoint(position, direction, (speed * lookaheadMinutes) / 60);

  // Find closest point on tornado path to this location
  const { closestPoint, distanceToLine, distanceAlongLine } = closestPointOnLine(
    location,
    position,
    endPoint
  );

  // Time for tornado to reach closest point
  const timeToClosestPoint = (distanceAlongLine / speed) * 60; // Convert to minutes

  // Determine if location will be impacted
  const willImpact = distanceToLine < 5 && timeToClosestPoint <= lookaheadMinutes;

  return {
    timeToImpact: Math.max(0, timeToClosestPoint),
    distanceToPath: distanceToLine,
    closestPoint,
    willImpact,
    dangerLevel: getDangerLevel(distanceToLine, timeToClosestPoint)
  };
}

/**
 * Determine danger level based on distance and time
 */
function getDangerLevel(distanceToPath, timeToImpact) {
  if (distanceToPath > 5) return 'safe';
  if (distanceToPath > 2 && timeToImpact > 20) return 'monitor';
  if (timeToImpact < 5) return 'critical';
  if (timeToImpact < 10) return 'severe';
  if (timeToImpact < 20) return 'high';
  return 'moderate';
}

/**
 * Generate danger zone polygons around tornado path
 * @param {Array} path - Tornado path from projectTornadoPath
 * @param {number} bufferMiles - Buffer distance
 * @returns {Object} GeoJSON polygon
 */
export function generateDangerZone(path, bufferMiles = 2) {
  // Simplified: create circles around each point and merge
  const circles = path.map(point => {
    return createCircle(point.position, bufferMiles, 16);
  });

  // For now, just return the first circle as a simple example
  // In production, you'd merge these into a corridor
  return circles[0];
}

/**
 * Create a circle polygon
 */
function createCircle(center, radiusMiles, points = 32) {
  const coordinates = [];

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 360;
    const point = destinationPoint(center, angle, radiusMiles);
    coordinates.push(point);
  }

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates]
    }
  };
}

/**
 * Get EF scale information
 */
export const EF_SCALE = {
  0: { windSpeed: '65-85 mph', damage: 'Light damage', color: '#00FF00' },
  1: { windSpeed: '86-110 mph', damage: 'Moderate damage', color: '#FFFF00' },
  2: { windSpeed: '111-135 mph', damage: 'Considerable damage', color: '#FFA500' },
  3: { windSpeed: '136-165 mph', damage: 'Severe damage', color: '#FF0000' },
  4: { windSpeed: '166-200 mph', damage: 'Devastating damage', color: '#FF00FF' },
  5: { windSpeed: '>200 mph', damage: 'Incredible damage', color: '#8B0000' }
};
