/**
 * Custom vector tile style for Beacon maps.
 *
 * Every layer (buildings, roads, water, land, labels, contours) is individually
 * controllable. Colors, visibility, line weights — all customizable.
 *
 * Uses OpenMapTiles schema from Protomaps PMTiles source.
 */

import { PMTILES_URL } from './pmtiles-setup';

/** Beacon map color palette — edit these to restyle everything */
export const COLORS = {
  // Backgrounds
  land: '#f0ede6',
  water: '#c4daf0',
  waterLabel: '#6b9dc9',

  // Buildings
  building: '#d9d0c5',
  buildingOutline: '#c5bdb3',

  // Roads
  motorway: '#f5c36f',
  major: '#ffffff',
  minor: '#f0f0f0',
  road_outline: '#d6d1c9',

  // Nature
  park: '#d4e8c2',
  forest: '#c8ddb5',
  grass: '#dfe8d4',

  // Labels
  labelCity: '#333333',
  labelTown: '#555555',
  labelStreet: '#777777',

  // Contours
  contour: '#c9b9a0',
  contourLabel: '#a09080',
};

/** Dark variant */
export const COLORS_DARK = {
  land: '#1a1e24',
  water: '#13171d',
  waterLabel: '#4a6a8a',
  building: '#252a32',
  buildingOutline: '#1e2228',
  motorway: '#4a4030',
  major: '#2a2e34',
  minor: '#22262c',
  road_outline: '#1a1e24',
  park: '#1a2418',
  forest: '#162014',
  grass: '#1e2a1a',
  labelCity: '#c0c0c0',
  labelTown: '#909090',
  labelStreet: '#606060',
  contour: '#2a2520',
  contourLabel: '#4a4030',
};

/** Generate a full MapLibre style spec from a color palette */
export function createStyle(
  palette = COLORS,
  pmtilesUrl = PMTILES_URL,
): Record<string, unknown> {
  const src = pmtilesUrl.startsWith('http')
    ? `pmtiles://${pmtilesUrl}`
    : pmtilesUrl;

  return {
    version: 8,
    name: 'Beacon Custom',
    sources: {
      protomaps: {
        type: 'vector',
        url: src,
        attribution: '&copy; OpenStreetMap contributors',
      },
    },
    glyphs: 'https://cdn.protomaps.com/fonts/pbf/{fontstack}/{range}.pbf',
    layers: [
      // Background
      { id: 'background', type: 'background', paint: { 'background-color': palette.land } },

      // Water
      {
        id: 'water',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'water',
        paint: { 'fill-color': palette.water },
      },

      // Parks / green areas
      {
        id: 'park',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'landuse',
        filter: ['in', 'pmap:kind', 'park', 'garden', 'playground'],
        paint: { 'fill-color': palette.park },
      },
      {
        id: 'forest',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'landuse',
        filter: ['in', 'pmap:kind', 'forest', 'wood'],
        paint: { 'fill-color': palette.forest },
      },

      // Buildings
      {
        id: 'buildings',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'buildings',
        minzoom: 13,
        paint: {
          'fill-color': palette.building,
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 15, 0.8],
        },
      },
      {
        id: 'buildings-outline',
        type: 'line',
        source: 'protomaps',
        'source-layer': 'buildings',
        minzoom: 14,
        paint: {
          'line-color': palette.buildingOutline,
          'line-width': 0.5,
        },
      },

      // Roads
      {
        id: 'roads-motorway',
        type: 'line',
        source: 'protomaps',
        'source-layer': 'roads',
        filter: ['in', 'pmap:kind', 'highway', 'motorway'],
        paint: {
          'line-color': palette.motorway,
          'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.5, 12, 2, 16, 6],
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      },
      {
        id: 'roads-major',
        type: 'line',
        source: 'protomaps',
        'source-layer': 'roads',
        filter: ['in', 'pmap:kind', 'major_road', 'trunk', 'primary', 'secondary'],
        paint: {
          'line-color': palette.major,
          'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.3, 14, 2, 16, 4],
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      },
      {
        id: 'roads-minor',
        type: 'line',
        source: 'protomaps',
        'source-layer': 'roads',
        filter: ['in', 'pmap:kind', 'minor_road', 'tertiary', 'residential', 'service'],
        minzoom: 12,
        paint: {
          'line-color': palette.minor,
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.3, 16, 2],
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      },

      // Place labels
      {
        id: 'label-city',
        type: 'symbol',
        source: 'protomaps',
        'source-layer': 'places',
        filter: ['in', 'pmap:kind', 'city'],
        layout: {
          'text-field': '{name}',
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 4, 10, 8, 16],
        },
        paint: { 'text-color': palette.labelCity, 'text-halo-color': palette.land, 'text-halo-width': 1.5 },
      },
      {
        id: 'label-town',
        type: 'symbol',
        source: 'protomaps',
        'source-layer': 'places',
        filter: ['in', 'pmap:kind', 'town', 'village'],
        minzoom: 8,
        layout: {
          'text-field': '{name}',
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 8, 9, 12, 13],
        },
        paint: { 'text-color': palette.labelTown, 'text-halo-color': palette.land, 'text-halo-width': 1 },
      },
      {
        id: 'label-road',
        type: 'symbol',
        source: 'protomaps',
        'source-layer': 'roads',
        minzoom: 14,
        layout: {
          'text-field': '{name}',
          'text-font': ['Noto Sans Regular'],
          'text-size': 10,
          'symbol-placement': 'line',
          'text-rotation-alignment': 'map',
        },
        paint: { 'text-color': palette.labelStreet, 'text-halo-color': palette.land, 'text-halo-width': 1 },
      },

      // Water labels
      {
        id: 'label-water',
        type: 'symbol',
        source: 'protomaps',
        'source-layer': 'water',
        layout: {
          'text-field': '{name}',
          'text-font': ['Noto Sans Italic'],
          'text-size': 12,
        },
        paint: { 'text-color': palette.waterLabel },
      },
    ],
  };
}
