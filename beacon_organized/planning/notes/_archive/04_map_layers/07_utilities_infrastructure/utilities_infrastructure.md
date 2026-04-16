### 4.7 Utilities & Infrastructure

A collection of sub-layers. In the interface, infrastructure layers should be categorized together and the user should be able to select water, gas, power, etc. individually.

- Automatically identify as much as possible from map builder
- Special accounts for utility providers to designate coverage zones
- If users report power/water outages, utilities can assume that zone is affected
- **Water lines:** Location and provider. Interface for utilities to draw and place.
- Water mains
- **Gas lines:** Location and provider
- How each building gets power
- Cell tower locations (identify via satellite + LiDAR combination)
- **Power lines:** Location and provider. Identified via street-view (primary) and LiDAR + satellite (height, routing between poles).
- **Fire hydrants with pressure rating** (identified via street-view CV)
- Water towers, wells
- **Pools as water sources** (identified via satellite/LiDAR for fire suppression potential)
- Power grid status layer (clearly show confirmed power-off areas; notify EMS of mismatches e.g., downed power line blocking road but power still on)

