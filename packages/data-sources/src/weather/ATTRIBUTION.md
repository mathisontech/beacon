# Weather Data Source Attributions

All sources used here are cleared for commercial use. This file must stay in sync
with the UI attribution footer.

## NOAA National Hurricane Center (NHC)
- Endpoint: https://www.nhc.noaa.gov/CurrentStorms.json and per-storm GeoJSON under
  https://www.nhc.noaa.gov/storm_graphics/api/
- License: U.S. Government work, public domain (17 U.S.C. §105)
- Attribution (courtesy): "Hurricane data: NOAA / National Hurricane Center"

## NOAA National Weather Service
- Endpoint: https://api.weather.gov/
- License: Public domain
- Requires a User-Agent header

## NOAA NESDIS / MapServices (radar, alerts WMS)
- Endpoint: https://mapservices.weather.noaa.gov/
- License: Public domain
- Attribution (courtesy): "Imagery: NOAA NWS"

## NASA GIBS (Global Imagery Browse Services)
- Endpoint: https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/
- License: Public domain (NASA)
- Attribution (courtesy): "Imagery courtesy NASA EOSDIS GIBS"
- Used for: cloud cover (VIIRS true-color daily mosaic)

## GDACS (Global Disaster Alert and Coordination System)
- Endpoint: https://www.gdacs.org/gdacsapi/
- License: Free use including commercial; aggregates public-domain government data
- Attribution: "Data: GDACS" — appears in attribution footer

## Open-Meteo
- Endpoint: https://api.open-meteo.com/v1/forecast
- License: CC-BY 4.0 — free for commercial use WITH attribution
- Required attribution: "Weather data by Open-Meteo.com"

## Explicitly REJECTED (do not use without a paid license):
- RainViewer (non-commercial free tier)
- OpenWeatherMap free tier
- Windy API (restrictive)
- MetOffice, ECMWF direct feeds
