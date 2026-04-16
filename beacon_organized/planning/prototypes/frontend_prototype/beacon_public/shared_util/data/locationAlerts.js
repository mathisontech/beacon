// ============================================================================
// LOCATION ALERTS - Comprehensive list of location-based risks and emergencies
// ============================================================================

export const ALERT_CATEGORIES = {
  WEATHER: 'weather',
  NATURAL_DISASTER: 'natural_disaster',
  INFRASTRUCTURE: 'infrastructure',
  ENVIRONMENTAL: 'environmental',
  PUBLIC_SAFETY: 'public_safety',
  HEALTH: 'health'
}

export const SEVERITY_LEVELS = {
  EXTREME: 'extreme',      // Life-threatening, immediate action required
  SEVERE: 'severe',        // Dangerous, take action soon
  MODERATE: 'moderate',    // Potentially dangerous, be prepared
  MINOR: 'minor',          // Low risk, monitor situation
  ADVISORY: 'advisory'     // Information only, no immediate danger
}

export const TIMING_TYPES = {
  IMMINENT: 'imminent',           // Within minutes to 1 hour
  APPROACHING: 'approaching',      // 1-6 hours
  EXPECTED: 'expected',            // 6-24 hours
  POSSIBLE: 'possible',            // 24-48 hours
  ONGOING: 'ongoing',              // Currently happening
  ENDING: 'ending'                 // Event ending soon
}

export const LOCATION_ALERTS = [
  // ============================================================================
  // WEATHER HAZARDS
  // ============================================================================
  {
    id: 'tornado',
    name: 'Tornado',
    category: ALERT_CATEGORIES.WEATHER,
    icon: '🌪️',
    color: '#7c3aed',
    hasTiming: true,  // This alert type includes timing predictions
    variants: [
      {
        id: 'tornado_watch',
        name: 'Tornado Watch',
        severity: SEVERITY_LEVELS.MODERATE,
        timingType: TIMING_TYPES.POSSIBLE,
        estimatedDuration: '2-6 hours'
      },
      {
        id: 'tornado_warning',
        name: 'Tornado Warning',
        severity: SEVERITY_LEVELS.EXTREME,
        timingType: TIMING_TYPES.IMMINENT,
        estimatedDuration: '15-60 minutes'
      }
    ]
  },
  {
    id: 'hurricane',
    name: 'Hurricane',
    category: ALERT_CATEGORIES.WEATHER,
    icon: '🌀',
    color: '#dc2626',
    hasTiming: true,
    variants: [
      {
        id: 'hurricane_watch',
        name: 'Hurricane Watch',
        severity: SEVERITY_LEVELS.SEVERE,
        timingType: TIMING_TYPES.EXPECTED,
        estimatedDuration: '24-48 hours'
      },
      {
        id: 'hurricane_warning',
        name: 'Hurricane Warning',
        severity: SEVERITY_LEVELS.EXTREME,
        timingType: TIMING_TYPES.APPROACHING,
        estimatedDuration: '6-24 hours'
      },
      {
        id: 'hurricane_active',
        name: 'Hurricane (Active)',
        severity: SEVERITY_LEVELS.EXTREME,
        timingType: TIMING_TYPES.ONGOING,
        estimatedDuration: '6-12 hours',
        estimatedEnd: 'Predicted to pass in 6-12 hours'
      }
    ]
  },
  {
    id: 'thunderstorm',
    name: 'Severe Thunderstorm',
    category: ALERT_CATEGORIES.WEATHER,
    icon: '⛈️',
    color: '#f59e0b',
    variants: [
      { id: 'thunderstorm_watch', name: 'Severe Thunderstorm Watch', severity: SEVERITY_LEVELS.MODERATE },
      { id: 'thunderstorm_warning', name: 'Severe Thunderstorm Warning', severity: SEVERITY_LEVELS.SEVERE }
    ]
  },
  {
    id: 'flash_flood',
    name: 'Flash Flood',
    category: ALERT_CATEGORIES.WEATHER,
    icon: '🌊',
    color: '#3b82f6',
    variants: [
      { id: 'flash_flood_watch', name: 'Flash Flood Watch', severity: SEVERITY_LEVELS.MODERATE },
      { id: 'flash_flood_warning', name: 'Flash Flood Warning', severity: SEVERITY_LEVELS.EXTREME }
    ]
  },
  {
    id: 'flood',
    name: 'Flooding',
    category: ALERT_CATEGORIES.WEATHER,
    icon: '🌊',
    color: '#0ea5e9',
    variants: [
      { id: 'flood_advisory', name: 'Flood Advisory', severity: SEVERITY_LEVELS.MINOR },
      { id: 'flood_watch', name: 'Flood Watch', severity: SEVERITY_LEVELS.MODERATE },
      { id: 'flood_warning', name: 'Flood Warning', severity: SEVERITY_LEVELS.SEVERE }
    ]
  },
  {
    id: 'winter_storm',
    name: 'Winter Storm',
    category: ALERT_CATEGORIES.WEATHER,
    icon: '❄️',
    color: '#60a5fa',
    variants: [
      { id: 'winter_storm_watch', name: 'Winter Storm Watch', severity: SEVERITY_LEVELS.MODERATE },
      { id: 'winter_storm_warning', name: 'Winter Storm Warning', severity: SEVERITY_LEVELS.SEVERE },
      { id: 'blizzard_warning', name: 'Blizzard Warning', severity: SEVERITY_LEVELS.EXTREME }
    ]
  },
  {
    id: 'ice_storm',
    name: 'Ice Storm',
    category: ALERT_CATEGORIES.WEATHER,
    icon: '🧊',
    color: '#38bdf8',
    variants: [
      { id: 'ice_storm_warning', name: 'Ice Storm Warning', severity: SEVERITY_LEVELS.SEVERE }
    ]
  },
  {
    id: 'extreme_heat',
    name: 'Extreme Heat',
    category: ALERT_CATEGORIES.WEATHER,
    icon: '🌡️',
    color: '#f97316',
    variants: [
      { id: 'heat_advisory', name: 'Heat Advisory', severity: SEVERITY_LEVELS.MODERATE },
      { id: 'excessive_heat_warning', name: 'Excessive Heat Warning', severity: SEVERITY_LEVELS.SEVERE }
    ]
  },
  {
    id: 'extreme_cold',
    name: 'Extreme Cold',
    category: ALERT_CATEGORIES.WEATHER,
    icon: '🥶',
    color: '#22d3ee',
    variants: [
      { id: 'wind_chill_advisory', name: 'Wind Chill Advisory', severity: SEVERITY_LEVELS.MODERATE },
      { id: 'extreme_cold_warning', name: 'Extreme Cold Warning', severity: SEVERITY_LEVELS.SEVERE }
    ]
  },
  {
    id: 'high_wind',
    name: 'High Wind',
    category: ALERT_CATEGORIES.WEATHER,
    icon: '💨',
    color: '#94a3b8',
    variants: [
      { id: 'wind_advisory', name: 'Wind Advisory', severity: SEVERITY_LEVELS.MINOR },
      { id: 'high_wind_warning', name: 'High Wind Warning', severity: SEVERITY_LEVELS.SEVERE }
    ]
  },
  {
    id: 'hail',
    name: 'Hail',
    category: ALERT_CATEGORIES.WEATHER,
    icon: '🧊',
    color: '#64748b',
    variants: [
      { id: 'hail_warning', name: 'Large Hail Warning', severity: SEVERITY_LEVELS.SEVERE }
    ]
  },
  {
    id: 'lightning',
    name: 'Lightning',
    category: ALERT_CATEGORIES.WEATHER,
    icon: '⚡',
    color: '#eab308',
    variants: [
      { id: 'lightning_danger', name: 'Lightning Danger', severity: SEVERITY_LEVELS.SEVERE }
    ]
  },

  // ============================================================================
  // NATURAL DISASTERS
  // ============================================================================
  {
    id: 'wildfire',
    name: 'Wildfire',
    category: ALERT_CATEGORIES.NATURAL_DISASTER,
    icon: '🔥',
    color: '#dc2626',
    variants: [
      { id: 'fire_watch', name: 'Fire Weather Watch', severity: SEVERITY_LEVELS.MODERATE },
      { id: 'red_flag_warning', name: 'Red Flag Warning', severity: SEVERITY_LEVELS.SEVERE },
      { id: 'wildfire_active', name: 'Active Wildfire', severity: SEVERITY_LEVELS.EXTREME },
      { id: 'evacuation_warning', name: 'Evacuation Warning', severity: SEVERITY_LEVELS.EXTREME },
      { id: 'evacuation_order', name: 'Evacuation Order', severity: SEVERITY_LEVELS.EXTREME }
    ]
  },
  {
    id: 'earthquake',
    name: 'Earthquake',
    category: ALERT_CATEGORIES.NATURAL_DISASTER,
    icon: '🌍',
    color: '#78350f',
    variants: [
      { id: 'earthquake_minor', name: 'Minor Earthquake', severity: SEVERITY_LEVELS.MINOR },
      { id: 'earthquake_moderate', name: 'Moderate Earthquake', severity: SEVERITY_LEVELS.MODERATE },
      { id: 'earthquake_major', name: 'Major Earthquake', severity: SEVERITY_LEVELS.EXTREME },
      { id: 'aftershock', name: 'Aftershock Warning', severity: SEVERITY_LEVELS.MODERATE }
    ]
  },
  {
    id: 'tsunami',
    name: 'Tsunami',
    category: ALERT_CATEGORIES.NATURAL_DISASTER,
    icon: '🌊',
    color: '#0369a1',
    variants: [
      { id: 'tsunami_watch', name: 'Tsunami Watch', severity: SEVERITY_LEVELS.SEVERE },
      { id: 'tsunami_warning', name: 'Tsunami Warning', severity: SEVERITY_LEVELS.EXTREME },
      { id: 'tsunami_approaching', name: 'Tsunami Approaching', severity: SEVERITY_LEVELS.EXTREME }
    ]
  },
  {
    id: 'landslide',
    name: 'Landslide',
    category: ALERT_CATEGORIES.NATURAL_DISASTER,
    icon: '⛰️',
    color: '#92400e',
    variants: [
      { id: 'landslide_warning', name: 'Landslide Warning', severity: SEVERITY_LEVELS.SEVERE },
      { id: 'mudslide', name: 'Mudslide', severity: SEVERITY_LEVELS.SEVERE }
    ]
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    category: ALERT_CATEGORIES.NATURAL_DISASTER,
    icon: '🏔️',
    color: '#475569',
    variants: [
      { id: 'avalanche_watch', name: 'Avalanche Watch', severity: SEVERITY_LEVELS.MODERATE },
      { id: 'avalanche_warning', name: 'Avalanche Warning', severity: SEVERITY_LEVELS.EXTREME }
    ]
  },
  {
    id: 'volcano',
    name: 'Volcanic Activity',
    category: ALERT_CATEGORIES.NATURAL_DISASTER,
    icon: '🌋',
    color: '#991b1b',
    variants: [
      { id: 'volcano_watch', name: 'Volcanic Watch', severity: SEVERITY_LEVELS.MODERATE },
      { id: 'volcano_warning', name: 'Volcanic Warning', severity: SEVERITY_LEVELS.EXTREME },
      { id: 'ashfall', name: 'Volcanic Ashfall', severity: SEVERITY_LEVELS.SEVERE }
    ]
  },

  // ============================================================================
  // INFRASTRUCTURE HAZARDS
  // ============================================================================
  {
    id: 'power_outage',
    name: 'Power Outage',
    category: ALERT_CATEGORIES.INFRASTRUCTURE,
    icon: '⚡',
    color: '#374151',
    variants: [
      { id: 'power_outage_widespread', name: 'Widespread Power Outage', severity: SEVERITY_LEVELS.SEVERE },
      { id: 'rolling_blackout', name: 'Rolling Blackouts', severity: SEVERITY_LEVELS.MODERATE }
    ]
  },
  {
    id: 'water_main_break',
    name: 'Water Main Break',
    category: ALERT_CATEGORIES.INFRASTRUCTURE,
    icon: '💧',
    color: '#0891b2',
    variants: [
      { id: 'water_service_disruption', name: 'Water Service Disruption', severity: SEVERITY_LEVELS.MODERATE }
    ]
  },
  {
    id: 'gas_leak',
    name: 'Gas Leak',
    category: ALERT_CATEGORIES.INFRASTRUCTURE,
    icon: '💨',
    color: '#dc2626',
    variants: [
      { id: 'gas_leak_major', name: 'Major Gas Leak', severity: SEVERITY_LEVELS.EXTREME }
    ]
  },
  {
    id: 'dam_failure',
    name: 'Dam Failure',
    category: ALERT_CATEGORIES.INFRASTRUCTURE,
    icon: '🌊',
    color: '#991b1b',
    variants: [
      { id: 'dam_failure_imminent', name: 'Dam Failure Imminent', severity: SEVERITY_LEVELS.EXTREME }
    ]
  },
  {
    id: 'bridge_collapse',
    name: 'Bridge Collapse',
    category: ALERT_CATEGORIES.INFRASTRUCTURE,
    icon: '🌉',
    color: '#7c2d12',
    variants: [
      { id: 'bridge_structural_failure', name: 'Bridge Structural Failure', severity: SEVERITY_LEVELS.EXTREME }
    ]
  },
  {
    id: 'road_closure',
    name: 'Road Closure',
    category: ALERT_CATEGORIES.INFRASTRUCTURE,
    icon: '🚧',
    color: '#f59e0b',
    variants: [
      { id: 'road_blockage', name: 'Road Blockage', severity: SEVERITY_LEVELS.MINOR },
      { id: 'highway_closure', name: 'Highway Closure', severity: SEVERITY_LEVELS.MODERATE }
    ]
  },
  {
    id: 'downed_power_line',
    name: 'Downed Power Line',
    category: ALERT_CATEGORIES.INFRASTRUCTURE,
    icon: '⚡',
    color: '#dc2626',
    variants: [
      { id: 'live_wire', name: 'Live Wire Hazard', severity: SEVERITY_LEVELS.EXTREME }
    ]
  },
  {
    id: 'building_collapse',
    name: 'Building Collapse',
    category: ALERT_CATEGORIES.INFRASTRUCTURE,
    icon: '🏢',
    color: '#991b1b',
    variants: [
      { id: 'structural_damage', name: 'Structural Damage', severity: SEVERITY_LEVELS.SEVERE }
    ]
  },

  // ============================================================================
  // ENVIRONMENTAL HAZARDS
  // ============================================================================
  {
    id: 'air_quality',
    name: 'Poor Air Quality',
    category: ALERT_CATEGORIES.ENVIRONMENTAL,
    icon: '💨',
    color: '#78716c',
    variants: [
      { id: 'air_quality_moderate', name: 'Moderate Air Quality', severity: SEVERITY_LEVELS.MINOR },
      { id: 'air_quality_unhealthy_sensitive', name: 'Unhealthy for Sensitive Groups', severity: SEVERITY_LEVELS.MODERATE },
      { id: 'air_quality_unhealthy', name: 'Unhealthy Air Quality', severity: SEVERITY_LEVELS.SEVERE },
      { id: 'air_quality_hazardous', name: 'Hazardous Air Quality', severity: SEVERITY_LEVELS.EXTREME }
    ]
  },
  {
    id: 'smoke',
    name: 'Smoke',
    category: ALERT_CATEGORIES.ENVIRONMENTAL,
    icon: '🌫️',
    color: '#57534e',
    variants: [
      { id: 'wildfire_smoke', name: 'Wildfire Smoke', severity: SEVERITY_LEVELS.MODERATE },
      { id: 'heavy_smoke', name: 'Heavy Smoke', severity: SEVERITY_LEVELS.SEVERE }
    ]
  },
  {
    id: 'chemical_spill',
    name: 'Chemical Spill',
    category: ALERT_CATEGORIES.ENVIRONMENTAL,
    icon: '☢️',
    color: '#16a34a',
    variants: [
      { id: 'hazmat_spill', name: 'Hazardous Materials Spill', severity: SEVERITY_LEVELS.EXTREME }
    ]
  },
  {
    id: 'radiation',
    name: 'Radiation',
    category: ALERT_CATEGORIES.ENVIRONMENTAL,
    icon: '☢️',
    color: '#eab308',
    variants: [
      { id: 'radiation_leak', name: 'Radiation Leak', severity: SEVERITY_LEVELS.EXTREME },
      { id: 'nuclear_incident', name: 'Nuclear Incident', severity: SEVERITY_LEVELS.EXTREME }
    ]
  },
  {
    id: 'water_contamination',
    name: 'Water Contamination',
    category: ALERT_CATEGORIES.ENVIRONMENTAL,
    icon: '💧',
    color: '#0891b2',
    variants: [
      { id: 'boil_water_advisory', name: 'Boil Water Advisory', severity: SEVERITY_LEVELS.MODERATE },
      { id: 'water_unsafe', name: 'Water Unsafe to Drink', severity: SEVERITY_LEVELS.SEVERE }
    ]
  },
  {
    id: 'oil_spill',
    name: 'Oil Spill',
    category: ALERT_CATEGORIES.ENVIRONMENTAL,
    icon: '🛢️',
    color: '#1f2937',
    variants: [
      { id: 'oil_spill_major', name: 'Major Oil Spill', severity: SEVERITY_LEVELS.SEVERE }
    ]
  },

  // ============================================================================
  // PUBLIC SAFETY HAZARDS
  // ============================================================================
  {
    id: 'civil_unrest',
    name: 'Civil Unrest',
    category: ALERT_CATEGORIES.PUBLIC_SAFETY,
    icon: '⚠️',
    color: '#dc2626',
    variants: [
      { id: 'protest', name: 'Protest/Demonstration', severity: SEVERITY_LEVELS.MINOR },
      { id: 'riot', name: 'Riot', severity: SEVERITY_LEVELS.SEVERE }
    ]
  },
  {
    id: 'active_shooter',
    name: 'Active Threat',
    category: ALERT_CATEGORIES.PUBLIC_SAFETY,
    icon: '🚨',
    color: '#991b1b',
    variants: [
      { id: 'active_shooter', name: 'Active Shooter', severity: SEVERITY_LEVELS.EXTREME },
      { id: 'shelter_in_place', name: 'Shelter in Place Order', severity: SEVERITY_LEVELS.EXTREME }
    ]
  },
  {
    id: 'bomb_threat',
    name: 'Bomb Threat',
    category: ALERT_CATEGORIES.PUBLIC_SAFETY,
    icon: '💣',
    color: '#991b1b',
    variants: [
      { id: 'explosive_device', name: 'Explosive Device Found', severity: SEVERITY_LEVELS.EXTREME }
    ]
  },
  {
    id: 'terrorism',
    name: 'Terrorism',
    category: ALERT_CATEGORIES.PUBLIC_SAFETY,
    icon: '⚠️',
    color: '#7f1d1d',
    variants: [
      { id: 'terrorist_threat', name: 'Terrorist Threat', severity: SEVERITY_LEVELS.EXTREME }
    ]
  },
  {
    id: 'amber_alert',
    name: 'Amber Alert',
    category: ALERT_CATEGORIES.PUBLIC_SAFETY,
    icon: '🚨',
    color: '#f59e0b',
    variants: [
      { id: 'child_abduction', name: 'Child Abduction', severity: SEVERITY_LEVELS.SEVERE }
    ]
  },
  // ============================================================================
  // HEALTH HAZARDS
  // ============================================================================
  {
    id: 'pandemic',
    name: 'Pandemic',
    category: ALERT_CATEGORIES.HEALTH,
    icon: '🦠',
    color: '#dc2626',
    variants: [
      { id: 'disease_outbreak', name: 'Disease Outbreak', severity: SEVERITY_LEVELS.SEVERE },
      { id: 'quarantine', name: 'Quarantine Zone', severity: SEVERITY_LEVELS.EXTREME }
    ]
  },
  {
    id: 'food_recall',
    name: 'Food Recall',
    category: ALERT_CATEGORIES.HEALTH,
    icon: '🍽️',
    color: '#dc2626',
    variants: [
      { id: 'food_contamination', name: 'Food Contamination', severity: SEVERITY_LEVELS.SEVERE }
    ]
  },
  {
    id: 'biological_hazard',
    name: 'Biological Hazard',
    category: ALERT_CATEGORIES.HEALTH,
    icon: '☣️',
    color: '#16a34a',
    variants: [
      { id: 'biohazard_spill', name: 'Biohazard Spill', severity: SEVERITY_LEVELS.EXTREME }
    ]
  },
  {
    id: 'pest_infestation',
    name: 'Pest Infestation',
    category: ALERT_CATEGORIES.HEALTH,
    icon: '🐛',
    color: '#78716c',
    variants: [
      { id: 'locust_swarm', name: 'Locust Swarm', severity: SEVERITY_LEVELS.MODERATE },
      { id: 'mosquito_borne_disease', name: 'Mosquito-Borne Disease', severity: SEVERITY_LEVELS.MODERATE }
    ]
  }
]

// Helper function to get hazard by ID
export const getHazardById = (id) => {
  return LOCATION_ALERTS.find(h => h.id === id)
}

// Helper function to get all hazards by category
export const getHazardsByCategory = (category) => {
  return LOCATION_ALERTS.filter(h => h.category === category)
}

// Helper function to get hazard variant
export const getHazardVariant = (hazardId, variantId) => {
  const hazard = getHazardById(hazardId)
  if (!hazard) return null
  return hazard.variants?.find(v => v.id === variantId)
}

export default LOCATION_ALERTS