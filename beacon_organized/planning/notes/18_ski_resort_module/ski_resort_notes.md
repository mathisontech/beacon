# Ski Resort Module

## Run Mapping

Automatic processor scans published trail maps (georeferenced PDFs/images) and extracts run polygons using image segmentation. Matched against DEM for slope angle, aspect, and elevation profile. Ski patrol can adjust boundaries via drawing tools.

Run attributes: name, difficulty (green/blue/black/double-black), groomed status, width, vertical drop, average grade, aspect. Updated by ski patrol daily or by user reports.

## User Tracking and Condition Reporting

Users tracked via GPS when descending runs. Post-run prompt asks conditions (1-5 scale): snow quality, ice patches, moguls, visibility, crowding. Aggregated into real-time condition heatmap visible to all users.

Users can report: needing help (triggers ski patrol alert with GPS location), obstacles (fallen tree, exposed rock), closed/roped areas being violated, lost/missing person.

## Avalanche Risk Layer

Snowpack model integration: pulls from regional avalanche centers (UAC, CAIC, NWAC, SAC — 22 US centers). Danger rating (1-5 Low to Extreme) displayed per aspect/elevation band.

Ski patrol inputs: mark controlled avalanche locations (where they did explosions), report runoff volume triggered (indicates whether unstable snow was fully released), mark persistent weak layer observations. This data feeds back into the avalanche hazard model (see 04_avalanche).

Risk visualization: color-coded overlay on resort map showing danger by aspect. Red zones = extreme avalanche terrain (>35 degree slopes with overhead loading). Yellow = considerable. Green = low.

## Ski Patrol Special Account

On-mountain coordination tools: real-time location of all patrol members, dispatch to incidents, zone assignment, radio channel integration notes. Patrol can mark: open/closed runs, grooming status, hazard locations, lift status.

Sweep tracking: end-of-day sweep mode where patrol systematically clears the mountain. Each run marked as swept when patrol descends it. Missing sweeps flagged.

Incident logging: injury type, location, transport method (toboggan, snowmobile, helicopter), hospital destination. Feeds into resort safety analytics.

## Boundary and Backcountry

Resort boundary polygon visible to all users. Alerts triggered when user approaches boundary (especially in poor visibility). Backcountry gates marked with signage info and avalanche advisory for terrain beyond.

Integration with backcountry hazard model (see 22_backcountry) for users who exit resort boundaries.
