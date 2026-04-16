import { haversineDistance } from './geoUtils';
import { calculateTimeToImpact } from './tornadoProjection';

/**
 * Make evacuation decision for a person
 * @param {Object} person
 * @param {Object} tornado
 * @param {Array} shelters
 * @returns {Object} Decision with action, reason, and details
 */
export function makeEvacuationDecision(person, tornado, shelters) {
  const impact = calculateTimeToImpact(person.location, tornado);

  // Safe - no action needed
  if (impact.dangerLevel === 'safe') {
    return {
      action: 'MONITOR',
      priority: 0,
      reason: `Outside danger zone (${impact.distanceToPath.toFixed(1)} miles from path)`,
      details: {
        timeToImpact: null,
        recommendedShelter: null,
        route: null
      }
    };
  }

  // Too late to evacuate
  if (impact.timeToImpact < 5) {
    return {
      action: 'SHELTER_IN_PLACE',
      priority: 5,
      reason: `Only ${Math.floor(impact.timeToImpact)} minutes until impact - no time to evacuate`,
      details: {
        timeToImpact: impact.timeToImpact,
        recommendation: person.shelterCapability === 'none'
          ? 'Get to lowest floor, interior room, cover head'
          : 'Go to designated shelter area immediately',
        evacuationFeasible: false
      }
    };
  }

  // Not in vehicle or vulnerable location - might shelter in place
  if (!person.vulnerable && person.shelterCapability !== 'none' && impact.timeToImpact < 15) {
    return {
      action: 'SHELTER_IN_PLACE',
      priority: 3,
      reason: `Current location has adequate shelter (${impact.timeToImpact.toFixed(0)} min to impact)`,
      details: {
        timeToImpact: impact.timeToImpact,
        shelterRating: person.shelterCapability,
        evacuationOption: impact.timeToImpact > 10
      }
    };
  }

  // Evaluate evacuation options
  const nearestShelter = findNearestShelter(person.location, shelters);
  const driveTimeShelter = estimateDriveTime(person.location, nearestShelter.position, tornado);
  const safetyMargin = impact.timeToImpact - driveTimeShelter;

  // Can safely evacuate
  if (safetyMargin > 10) {
    return {
      action: 'EVACUATE',
      priority: 2,
      reason: `Evacuate to ${nearestShelter.name} (${driveTimeShelter.toFixed(0)} min drive, ${Math.floor(impact.timeToImpact)} min until impact)`,
      details: {
        timeToImpact: impact.timeToImpact,
        driveTime: driveTimeShelter,
        safetyMargin,
        recommendedShelter: nearestShelter,
        route: null // Will be calculated by routing
      }
    };
  }

  // Narrow window
  if (safetyMargin > 0) {
    return {
      action: 'EVACUATE_URGENTLY',
      priority: 4,
      reason: `URGENT: Leave immediately for ${nearestShelter.name} (${driveTimeShelter.toFixed(0)} min drive)`,
      details: {
        timeToImpact: impact.timeToImpact,
        driveTime: driveTimeShelter,
        safetyMargin,
        recommendedShelter: nearestShelter,
        urgent: true
      }
    };
  }

  // Cannot reach shelter in time
  return {
    action: 'SHELTER_IN_PLACE',
    priority: 5,
    reason: `Cannot reach shelter in time - shelter where you are`,
    details: {
      timeToImpact: impact.timeToImpact,
      driveTime: driveTimeShelter,
      recommendation: 'Get to best available shelter immediately',
      evacuationFeasible: false
    }
  };
}

/**
 * Find nearest shelter to a location
 */
function findNearestShelter(location, shelters) {
  let nearest = null;
  let minDistance = Infinity;

  shelters.forEach(shelter => {
    const distance = haversineDistance(location, shelter.position);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = shelter;
    }
  });

  return nearest;
}

/**
 * Estimate drive time between two points
 * @param {[lon, lat]} start
 * @param {[lon, lat]} end
 * @param {Object} tornado - Used to avoid tornado path
 * @returns {number} Estimated drive time in minutes
 */
function estimateDriveTime(start, end, tornado) {
  const straightLineDistance = haversineDistance(start, end);

  // Apply detour factor (1.3x for roads vs straight line)
  const roadDistance = straightLineDistance * 1.3;

  // Average speed (mph) - reduced in tornado conditions
  const averageSpeed = 35; // mph (accounting for traffic, weather)

  // Convert to minutes
  const driveTime = (roadDistance / averageSpeed) * 60;

  // Add penalty if route crosses tornado path
  const crossesTornadoPath = checkPathCrossing(start, end, tornado);
  if (crossesTornadoPath) {
    return driveTime * 1.5; // 50% longer route to avoid tornado
  }

  return driveTime;
}

/**
 * Check if a route crosses tornado path
 */
function checkPathCrossing(start, end, tornado) {
  // Simplified: check if midpoint is near tornado path
  const midpoint = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2
  ];

  const impact = calculateTimeToImpact(midpoint, tornado, 30);
  return impact.distanceToPath < 3; // Within 3 miles
}

/**
 * Batch process decisions for all people
 */
export function processAllDecisions(people, tornado, shelters) {
  return people.map(person => {
    const decision = makeEvacuationDecision(person, tornado, shelters);
    return {
      ...person,
      decision
    };
  });
}

/**
 * Get summary statistics
 */
export function getDecisionSummary(peopleWithDecisions) {
  const summary = {
    total: peopleWithDecisions.length,
    monitor: 0,
    shelterInPlace: 0,
    evacuate: 0,
    evacuateUrgently: 0,
    vulnerable: 0
  };

  peopleWithDecisions.forEach(person => {
    const action = person.decision.action;
    if (action === 'MONITOR') summary.monitor++;
    else if (action === 'SHELTER_IN_PLACE') summary.shelterInPlace++;
    else if (action === 'EVACUATE') summary.evacuate++;
    else if (action === 'EVACUATE_URGENTLY') summary.evacuateUrgently++;

    if (person.vulnerable) summary.vulnerable++;
  });

  return summary;
}
