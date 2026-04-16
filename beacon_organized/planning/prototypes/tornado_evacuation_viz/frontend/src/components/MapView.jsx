import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { destinationPoint } from '../utils/geoUtils';
import { EF_SCALE } from '../utils/tornadoProjection';
import './MapView.css';

// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1Ijoia3JtdWxsYW5leSIsImEiOiJjbWh5MjB2YmQwNzllMm1vbW5jOWU4cGhlIn0.0CaogNEXV19BG4Qbil_xOw';

function MapView({ scenario, tornadoPath, peopleWithDecisions, currentTime, layers }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef({});
  const [mapError, setMapError] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.error('WebGL not supported');
      setMapError('WebGL not supported in this browser. Mapbox requires WebGL.');
      return;
    }

    console.log('Initializing Mapbox map...');
    console.log('Token:', mapboxgl.accessToken ? 'Present' : 'Missing');
    console.log('Center:', scenario.center);

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: scenario.center,
        zoom: 11,
        attributionControl: false
      });

      map.current.on('load', () => {
        console.log('✓ Map loaded successfully');
        map.current.isReady = true;
        setMapReady(true);
        setMapError(null);
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error event:', e);

        // Check if it's a 403 error (invalid token)
        if (e.error?.status === 403 || e.error?.message?.includes('401') || e.error?.message?.includes('403')) {
          setMapError('Invalid Mapbox access token. Please get a free token at https://account.mapbox.com/');
          return;
        }

        const errorMsg = e.error?.message || e.message || 'Map tiles failed to load';
        setMapError(`Mapbox error: ${errorMsg}`);
      });

      map.current.on('style.load', () => {
        console.log('✓ Map style loaded');
      });

      // Add a timeout to detect if map never loads
      setTimeout(() => {
        if (!map.current?.isReady) {
          console.warn('⚠ Map taking longer than expected to load');
          console.log('Map state:', map.current ? 'exists' : 'null');
        }
      }, 5000);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(`Failed to initialize map: ${error.message}`);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [scenario.center]);

  // Update tornado path
  useEffect(() => {
    console.log('Tornado path effect triggered', {
      mapReady: map.current?.isReady,
      pathLength: tornadoPath?.length,
      layerEnabled: layers.tornadoPath
    });

    if (!map.current || !map.current.isReady) return;
    if (!tornadoPath || tornadoPath.length === 0) return;
    if (!layers.tornadoPath) return;

    try {
      const pathCoordinates = tornadoPath.map(p => p.position);
      console.log('Drawing tornado path with', pathCoordinates.length, 'points');

      // Add tornado path line
      if (map.current.getSource('tornado-path')) {
        map.current.getSource('tornado-path').setData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: pathCoordinates
          }
        });
      } else {
        map.current.addSource('tornado-path', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: pathCoordinates
            }
          }
        });

        map.current.addLayer({
          id: 'tornado-path-line',
          type: 'line',
          source: 'tornado-path',
          paint: {
            'line-color': '#ff0000',
            'line-width': 3,
            'line-dasharray': [2, 2]
          }
        });
      }

      // Add danger zones (2-mile and 5-mile buffers)
      if (layers.dangerZones) {
        renderDangerZones(map.current, tornadoPath);
      }

      // Add timestamps
      if (layers.timestamps) {
        renderTimestamps(map.current, tornadoPath, markers);
      }
    } catch (error) {
      console.error('Error updating tornado path:', error);
    }
  }, [tornadoPath, layers.tornadoPath, layers.dangerZones, layers.timestamps, mapReady]);

  // Update current tornado position
  useEffect(() => {
    if (!map.current || !map.current.isReady) return;
    if (!tornadoPath || tornadoPath.length === 0) return;

    try {
      // Find current position based on time
      const currentIndex = Math.floor(currentTime / 5); // 5-minute intervals
      const currentPos = tornadoPath[Math.min(currentIndex, tornadoPath.length - 1)];

      if (!markers.current.tornado) {
        const el = document.createElement('div');
        el.className = 'tornado-marker';
        el.innerHTML = '🌪️';
        el.style.fontSize = '32px';

        markers.current.tornado = new mapboxgl.Marker(el)
          .setLngLat(currentPos.position)
          .addTo(map.current);
      } else {
        markers.current.tornado.setLngLat(currentPos.position);
      }
    } catch (error) {
      console.error('Error updating tornado position:', error);
    }
  }, [currentTime, tornadoPath, mapReady]);

  // Render buildings
  useEffect(() => {
    console.log('Buildings effect triggered', {
      mapReady: map.current?.isReady,
      hasScenario: !!scenario,
      hasBuildings: !!scenario?.buildings,
      layerEnabled: layers.buildings,
      trailerParks: scenario?.buildings?.trailerParks?.length,
      commercial: scenario?.buildings?.commercial?.length
    });

    if (!map.current || !map.current.isReady) return;
    if (!scenario || !scenario.buildings) return;
    if (!layers.buildings) return;

    try {
      renderBuildings(map.current, scenario.buildings, markers);
    } catch (error) {
      console.error('Error rendering buildings:', error);
    }
  }, [scenario, layers.buildings, mapReady]);

  // Render shelters
  useEffect(() => {
    if (!map.current || !map.current.isReady) return;
    if (!scenario || !scenario.buildings || !scenario.buildings.shelters) return;
    if (!layers.shelters) return;

    try {
      renderShelters(map.current, scenario.buildings.shelters, markers);
    } catch (error) {
      console.error('Error rendering shelters:', error);
    }
  }, [scenario, layers.shelters, mapReady]);

  // Render people
  useEffect(() => {
    if (!map.current || !map.current.isReady) return;
    if (!peopleWithDecisions || peopleWithDecisions.length === 0) return;
    if (!layers.people) return;

    try {
      renderPeople(map.current, peopleWithDecisions, markers);
    } catch (error) {
      console.error('Error rendering people:', error);
    }
  }, [peopleWithDecisions, layers.people, mapReady]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} className="map" />
      {mapError && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 0, 0, 0.9)',
          color: '#fff',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '500px',
          textAlign: 'center',
          zIndex: 1000
        }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>⚠️ Map Error</div>
          <div style={{ fontSize: '14px', marginBottom: '15px' }}>{mapError}</div>
          {mapError.includes('access token') && (
            <div style={{ fontSize: '13px', marginTop: '15px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', textAlign: 'left' }}>
              <strong>To fix this:</strong>
              <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
                <li>Go to <a href="https://account.mapbox.com/" target="_blank" style={{ color: '#66ccff' }}>https://account.mapbox.com/</a></li>
                <li>Sign up for a free account</li>
                <li>Copy your default public token</li>
                <li>Replace the token in <code style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 4px', borderRadius: '2px' }}>frontend/src/components/MapView.jsx</code> line 10</li>
              </ol>
            </div>
          )}
          <div style={{ fontSize: '12px', marginTop: '10px', color: '#ffcccc' }}>
            Check browser console for details
          </div>
        </div>
      )}
    </div>
  );
}

function renderDangerZones(map, tornadoPath) {
  const pathCoordinates = tornadoPath.map(p => p.position);

  // Create buffer polygons
  const buffer2Mile = createBufferPolygon(pathCoordinates, 2);
  const buffer5Mile = createBufferPolygon(pathCoordinates, 5);

  // Add 5-mile zone
  if (map.getSource('danger-zone-5')) {
    map.getSource('danger-zone-5').setData(buffer5Mile);
  } else {
    map.addSource('danger-zone-5', {
      type: 'geojson',
      data: buffer5Mile
    });

    map.addLayer({
      id: 'danger-zone-5-fill',
      type: 'fill',
      source: 'danger-zone-5',
      paint: {
        'fill-color': '#ffff00',
        'fill-opacity': 0.1
      }
    });
  }

  // Add 2-mile zone
  if (map.getSource('danger-zone-2')) {
    map.getSource('danger-zone-2').setData(buffer2Mile);
  } else {
    map.addSource('danger-zone-2', {
      type: 'geojson',
      data: buffer2Mile
    });

    map.addLayer({
      id: 'danger-zone-2-fill',
      type: 'fill',
      source: 'danger-zone-2',
      paint: {
        'fill-color': '#ff0000',
        'fill-opacity': 0.2
      }
    });
  }
}

function createBufferPolygon(pathCoordinates, radiusMiles) {
  // Simplified: create circles around each point and merge
  const allCoords = [];

  pathCoordinates.forEach(center => {
    const circle = [];
    for (let i = 0; i <= 32; i++) {
      const angle = (i / 32) * 360;
      const point = destinationPoint(center, angle, radiusMiles);
      circle.push(point);
    }
    allCoords.push(circle);
  });

  // Return first circle for simplicity (proper implementation would merge)
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: allCoords[0] ? [allCoords[0]] : [[]]
    }
  };
}

function renderTimestamps(map, tornadoPath, markers) {
  // Clear old timestamp markers
  Object.keys(markers.current).forEach(key => {
    if (key.startsWith('timestamp-')) {
      markers.current[key].remove();
      delete markers.current[key];
    }
  });

  tornadoPath.forEach((point, index) => {
    const el = document.createElement('div');
    el.className = 'timestamp-marker';
    el.innerHTML = `
      <div class="timestamp-content">
        T+${point.time}min<br/>
        <span class="ef-rating">EF${point.strength}</span>
      </div>
    `;

    markers.current[`timestamp-${index}`] = new mapboxgl.Marker(el)
      .setLngLat(point.position)
      .addTo(map);
  });
}

function renderBuildings(map, buildings, markers) {
  if (!map || !map.getCanvasContainer()) {
    console.warn('Map not ready for building markers');
    return;
  }

  // Clear old building markers
  Object.keys(markers.current).forEach(key => {
    if (key.startsWith('building-')) {
      try {
        markers.current[key].remove();
      } catch (e) {
        console.warn('Error removing marker:', e);
      }
      delete markers.current[key];
    }
  });

  // Render trailer parks (vulnerable)
  buildings.trailerParks.forEach(building => {
    try {
      const el = document.createElement('div');
      el.className = 'building-marker vulnerable';
      el.innerHTML = '🏘️';
      el.title = building.name;

      markers.current[`building-${building.id}`] = new mapboxgl.Marker(el)
        .setLngLat(building.position)
        .setPopup(new mapboxgl.Popup().setHTML(`
          <strong>${building.name}</strong><br/>
          Capacity: ${building.capacity}<br/>
          Shelter Rating: ${building.shelterRating}/5
        `))
        .addTo(map);
    } catch (error) {
      console.warn('Error adding building marker:', error);
    }
  });

  // Render commercial buildings
  buildings.commercial.forEach(building => {
    const el = document.createElement('div');
    el.className = 'building-marker commercial';
    el.innerHTML = '🏢';
    el.title = building.name;

    markers.current[`building-${building.id}`] = new mapboxgl.Marker(el)
      .setLngLat(building.position)
      .addTo(map);
  });
}

function renderShelters(map, shelters, markers) {
  // Clear old shelter markers
  Object.keys(markers.current).forEach(key => {
    if (key.startsWith('shelter-')) {
      markers.current[key].remove();
      delete markers.current[key];
    }
  });

  shelters.forEach(shelter => {
    const el = document.createElement('div');
    el.className = 'shelter-marker';
    el.innerHTML = '🏥';
    el.title = shelter.name;

    markers.current[`shelter-${shelter.id}`] = new mapboxgl.Marker(el)
      .setLngLat(shelter.position)
      .setPopup(new mapboxgl.Popup().setHTML(`
        <strong>${shelter.name}</strong><br/>
        Capacity: ${shelter.capacity}<br/>
        Shelter Rating: ${shelter.shelterRating}/5<br/>
        ${shelter.hasBasement ? '✓ Has Basement' : ''}
      `))
      .addTo(map);
  });
}

function renderPeople(map, people, markers) {
  // For performance, only show a sample of people
  const sampleSize = Math.min(50, people.length);
  const samplePeople = people.slice(0, sampleSize);

  // Clear old people markers
  Object.keys(markers.current).forEach(key => {
    if (key.startsWith('person-')) {
      markers.current[key].remove();
      delete markers.current[key];
    }
  });

  samplePeople.forEach(person => {
    const el = document.createElement('div');
    el.className = `person-marker ${person.decision.action.toLowerCase().replace('_', '-')}`;

    // Icon based on status
    if (person.status === 'driving') {
      el.innerHTML = '🚗';
    } else {
      el.innerHTML = '👤';
    }

    const actionColors = {
      'MONITOR': '#00ff00',
      'SHELTER_IN_PLACE': '#ffff00',
      'EVACUATE': '#ff9900',
      'EVACUATE_URGENTLY': '#ff0000'
    };

    el.style.filter = `drop-shadow(0 0 3px ${actionColors[person.decision.action] || '#fff'})`;

    markers.current[`person-${person.id}`] = new mapboxgl.Marker(el)
      .setLngLat(person.location)
      .setPopup(new mapboxgl.Popup().setHTML(`
        <strong>Person ${person.id}</strong><br/>
        Location: ${person.locationType}<br/>
        <strong>${person.decision.action}</strong><br/>
        ${person.decision.reason}
      `))
      .addTo(map);
  });
}

export default MapView;
