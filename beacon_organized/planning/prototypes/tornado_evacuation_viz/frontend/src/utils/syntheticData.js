import { randomPointInRadius, destinationPoint } from './geoUtils';

/**
 * Generate synthetic buildings for a town
 * @param {[lon, lat]} townCenter
 * @param {number} radiusMiles - Town radius
 * @returns {Object} {trailerParks, shelters, commercial, residential}
 */
export function generateSyntheticBuildings(townCenter, radiusMiles = 5) {
  const buildings = {
    trailerParks: [],
    shelters: [],
    commercial: [],
    residential: []
  };

  // Generate 5-8 trailer parks (vulnerable locations)
  const numTrailerParks = 5 + Math.floor(Math.random() * 4);
  for (let i = 0; i < numTrailerParks; i++) {
    const position = randomPointInRadius(townCenter, radiusMiles);
    buildings.trailerParks.push({
      id: `tp-${i}`,
      type: 'trailer_park',
      name: `Mobile Home Park ${i + 1}`,
      position,
      capacity: 50 + Math.floor(Math.random() * 150), // 50-200 residents
      currentOccupancy: 0.7 + Math.random() * 0.3, // 70-100% occupied
      shelterRating: 0, // No tornado protection
      vulnerable: true
    });
  }

  // Generate 3-5 sturdy shelters (hospitals, schools, concrete buildings)
  const shelterTypes = ['Hospital', 'High School', 'Community Center', 'Police Station', 'Fire Station'];
  const numShelters = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < numShelters; i++) {
    const position = randomPointInRadius(townCenter, radiusMiles);
    buildings.shelters.push({
      id: `shelter-${i}`,
      type: 'shelter',
      name: `${shelterTypes[i % shelterTypes.length]} ${i + 1}`,
      position,
      capacity: 200 + Math.floor(Math.random() * 500), // 200-700 people
      shelterRating: 5, // Excellent tornado protection
      hasBasement: Math.random() > 0.5,
      currentOccupancy: 0.1 + Math.random() * 0.2 // Usually 10-30% occupied
    });
  }

  // Generate 10-15 commercial buildings
  const commercialTypes = ['Shopping Mall', 'Grocery Store', 'Gas Station', 'Restaurant', 'Bank'];
  const numCommercial = 10 + Math.floor(Math.random() * 6);
  for (let i = 0; i < numCommercial; i++) {
    const position = randomPointInRadius(townCenter, radiusMiles);
    buildings.commercial.push({
      id: `comm-${i}`,
      type: 'commercial',
      name: `${commercialTypes[i % commercialTypes.length]} ${i + 1}`,
      position,
      capacity: 50 + Math.floor(Math.random() * 200),
      shelterRating: 2 + Math.floor(Math.random() * 2), // 2-3 (moderate)
      currentOccupancy: 0.3 + Math.random() * 0.4
    });
  }

  // Generate 20-30 residential areas (clusters)
  const numResidential = 20 + Math.floor(Math.random() * 11);
  for (let i = 0; i < numResidential; i++) {
    const position = randomPointInRadius(townCenter, radiusMiles);
    buildings.residential.push({
      id: `res-${i}`,
      type: 'residential',
      name: `Neighborhood ${i + 1}`,
      position,
      capacity: 100 + Math.floor(Math.random() * 400),
      shelterRating: 3, // Typical house with interior rooms
      currentOccupancy: 0.8 + Math.random() * 0.2
    });
  }

  return buildings;
}

/**
 * Generate synthetic people (drivers and residents)
 * @param {Object} buildings
 * @param {number} numDrivers - Number of active drivers
 * @returns {Array} Array of person objects
 */
export function generateSyntheticPeople(buildings, numDrivers = 20) {
  const people = [];

  // Generate residents in each building
  let personId = 0;

  // People in trailer parks
  buildings.trailerParks.forEach(park => {
    const occupants = Math.floor(park.capacity * park.currentOccupancy);
    for (let i = 0; i < occupants; i++) {
      people.push({
        id: `person-${personId++}`,
        location: park.position,
        locationId: park.id,
        locationType: 'trailer_park',
        status: 'resident',
        hasVehicle: Math.random() > 0.3, // 70% have vehicles
        shelterCapability: 'none',
        vulnerable: true
      });
    }
  });

  // People in shelters
  buildings.shelters.forEach(shelter => {
    const occupants = Math.floor(shelter.capacity * shelter.currentOccupancy);
    for (let i = 0; i < occupants; i++) {
      people.push({
        id: `person-${personId++}`,
        location: shelter.position,
        locationId: shelter.id,
        locationType: 'shelter',
        status: 'resident',
        hasVehicle: Math.random() > 0.5,
        shelterCapability: 'excellent',
        vulnerable: false
      });
    }
  });

  // People in commercial buildings
  buildings.commercial.forEach(building => {
    const occupants = Math.floor(building.capacity * building.currentOccupancy);
    for (let i = 0; i < occupants; i++) {
      people.push({
        id: `person-${personId++}`,
        location: building.position,
        locationId: building.id,
        locationType: 'commercial',
        status: 'visitor',
        hasVehicle: Math.random() > 0.4,
        shelterCapability: 'moderate',
        vulnerable: false
      });
    }
  });

  // Generate active drivers
  const allBuildings = [
    ...buildings.trailerParks,
    ...buildings.shelters,
    ...buildings.commercial,
    ...buildings.residential
  ];

  for (let i = 0; i < numDrivers; i++) {
    const startBuilding = allBuildings[Math.floor(Math.random() * allBuildings.length)];
    const endBuilding = allBuildings[Math.floor(Math.random() * allBuildings.length)];

    // Random position along route (simplified)
    const progress = Math.random();
    const [lon1, lat1] = startBuilding.position;
    const [lon2, lat2] = endBuilding.position;
    const currentPosition = [
      lon1 + (lon2 - lon1) * progress,
      lat1 + (lat2 - lat1) * progress
    ];

    people.push({
      id: `driver-${i}`,
      location: currentPosition,
      locationId: null,
      locationType: 'vehicle',
      status: 'driving',
      hasVehicle: true,
      shelterCapability: 'none',
      vulnerable: true,
      route: {
        from: startBuilding.position,
        to: endBuilding.position,
        progress
      },
      speed: 30 + Math.random() * 30 // 30-60 mph
    });
  }

  return people;
}

/**
 * Generate a complete synthetic scenario
 * @param {Object} config - {townName, center, radius, efRating, direction, speed}
 * @returns {Object} Complete scenario with tornado, buildings, people
 */
export function generateScenario(config) {
  const {
    townName = 'Moore',
    center = [-97.4395, 35.3395], // Moore, OK
    radiusMiles = 5,
    efRating = 3,
    direction = 240, // WSW to ENE (typical)
    speed = 30, // mph
    numDrivers = 20
  } = config;

  // Tornado starts 10 miles away on the projected path
  const tornadoStartDistance = 10;
  const tornadoStartBearing = direction + 180; // Opposite direction
  const tornadoPosition = destinationPoint(center, tornadoStartBearing, tornadoStartDistance);

  const tornado = {
    position: tornadoPosition,
    direction,
    speed,
    efRating,
    warningIssued: Date.now() - (13 * 60 * 1000) // 13 minutes ago
  };

  const buildings = generateSyntheticBuildings(center, radiusMiles);
  const people = generateSyntheticPeople(buildings, numDrivers);

  return {
    name: townName,
    center,
    radius: radiusMiles,
    tornado,
    buildings,
    people,
    metadata: {
      created: Date.now(),
      type: 'synthetic',
      description: `EF${efRating} tornado approaching ${townName} from ${direction}°`
    }
  };
}
