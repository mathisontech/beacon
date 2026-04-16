# GPS Manager

This folder contains GPS-related functionality for the beacon module.

## Structure

- `LocationService.js` - JavaScript location service for frontend
- `map_tile_extraction/` - Complete OSM tile extraction system for ML training data
- `osm_env/` - Python virtual environment for OSM extraction

## Map Tile Extraction

The `map_tile_extraction/` folder contains a comprehensive system for systematically extracting OpenStreetMap tiles for machine learning training data:

### Features
- **Systematic grid coverage** of the continental US (25km x 25km grids)
- **Visual progress tracking** with color-coded maps
- **Interactive Jupyter notebook** with control panels
- **Fast concurrent downloading** with rate limiting
- **Complete progress monitoring** and resumable extraction

### Quick Start
```bash
cd map_tile_extraction
jupyter notebook OSM_Tile_Extractor.ipynb
```

See `map_tile_extraction/README_OSM_Extractor.md` for detailed documentation.