// ============================================================================
// PERSONAL STATUS TYPES - User status updates and situation reporting
// ============================================================================

export const STATUS_CATEGORIES = {
  SAFETY: 'safety',
  LOCATION: 'location',
  RESOURCES: 'resources',
  MEDICAL: 'medical',
  ASSISTANCE: 'assistance',
  INFRASTRUCTURE: 'infrastructure',
  TRANSPORTATION: 'transportation'
}

export const STATUS_TYPES = [
  // ============================================================================
  // SAFETY STATUS
  // ============================================================================
  {
    id: 'safe',
    name: 'Safe',
    category: STATUS_CATEGORIES.SAFETY,
    icon: '✅',
    color: '#10b981',
    description: 'I am safe and secure'
  },
  {
    id: 'sheltering_in_place',
    name: 'Sheltering in Place',
    category: STATUS_CATEGORIES.SAFETY,
    icon: '🏠',
    color: '#f59e0b',
    description: 'Staying inside, not evacuating'
  },
  {
    id: 'need_help',
    name: 'Need Help',
    category: STATUS_CATEGORIES.SAFETY,
    icon: '🆘',
    color: '#dc2626',
    description: 'I need immediate assistance'
  },
  {
    id: 'injured',
    name: 'Injured',
    category: STATUS_CATEGORIES.SAFETY,
    icon: '🤕',
    color: '#dc2626',
    description: 'I or someone with me is injured'
  },
  {
    id: 'trapped',
    name: 'Trapped',
    category: STATUS_CATEGORIES.SAFETY,
    icon: '⚠️',
    color: '#991b1b',
    description: 'Unable to leave current location'
  },
  {
    id: 'isolated',
    name: 'Isolated',
    category: STATUS_CATEGORIES.SAFETY,
    icon: '🚫',
    color: '#f59e0b',
    description: 'Cut off from help/roads blocked'
  },

  // ============================================================================
  // LOCATION STATUS
  // ============================================================================
  {
    id: 'at_home',
    name: 'At Home',
    category: STATUS_CATEGORIES.LOCATION,
    icon: '🏠',
    color: '#3b82f6',
    description: 'Currently at my home'
  },
  {
    id: 'at_shelter',
    name: 'At Shelter',
    category: STATUS_CATEGORIES.LOCATION,
    icon: '🏢',
    color: '#10b981',
    description: 'At emergency shelter'
  },
  {
    id: 'evacuating',
    name: 'Evacuating',
    category: STATUS_CATEGORIES.LOCATION,
    icon: '🚗',
    color: '#f59e0b',
    description: 'Currently evacuating the area'
  },
  {
    id: 'evacuated',
    name: 'Evacuated',
    category: STATUS_CATEGORIES.LOCATION,
    icon: '✅',
    color: '#10b981',
    description: 'Successfully evacuated to safety'
  },
  {
    id: 'returning_home',
    name: 'Returning Home',
    category: STATUS_CATEGORIES.LOCATION,
    icon: '🏠',
    color: '#3b82f6',
    description: 'On my way back home'
  },
  {
    id: 'at_work',
    name: 'At Work',
    category: STATUS_CATEGORIES.LOCATION,
    icon: '🏢',
    color: '#64748b',
    description: 'Currently at workplace'
  },
  {
    id: 'in_vehicle',
    name: 'In Vehicle',
    category: STATUS_CATEGORIES.LOCATION,
    icon: '🚗',
    color: '#64748b',
    description: 'Traveling/in transit'
  },
  {
    id: 'at_friends_family',
    name: 'At Friend/Family',
    category: STATUS_CATEGORIES.LOCATION,
    icon: '👥',
    color: '#3b82f6',
    description: 'Staying with friends or family'
  },

  // ============================================================================
  // RESOURCES STATUS
  // ============================================================================
  {
    id: 'have_food',
    name: 'Have Food',
    category: STATUS_CATEGORIES.RESOURCES,
    icon: '🍽️',
    color: '#10b981',
    description: 'Have adequate food supplies'
  },
  {
    id: 'need_food',
    name: 'Need Food',
    category: STATUS_CATEGORIES.RESOURCES,
    icon: '🍽️',
    color: '#dc2626',
    description: 'Running low on food'
  },
  {
    id: 'have_water',
    name: 'Have Water',
    category: STATUS_CATEGORIES.RESOURCES,
    icon: '💧',
    color: '#10b981',
    description: 'Have clean drinking water'
  },
  {
    id: 'need_water',
    name: 'Need Water',
    category: STATUS_CATEGORIES.RESOURCES,
    icon: '💧',
    color: '#dc2626',
    description: 'Need clean water'
  },
  {
    id: 'have_supplies',
    name: 'Have Supplies',
    category: STATUS_CATEGORIES.RESOURCES,
    icon: '📦',
    color: '#10b981',
    description: 'Have emergency supplies'
  },
  {
    id: 'need_supplies',
    name: 'Need Supplies',
    category: STATUS_CATEGORIES.RESOURCES,
    icon: '📦',
    color: '#dc2626',
    description: 'Need emergency supplies'
  },
  {
    id: 'have_medication',
    name: 'Have Medication',
    category: STATUS_CATEGORIES.RESOURCES,
    icon: '💊',
    color: '#10b981',
    description: 'Have necessary medications'
  },
  {
    id: 'need_medication',
    name: 'Need Medication',
    category: STATUS_CATEGORIES.RESOURCES,
    icon: '💊',
    color: '#dc2626',
    description: 'Need medications urgently'
  },
  {
    id: 'have_cash',
    name: 'Have Cash',
    category: STATUS_CATEGORIES.RESOURCES,
    icon: '💵',
    color: '#10b981',
    description: 'Have cash on hand'
  },
  {
    id: 'need_cash',
    name: 'Need Cash',
    category: STATUS_CATEGORIES.RESOURCES,
    icon: '💵',
    color: '#f59e0b',
    description: 'Need cash (ATMs down)'
  },

  // ============================================================================
  // MEDICAL STATUS
  // ============================================================================
  {
    id: 'healthy',
    name: 'Healthy',
    category: STATUS_CATEGORIES.MEDICAL,
    icon: '💪',
    color: '#10b981',
    description: 'Everyone is healthy'
  },
  {
    id: 'need_medical',
    name: 'Need Medical Care',
    category: STATUS_CATEGORIES.MEDICAL,
    icon: '⚕️',
    color: '#dc2626',
    description: 'Need medical attention'
  },
  {
    id: 'chronic_condition',
    name: 'Managing Chronic Condition',
    category: STATUS_CATEGORIES.MEDICAL,
    icon: '💊',
    color: '#f59e0b',
    description: 'Managing chronic health condition'
  },
  {
    id: 'elderly_care',
    name: 'Caring for Elderly',
    category: STATUS_CATEGORIES.MEDICAL,
    icon: '👴',
    color: '#f59e0b',
    description: 'Responsible for elderly person'
  },
  {
    id: 'disability_needs',
    name: 'Special Needs',
    category: STATUS_CATEGORIES.MEDICAL,
    icon: '♿',
    color: '#f59e0b',
    description: 'Have disability/mobility needs'
  },
  {
    id: 'with_children',
    name: 'With Children',
    category: STATUS_CATEGORIES.MEDICAL,
    icon: '👶',
    color: '#3b82f6',
    description: 'Caring for children'
  },
  {
    id: 'with_pets',
    name: 'With Pets',
    category: STATUS_CATEGORIES.MEDICAL,
    icon: '🐕',
    color: '#3b82f6',
    description: 'Have pets with me'
  },

  // ============================================================================
  // ASSISTANCE STATUS
  // ============================================================================
  {
    id: 'can_help_others',
    name: 'Can Help Others',
    category: STATUS_CATEGORIES.ASSISTANCE,
    icon: '🤝',
    color: '#10b981',
    description: 'Able to assist others'
  },
  {
    id: 'have_shelter_space',
    name: 'Shelter Available',
    category: STATUS_CATEGORIES.ASSISTANCE,
    icon: '🏠',
    color: '#3b82f6',
    description: 'Can provide shelter'
  },
  {
    id: 'can_provide_food',
    name: 'Food Available',
    category: STATUS_CATEGORIES.ASSISTANCE,
    icon: '🍽️',
    color: '#10b981',
    description: 'Can share food'
  },
  {
    id: 'can_provide_water',
    name: 'Water Available',
    category: STATUS_CATEGORIES.ASSISTANCE,
    icon: '💧',
    color: '#10b981',
    description: 'Can share water'
  },
  {
    id: 'can_transport',
    name: 'Can Drive/Transport',
    category: STATUS_CATEGORIES.ASSISTANCE,
    icon: '🚗',
    color: '#10b981',
    description: 'Can provide transportation'
  },
  {
    id: 'need_transport',
    name: 'Need Transportation',
    category: STATUS_CATEGORIES.ASSISTANCE,
    icon: '🚗',
    color: '#dc2626',
    description: 'Need ride/transportation'
  },
  {
    id: 'have_tools',
    name: 'Have Tools/Equipment',
    category: STATUS_CATEGORIES.ASSISTANCE,
    icon: '🔧',
    color: '#10b981',
    description: 'Have tools to help'
  },
  {
    id: 'medical_professional',
    name: 'Medical Professional',
    category: STATUS_CATEGORIES.ASSISTANCE,
    icon: '⚕️',
    color: '#10b981',
    description: 'Medical training/can help'
  },
  {
    id: 'first_responder',
    name: 'First Responder',
    category: STATUS_CATEGORIES.ASSISTANCE,
    icon: '🚒',
    color: '#dc2626',
    description: 'Fire/police/EMT on duty'
  },

  // ============================================================================
  // INFRASTRUCTURE STATUS
  // ============================================================================
  {
    id: 'have_power',
    name: 'Have Electricity',
    category: STATUS_CATEGORIES.INFRASTRUCTURE,
    icon: '⚡',
    color: '#10b981',
    description: 'Power is on'
  },
  {
    id: 'no_power',
    name: 'No Electricity',
    category: STATUS_CATEGORIES.INFRASTRUCTURE,
    icon: '⚡',
    color: '#dc2626',
    description: 'Power is out'
  },
  {
    id: 'have_generator',
    name: 'Have Generator',
    category: STATUS_CATEGORIES.INFRASTRUCTURE,
    icon: '🔌',
    color: '#10b981',
    description: 'Running on generator'
  },
  {
    id: 'have_internet',
    name: 'Have Internet',
    category: STATUS_CATEGORIES.INFRASTRUCTURE,
    icon: '📶',
    color: '#10b981',
    description: 'Internet is working'
  },
  {
    id: 'no_internet',
    name: 'No Internet',
    category: STATUS_CATEGORIES.INFRASTRUCTURE,
    icon: '📶',
    color: '#f59e0b',
    description: 'Internet is down'
  },
  {
    id: 'have_cell_service',
    name: 'Have Cell Service',
    category: STATUS_CATEGORIES.INFRASTRUCTURE,
    icon: '📱',
    color: '#10b981',
    description: 'Cell phone working'
  },
  {
    id: 'no_cell_service',
    name: 'No Cell Service',
    category: STATUS_CATEGORIES.INFRASTRUCTURE,
    icon: '📱',
    color: '#dc2626',
    description: 'No cell signal'
  },
  {
    id: 'have_running_water',
    name: 'Have Running Water',
    category: STATUS_CATEGORIES.INFRASTRUCTURE,
    icon: '🚰',
    color: '#10b981',
    description: 'Water system working'
  },
  {
    id: 'no_running_water',
    name: 'No Running Water',
    category: STATUS_CATEGORIES.INFRASTRUCTURE,
    icon: '🚰',
    color: '#dc2626',
    description: 'Water is out'
  },
  {
    id: 'have_heat',
    name: 'Have Heat',
    category: STATUS_CATEGORIES.INFRASTRUCTURE,
    icon: '🔥',
    color: '#10b981',
    description: 'Heating is working'
  },
  {
    id: 'no_heat',
    name: 'No Heat',
    category: STATUS_CATEGORIES.INFRASTRUCTURE,
    icon: '🔥',
    color: '#dc2626',
    description: 'No heating'
  },
  {
    id: 'have_ac',
    name: 'Have Air Conditioning',
    category: STATUS_CATEGORIES.INFRASTRUCTURE,
    icon: '❄️',
    color: '#10b981',
    description: 'AC is working'
  },
  {
    id: 'no_ac',
    name: 'No Air Conditioning',
    category: STATUS_CATEGORIES.INFRASTRUCTURE,
    icon: '❄️',
    color: '#dc2626',
    description: 'AC is out'
  },
  {
    id: 'have_gas',
    name: 'Have Gas',
    category: STATUS_CATEGORIES.INFRASTRUCTURE,
    icon: '⛽',
    color: '#10b981',
    description: 'Natural gas working'
  },
  {
    id: 'no_gas',
    name: 'No Gas',
    category: STATUS_CATEGORIES.INFRASTRUCTURE,
    icon: '⛽',
    color: '#dc2626',
    description: 'Gas service out'
  },

  // ============================================================================
  // TRANSPORTATION STATUS
  // ============================================================================
  {
    id: 'have_vehicle',
    name: 'Have Vehicle',
    category: STATUS_CATEGORIES.TRANSPORTATION,
    icon: '🚗',
    color: '#10b981',
    description: 'Have working vehicle'
  },
  {
    id: 'no_vehicle',
    name: 'No Vehicle',
    category: STATUS_CATEGORIES.TRANSPORTATION,
    icon: '🚗',
    color: '#dc2626',
    description: 'No transportation'
  },
  {
    id: 'have_fuel',
    name: 'Have Fuel',
    category: STATUS_CATEGORIES.TRANSPORTATION,
    icon: '⛽',
    color: '#10b981',
    description: 'Have gas for vehicle'
  },
  {
    id: 'need_fuel',
    name: 'Need Fuel',
    category: STATUS_CATEGORIES.TRANSPORTATION,
    icon: '⛽',
    color: '#dc2626',
    description: 'Need gas/fuel'
  },
  {
    id: 'roads_clear',
    name: 'Roads Clear',
    category: STATUS_CATEGORIES.TRANSPORTATION,
    icon: '🛣️',
    color: '#10b981',
    description: 'Roads are passable'
  },
  {
    id: 'roads_blocked',
    name: 'Roads Blocked',
    category: STATUS_CATEGORIES.TRANSPORTATION,
    icon: '🚧',
    color: '#dc2626',
    description: 'Roads are impassable'
  }
]

// Helper function to get status by ID
export const getStatusById = (id) => {
  return STATUS_TYPES.find(s => s.id === id)
}

// Helper function to get all statuses by category
export const getStatusesByCategory = (category) => {
  return STATUS_TYPES.filter(s => s.category === category)
}

// Helper function to get all positive statuses (green/have)
export const getPositiveStatuses = () => {
  return STATUS_TYPES.filter(s =>
    s.id.startsWith('have_') ||
    s.id.startsWith('can_') ||
    ['safe', 'healthy', 'evacuated', 'roads_clear'].includes(s.id)
  )
}

// Helper function to get all need/emergency statuses (red)
export const getNeedStatuses = () => {
  return STATUS_TYPES.filter(s =>
    s.id.startsWith('need_') ||
    s.id.startsWith('no_') ||
    ['injured', 'trapped', 'isolated', 'evacuating'].includes(s.id)
  )
}

export default STATUS_TYPES