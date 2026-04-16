/**
 * Standard Incident Types Database
 * Defines response requirements for each incident type
 */

export interface ResponseRequirement {
  vehicleType: string;
  minCount: number;
  optionalCount?: number; // Additional units for larger incidents
}

export interface IncidentTypeDefinition {
  id: string;
  name: string;
  category: 'fire' | 'medical' | 'rescue' | 'hazmat' | 'weather' | 'traffic' | 'utility' | 'crime' | 'welfare' | 'other';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  standardResponse: ResponseRequirement[];
  minPersonnel: number;
  optimalPersonnel: number;
  maxResponseTime: number; // in minutes
  escalationThreshold: number; // minutes before escalation if unassigned
}

// Standard incident types database
export const INCIDENT_TYPES: Record<string, IncidentTypeDefinition> = {
  // Fire Incidents
  structure_fire: {
    id: 'structure_fire',
    name: 'Structure Fire',
    category: 'fire',
    severity: 'critical',
    description: 'Active fire in a building or structure',
    standardResponse: [
      { vehicleType: 'engine', minCount: 2, optionalCount: 1 },
      { vehicleType: 'ladder', minCount: 1 },
      { vehicleType: 'ambulance', minCount: 1 },
      { vehicleType: 'battalion_chief', minCount: 1 },
    ],
    minPersonnel: 12,
    optimalPersonnel: 18,
    maxResponseTime: 6,
    escalationThreshold: 3,
  },
  vehicle_fire: {
    id: 'vehicle_fire',
    name: 'Vehicle Fire',
    category: 'fire',
    severity: 'high',
    description: 'Fire involving a motor vehicle',
    standardResponse: [
      { vehicleType: 'engine', minCount: 1 },
      { vehicleType: 'ambulance', minCount: 1 },
    ],
    minPersonnel: 4,
    optimalPersonnel: 6,
    maxResponseTime: 8,
    escalationThreshold: 5,
  },
  brush_fire: {
    id: 'brush_fire',
    name: 'Brush/Wildland Fire',
    category: 'fire',
    severity: 'high',
    description: 'Fire in vegetation or wildland area',
    standardResponse: [
      { vehicleType: 'engine', minCount: 2 },
      { vehicleType: 'brush_truck', minCount: 1 },
    ],
    minPersonnel: 6,
    optimalPersonnel: 10,
    maxResponseTime: 10,
    escalationThreshold: 5,
  },
  smoke_investigation: {
    id: 'smoke_investigation',
    name: 'Smoke Investigation',
    category: 'fire',
    severity: 'medium',
    description: 'Report of smoke, source unknown',
    standardResponse: [
      { vehicleType: 'engine', minCount: 1 },
    ],
    minPersonnel: 4,
    optimalPersonnel: 4,
    maxResponseTime: 10,
    escalationThreshold: 8,
  },

  // Medical Incidents
  cardiac_arrest: {
    id: 'cardiac_arrest',
    name: 'Cardiac Arrest',
    category: 'medical',
    severity: 'critical',
    description: 'Patient in cardiac arrest, CPR in progress or needed',
    standardResponse: [
      { vehicleType: 'ambulance', minCount: 1 },
      { vehicleType: 'engine', minCount: 1 }, // First responder support
      { vehicleType: 'supervisor', minCount: 1 },
    ],
    minPersonnel: 6,
    optimalPersonnel: 8,
    maxResponseTime: 4,
    escalationThreshold: 2,
  },
  chest_pain: {
    id: 'chest_pain',
    name: 'Chest Pain / Cardiac',
    category: 'medical',
    severity: 'high',
    description: 'Patient experiencing chest pain or cardiac symptoms',
    standardResponse: [
      { vehicleType: 'ambulance', minCount: 1 },
    ],
    minPersonnel: 2,
    optimalPersonnel: 4,
    maxResponseTime: 8,
    escalationThreshold: 5,
  },
  breathing_difficulty: {
    id: 'breathing_difficulty',
    name: 'Breathing Difficulty',
    category: 'medical',
    severity: 'high',
    description: 'Patient with respiratory distress',
    standardResponse: [
      { vehicleType: 'ambulance', minCount: 1 },
    ],
    minPersonnel: 2,
    optimalPersonnel: 4,
    maxResponseTime: 8,
    escalationThreshold: 5,
  },
  trauma: {
    id: 'trauma',
    name: 'Traumatic Injury',
    category: 'medical',
    severity: 'high',
    description: 'Patient with significant traumatic injury',
    standardResponse: [
      { vehicleType: 'ambulance', minCount: 1 },
      { vehicleType: 'engine', minCount: 1 },
    ],
    minPersonnel: 4,
    optimalPersonnel: 6,
    maxResponseTime: 8,
    escalationThreshold: 5,
  },
  medical_general: {
    id: 'medical_general',
    name: 'Medical Emergency',
    category: 'medical',
    severity: 'medium',
    description: 'General medical emergency',
    standardResponse: [
      { vehicleType: 'ambulance', minCount: 1 },
    ],
    minPersonnel: 2,
    optimalPersonnel: 2,
    maxResponseTime: 10,
    escalationThreshold: 8,
  },
  hypothermia: {
    id: 'hypothermia',
    name: 'Hypothermia/Cold Exposure',
    category: 'medical',
    severity: 'high',
    description: 'Patient with cold exposure or hypothermia',
    standardResponse: [
      { vehicleType: 'ambulance', minCount: 1 },
    ],
    minPersonnel: 2,
    optimalPersonnel: 4,
    maxResponseTime: 8,
    escalationThreshold: 5,
  },

  // Rescue Incidents
  water_rescue: {
    id: 'water_rescue',
    name: 'Water Rescue',
    category: 'rescue',
    severity: 'critical',
    description: 'Person in water requiring rescue',
    standardResponse: [
      { vehicleType: 'rescue', minCount: 1 },
      { vehicleType: 'engine', minCount: 1 },
      { vehicleType: 'ambulance', minCount: 1 },
      { vehicleType: 'boat', minCount: 1 },
    ],
    minPersonnel: 8,
    optimalPersonnel: 12,
    maxResponseTime: 6,
    escalationThreshold: 3,
  },
  vehicle_entrapment: {
    id: 'vehicle_entrapment',
    name: 'Vehicle Entrapment',
    category: 'rescue',
    severity: 'critical',
    description: 'Person trapped in vehicle requiring extrication',
    standardResponse: [
      { vehicleType: 'rescue', minCount: 1 },
      { vehicleType: 'engine', minCount: 1 },
      { vehicleType: 'ambulance', minCount: 1 },
      { vehicleType: 'battalion_chief', minCount: 1 },
    ],
    minPersonnel: 8,
    optimalPersonnel: 12,
    maxResponseTime: 6,
    escalationThreshold: 3,
  },
  elevator_rescue: {
    id: 'elevator_rescue',
    name: 'Elevator Rescue',
    category: 'rescue',
    severity: 'medium',
    description: 'Person stuck in elevator',
    standardResponse: [
      { vehicleType: 'engine', minCount: 1 },
    ],
    minPersonnel: 4,
    optimalPersonnel: 4,
    maxResponseTime: 15,
    escalationThreshold: 10,
  },
  confined_space: {
    id: 'confined_space',
    name: 'Confined Space Rescue',
    category: 'rescue',
    severity: 'critical',
    description: 'Person trapped in confined space',
    standardResponse: [
      { vehicleType: 'rescue', minCount: 1 },
      { vehicleType: 'engine', minCount: 2 },
      { vehicleType: 'ambulance', minCount: 1 },
      { vehicleType: 'battalion_chief', minCount: 1 },
    ],
    minPersonnel: 12,
    optimalPersonnel: 16,
    maxResponseTime: 8,
    escalationThreshold: 4,
  },

  // Traffic/Accident Incidents
  mva_injuries: {
    id: 'mva_injuries',
    name: 'MVA with Injuries',
    category: 'traffic',
    severity: 'high',
    description: 'Motor vehicle accident with reported injuries',
    standardResponse: [
      { vehicleType: 'ambulance', minCount: 1, optionalCount: 1 },
      { vehicleType: 'engine', minCount: 1 },
      { vehicleType: 'police', minCount: 1 },
    ],
    minPersonnel: 6,
    optimalPersonnel: 10,
    maxResponseTime: 8,
    escalationThreshold: 5,
  },
  mva_no_injuries: {
    id: 'mva_no_injuries',
    name: 'MVA - No Injuries',
    category: 'traffic',
    severity: 'low',
    description: 'Motor vehicle accident, no injuries reported',
    standardResponse: [
      { vehicleType: 'police', minCount: 1 },
    ],
    minPersonnel: 1,
    optimalPersonnel: 2,
    maxResponseTime: 20,
    escalationThreshold: 15,
  },
  stranded_motorist: {
    id: 'stranded_motorist',
    name: 'Stranded Motorist',
    category: 'traffic',
    severity: 'medium',
    description: 'Vehicle stranded, occupants need assistance',
    standardResponse: [
      { vehicleType: 'atv', minCount: 1 },
    ],
    minPersonnel: 2,
    optimalPersonnel: 2,
    maxResponseTime: 30,
    escalationThreshold: 20,
  },

  // Weather-Related Incidents
  flooding: {
    id: 'flooding',
    name: 'Flooding Emergency',
    category: 'weather',
    severity: 'high',
    description: 'Active flooding affecting structures or roadways',
    standardResponse: [
      { vehicleType: 'engine', minCount: 1 },
      { vehicleType: 'rescue', minCount: 1 },
    ],
    minPersonnel: 6,
    optimalPersonnel: 8,
    maxResponseTime: 10,
    escalationThreshold: 5,
  },
  storm_damage: {
    id: 'storm_damage',
    name: 'Storm Damage',
    category: 'weather',
    severity: 'medium',
    description: 'Property damage from storm, no injuries',
    standardResponse: [
      { vehicleType: 'engine', minCount: 1 },
    ],
    minPersonnel: 4,
    optimalPersonnel: 4,
    maxResponseTime: 30,
    escalationThreshold: 20,
  },

  // Utility Incidents
  gas_leak: {
    id: 'gas_leak',
    name: 'Gas Leak',
    category: 'utility',
    severity: 'high',
    description: 'Reported natural gas leak',
    standardResponse: [
      { vehicleType: 'engine', minCount: 1 },
      { vehicleType: 'utility_crew', minCount: 1 },
    ],
    minPersonnel: 6,
    optimalPersonnel: 8,
    maxResponseTime: 10,
    escalationThreshold: 5,
  },
  power_line_down: {
    id: 'power_line_down',
    name: 'Power Line Down',
    category: 'utility',
    severity: 'high',
    description: 'Downed power line, potential energized hazard',
    standardResponse: [
      { vehicleType: 'engine', minCount: 1 },
      { vehicleType: 'utility_crew', minCount: 1 },
    ],
    minPersonnel: 6,
    optimalPersonnel: 8,
    maxResponseTime: 15,
    escalationThreshold: 10,
  },
  power_outage: {
    id: 'power_outage',
    name: 'Power Outage',
    category: 'utility',
    severity: 'low',
    description: 'Area power outage, no immediate hazard',
    standardResponse: [
      { vehicleType: 'utility_crew', minCount: 1 },
    ],
    minPersonnel: 2,
    optimalPersonnel: 4,
    maxResponseTime: 60,
    escalationThreshold: 30,
  },

  // Hazmat Incidents
  hazmat_spill: {
    id: 'hazmat_spill',
    name: 'Hazmat Spill',
    category: 'hazmat',
    severity: 'critical',
    description: 'Hazardous material spill or release',
    standardResponse: [
      { vehicleType: 'hazmat', minCount: 1 },
      { vehicleType: 'engine', minCount: 2 },
      { vehicleType: 'ambulance', minCount: 1 },
      { vehicleType: 'battalion_chief', minCount: 1 },
    ],
    minPersonnel: 12,
    optimalPersonnel: 16,
    maxResponseTime: 10,
    escalationThreshold: 5,
  },
  carbon_monoxide: {
    id: 'carbon_monoxide',
    name: 'Carbon Monoxide Alarm',
    category: 'hazmat',
    severity: 'high',
    description: 'CO detector activation or suspected CO exposure',
    standardResponse: [
      { vehicleType: 'engine', minCount: 1 },
      { vehicleType: 'ambulance', minCount: 1 },
    ],
    minPersonnel: 4,
    optimalPersonnel: 6,
    maxResponseTime: 8,
    escalationThreshold: 5,
  },

  // Welfare Incidents
  welfare_check: {
    id: 'welfare_check',
    name: 'Welfare Check',
    category: 'welfare',
    severity: 'medium',
    description: 'Check on wellbeing of individual',
    standardResponse: [
      { vehicleType: 'police', minCount: 1 },
    ],
    minPersonnel: 1,
    optimalPersonnel: 2,
    maxResponseTime: 30,
    escalationThreshold: 20,
  },
  welfare_check_medical: {
    id: 'welfare_check_medical',
    name: 'Welfare Check - Medical Concern',
    category: 'welfare',
    severity: 'high',
    description: 'Check on individual with medical concerns',
    standardResponse: [
      { vehicleType: 'ambulance', minCount: 1 },
      { vehicleType: 'police', minCount: 1 },
    ],
    minPersonnel: 3,
    optimalPersonnel: 4,
    maxResponseTime: 15,
    escalationThreshold: 10,
  },
};

// Helper function to get incident type by ID
export const getIncidentType = (typeId: string): IncidentTypeDefinition | undefined => {
  return INCIDENT_TYPES[typeId];
};

// Helper function to calculate if response is adequate
export const isResponseAdequate = (
  typeId: string,
  currentPersonnel: number,
  currentVehicles: { type: string; count: number }[]
): { adequate: boolean; personnelMet: boolean; vehiclesMet: boolean; missing: string[] } => {
  const incidentType = getIncidentType(typeId);
  if (!incidentType) {
    return { adequate: true, personnelMet: true, vehiclesMet: true, missing: [] };
  }

  const personnelMet = currentPersonnel >= incidentType.minPersonnel;
  const missing: string[] = [];

  // Check each required vehicle type
  for (const req of incidentType.standardResponse) {
    const current = currentVehicles.find(v => v.type === req.vehicleType);
    const currentCount = current?.count || 0;
    if (currentCount < req.minCount) {
      missing.push(`${req.minCount - currentCount} more ${req.vehicleType}(s)`);
    }
  }

  const vehiclesMet = missing.length === 0;

  if (!personnelMet) {
    missing.unshift(`${incidentType.minPersonnel - currentPersonnel} more personnel`);
  }

  return {
    adequate: personnelMet && vehiclesMet,
    personnelMet,
    vehiclesMet,
    missing,
  };
};

// Get all incident types by category
export const getIncidentTypesByCategory = (category: IncidentTypeDefinition['category']): IncidentTypeDefinition[] => {
  return Object.values(INCIDENT_TYPES).filter(type => type.category === category);
};

// Get all categories
export const getIncidentCategories = (): IncidentTypeDefinition['category'][] => {
  return ['fire', 'medical', 'rescue', 'hazmat', 'weather', 'traffic', 'utility', 'crime', 'welfare', 'other'];
};

export default INCIDENT_TYPES;
