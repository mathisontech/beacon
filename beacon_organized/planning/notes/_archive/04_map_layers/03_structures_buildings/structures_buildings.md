### 4.3 Structures & Buildings

## Still Needs Research
- Building code lookup by country/city/type at scale
- Soft story identification from LiDAR data
- Hours of operation data sources and maintenance
- Building purpose CV model training on street-view data
- Shelter viability scoring (multiple dimensions: capacity, durability, access)
- Sheltering access during locked hours (keys, garage codes)
- Historic site identification and special protection requirements
- Walk-in freezer location and capacity database
- Refugee center vs. shelter categorization
- Apartment count estimation from facade analysis

Each building should aggregate all descriptive info:

- Type/purpose (residential, commercial, office, storefront, mall, public, etc.)
- Address
- Year built
- Presumed building codes (module that collects country/city codes by building type — relevant for earthquake and tornado damage prediction)
- Roof features (for snow collapse model + helicopter landing assessment)
- Building materials
- Number of floors
- Number of apartments/units (for evacuation count)
- Soft story identification
- Exits and entrances (assembled from OSM, street-view, sensor data)
- Building distances from each other
- Power source per building (including backup like fireplace)
- Heating method (gas, electric, oil, solar)
- Commercial vs. private (with time-of-day accessibility — e.g., corporate office locked after hours, residential locked by default)
- Fence details: type, rammability, gate locks, whether bolt cutters could work
- **Building age layer:** Year built data (county assessor records primary, street-view CV estimation secondary). Feeds into building codes and building vulnerability models.
- **Building material predictor layer:** Street-view CV identifies visible materials. Feeds into shelter prediction (including flammability) and building purpose prediction.
- **Building purpose layer:** Used for shelter viability and population layers. Residential, commercial, industrial, public, etc.
- **Space between structures:** Measured from LiDAR. Critical for fire spread modeling and burn together groups.
- **Open doors model (sheltering access):** Residential vs. commercial model. Where are there shelters a user can run to at any given time? Uses building purpose + hours of operation + time of day. Google/OSM for hours; street-view for entrance visibility.
- **Camping grounds:** OSM + satellite for tagged locations and clearing identification. Useful to distinguish campfire smoke from wildfire smoke.

**Building subcategories:**

- Hospitals, police stations, firehouses, urgent care
- Pharmacies (anaphylactic shock — go to Walgreens if can't reach hospital; goes in user guide)
- Schools, nursing homes, retirement communities, jails, prisons
- Historic sites
- Big box stores (Target, Walmart, Home Depot, Lowes — for collapse risk), supermarkets
- Places with walk-in freezers (tornado sheltering): beer stores, ice cream stores, restaurants
- Places with bank vaults (tornado/blast sheltering)
- Churches / mosques / temples / houses of worship (identify via Mapillary street-view CV)
- Homeless shelters
- Single family homes, condos/connected single family houses
- Apartment buildings, office buildings (note: closed on weekends)
- Storefronts, glass-front stores (vulnerability), malls, retail shops
- Hotels, museums, restaurants, summer camps
- Gas stations, ammunition stores (hazard risk)
- Hazardous chemical plants, nuclear facilities
- Factories
- Trailer parks (high risk for tornadoes)
- Public buildings with open hours (libraries, legislative buildings)
- Bus depots, train stations, surf shacks, marinas
- Subway stations (depth data for radiation sheltering; some are essentially shelters)

