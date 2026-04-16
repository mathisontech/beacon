# OSM Map Tile Extractor for Intersection Detection

A systematic tool for extracting OpenStreetMap tiles to create training datasets for machine learning models that identify road intersections.

## Features

✅ **Systematic Grid Coverage** - Downloads map tiles in organized grid patterns
✅ **US Regional Presets** - Predefined regions (California, Texas, NYC, etc.)
✅ **Custom Bounding Boxes** - Define any geographic area
✅ **Progress Tracking** - Resume interrupted downloads
✅ **Rate Limiting** - Respects OSM server guidelines
✅ **Organized Storage** - Structured directories for training workflow
✅ **Metadata Generation** - Coordinates and info for each tile

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Extract a Region
```bash
# Download tiles for California at zoom level 16
python osm_data_extractor.py --region california --zoom 16

# Download tiles for a custom area
python osm_data_extractor.py --bbox 37.7749,-122.4194,37.8049,-122.3894 --zoom 16
```

### 3. Check Available Regions
```bash
python osm_data_extractor.py --list-regions
```

## Usage Examples

### Small Test Area (San Francisco Downtown)
```bash
# Small area for testing - ~400 tiles
python osm_data_extractor.py --bbox 37.7849,-122.4094,37.7949,-122.3994 --zoom 16
```

### State-Level Coverage
```bash
# California - ~2.5 million tiles at zoom 16
python osm_data_extractor.py --region california --zoom 16

# Texas - ~4.1 million tiles at zoom 16
python osm_data_extractor.py --region texas --zoom 16
```

### Continental US Coverage
```bash
# Entire continental US - ~85 million tiles at zoom 16
python osm_data_extractor.py --region continental_us --zoom 16
```

### Different Zoom Levels
```bash
# Lower resolution for broader coverage
python osm_data_extractor.py --region california --zoom 14

# Higher resolution for detailed intersections
python osm_data_extractor.py --region california --zoom 17
```

## Directory Structure

After running, your data will be organized as:

```
osm_training_data/
├── tiles/              # Raw PNG map tiles (256x256px)
├── metadata/           # JSON files with coordinates for each tile
├── annotations/        # Directory for manual labels (you create these)
├── processed/          # Preprocessed data for training
├── progress/           # Progress tracking files
├── progress.db         # SQLite database tracking download progress
└── training_manifest.json  # Complete dataset manifest
```

## Zoom Level Guide

| Zoom | Resolution | Use Case | Tiles for CA | Tiles for US |
|------|------------|----------|--------------|--------------|
| 14   | ~38m/pixel | City-level intersections | ~160K | ~5.3M |
| 15   | ~19m/pixel | Major road intersections | ~640K | ~21M |
| 16   | ~9.5m/pixel | **Recommended** detailed intersections | ~2.5M | ~85M |
| 17   | ~4.8m/pixel | Very detailed, small intersections | ~10M | ~340M |

## Rate Limiting & Ethics

- **Rate Limited**: 1 request per 1.1 seconds (respects OSM guidelines)
- **Resumable**: Can restart interrupted downloads
- **Progress Tracking**: SQLite database tracks what's been downloaded
- **Respectful**: Includes proper User-Agent header

## Training Workflow

### 1. Download Map Tiles
```bash
# Start with a small test region
python osm_data_extractor.py --bbox 37.7849,-122.4094,37.7949,-122.3994 --zoom 16
```

### 2. Manual Annotation
Use your preferred annotation tool to label intersections in the downloaded tiles. Suggested tools:
- **LabelImg** - For bounding boxes
- **CVAT** - Web-based annotation platform
- **VGG Image Annotator** - Lightweight browser tool

### 3. Create Training Manifest
```bash
python osm_data_extractor.py --create-manifest --zoom 16
```

This creates `training_manifest.json` with all tile information for your ML pipeline.

## Advanced Usage

### Resume Interrupted Downloads
The script automatically resumes - just run the same command again:
```bash
# This will continue where it left off
python osm_data_extractor.py --region california --zoom 16
```

### Custom Output Directory
```bash
python osm_data_extractor.py --region texas --zoom 16 --output /path/to/custom/dir
```

### Progress Monitoring
Check the SQLite database for detailed progress:
```python
import sqlite3
conn = sqlite3.connect('osm_training_data/progress.db')
cursor = conn.execute("SELECT COUNT(*) FROM tiles WHERE downloaded = 1")
print(f"Downloaded: {cursor.fetchone()[0]} tiles")
```

## Predefined Regions

- `continental_us` - Entire continental United States
- `california` - State of California
- `texas` - State of Texas
- `florida` - State of Florida
- `new_york` - New York state
- `chicago` - Chicago metropolitan area
- `los_angeles` - LA metropolitan area
- `seattle` - Seattle metropolitan area
- `denver` - Denver metropolitan area

## Time & Storage Estimates

### Small Test (1,000 tiles):
- **Download Time**: ~20 minutes
- **Storage**: ~15 MB

### City Coverage (100,000 tiles):
- **Download Time**: ~33 hours
- **Storage**: ~1.5 GB

### State Coverage (1,000,000 tiles):
- **Download Time**: ~14 days
- **Storage**: ~15 GB

### Continental US (85,000,000 tiles):
- **Download Time**: ~3.2 years (continuous)
- **Storage**: ~1.3 TB

**Recommendation**: Start with city-level regions and scale up based on your computational resources and timeline.

## Tips for ML Training

1. **Start Small**: Begin with 10,000-50,000 tiles for initial model development
2. **Balanced Dataset**: Include urban, suburban, and rural intersections
3. **Quality over Quantity**: Well-annotated smaller dataset beats poor large dataset
4. **Zoom Level**: Zoom 16 provides good detail-to-coverage balance
5. **Geographic Diversity**: Include different regions for better generalization

## Troubleshooting

### Slow Downloads
- Normal! OSM servers are rate-limited to 1 request/second
- Use lower zoom levels for faster broad coverage
- Consider using multiple regions in parallel

### Storage Issues
- Each tile is ~15KB on average
- Monitor disk space for large extractions
- Consider external storage for continental-scale datasets

### Network Errors
- Script automatically retries failed downloads
- Check internet connection
- OSM servers occasionally have brief outages

## Next Steps

After extracting your dataset:

1. **Annotate intersections** in a subset of tiles
2. **Train your model** using the annotated data
3. **Validate** on held-out geographic regions
4. **Scale up** with more data as needed

Good luck with your intersection detection model! 🚗🛣️