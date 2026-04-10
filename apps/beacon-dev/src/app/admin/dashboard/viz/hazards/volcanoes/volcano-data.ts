import type { Volcano } from "./types";

// Same shape as the live USGS HANS feed
// (@beacon/data-sources/volcano/usgs-volcanoes.ts).
// Swap lat/lng, add entries, or rewire `level` to test design.
export const VOLCANOES: Volcano[] = [
  // WARNING — red, pulsing, largest
  { id: "kilauea",       name: "Kīlauea",             region: "Hawaiʻi",         lat: 19.4069, lng: -155.2834, level: "warning",  elevation_m: 1247, last_eruption: "2024-09", obs: "HVO" },
  { id: "mauna-loa",     name: "Mauna Loa",           region: "Hawaiʻi",         lat: 19.4750, lng: -155.6080, level: "warning",  elevation_m: 4169, last_eruption: "2022-12", obs: "HVO" },

  // WATCH — orange, pulsing
  { id: "great-sitkin",  name: "Great Sitkin",        region: "Aleutians, AK",   lat: 52.0764, lng: -176.1306, level: "watch",    elevation_m: 1740, last_eruption: "2021-05", obs: "AVO" },
  { id: "semisopochnoi", name: "Semisopochnoi",       region: "Aleutians, AK",   lat: 51.9290, lng: 179.5800,  level: "watch",    elevation_m: 1221, last_eruption: "2021-02", obs: "AVO" },
  { id: "shishaldin",    name: "Shishaldin",          region: "Aleutians, AK",   lat: 54.7554, lng: -163.9711, level: "watch",    elevation_m: 2857, last_eruption: "2023-07", obs: "AVO" },
  { id: "pavlof",        name: "Pavlof",              region: "AK Peninsula",    lat: 55.4173, lng: -161.8937, level: "watch",    elevation_m: 2518, last_eruption: "2021-08", obs: "AVO" },

  // ADVISORY — yellow
  { id: "yellowstone",   name: "Yellowstone",         region: "Wyoming",         lat: 44.4280, lng: -110.5885, level: "advisory", elevation_m: 2805, last_eruption: "70 kya",  obs: "YVO" },
  { id: "long-valley",   name: "Long Valley Caldera", region: "California",      lat: 37.7000, lng: -118.8700, level: "advisory", elevation_m: 3390, last_eruption: "100 kya", obs: "CalVO" },
  { id: "mt-hood",       name: "Mount Hood",          region: "Oregon",          lat: 45.3735, lng: -121.6956, level: "advisory", elevation_m: 3429, last_eruption: "1866",    obs: "CVO" },
  { id: "mt-rainier",    name: "Mount Rainier",       region: "Washington",      lat: 46.8523, lng: -121.7603, level: "advisory", elevation_m: 4392, last_eruption: "1894",    obs: "CVO" },
  { id: "lassen",        name: "Lassen Peak",         region: "California",      lat: 40.4882, lng: -121.5050, level: "advisory", elevation_m: 3187, last_eruption: "1917",    obs: "CalVO" },
  { id: "newberry",      name: "Newberry Volcano",    region: "Oregon",          lat: 43.7226, lng: -121.2291, level: "advisory", elevation_m: 2434, last_eruption: "1300 ya", obs: "CVO" },
  { id: "crater-lake",   name: "Crater Lake",         region: "Oregon",          lat: 42.9446, lng: -122.1090, level: "advisory", elevation_m: 2487, last_eruption: "4800 ya", obs: "CVO" },

  // NORMAL — green, small
  { id: "mt-baker",      name: "Mount Baker",         region: "Washington",      lat: 48.7768, lng: -121.8145, level: "normal",   elevation_m: 3286, last_eruption: "1880",     obs: "CVO" },
  { id: "glacier-peak",  name: "Glacier Peak",        region: "Washington",      lat: 48.1116, lng: -121.1137, level: "normal",   elevation_m: 3213, last_eruption: "1700 ya",  obs: "CVO" },
  { id: "mt-st-helens",  name: "Mount St. Helens",    region: "Washington",      lat: 46.1914, lng: -122.1956, level: "normal",   elevation_m: 2549, last_eruption: "2008",     obs: "CVO" },
  { id: "mt-adams",      name: "Mount Adams",         region: "Washington",      lat: 46.2024, lng: -121.4909, level: "normal",   elevation_m: 3743, last_eruption: "1000 ya",  obs: "CVO" },
  { id: "mt-jefferson",  name: "Mount Jefferson",     region: "Oregon",          lat: 44.6742, lng: -121.7996, level: "normal",   elevation_m: 3199, last_eruption: "950 ya",   obs: "CVO" },
  { id: "three-sisters", name: "Three Sisters",       region: "Oregon",          lat: 44.1033, lng: -121.7681, level: "normal",   elevation_m: 3157, last_eruption: "2000 ya",  obs: "CVO" },
  { id: "mt-shasta",     name: "Mount Shasta",        region: "California",      lat: 41.4092, lng: -122.1949, level: "normal",   elevation_m: 4321, last_eruption: "1250 CE",  obs: "CalVO" },
  { id: "medicine-lake", name: "Medicine Lake",       region: "California",      lat: 41.6110, lng: -121.5540, level: "normal",   elevation_m: 2412, last_eruption: "950 ya",   obs: "CalVO" },
  { id: "clear-lake",    name: "Clear Lake Volcanics",region: "California",      lat: 38.9700, lng: -122.7700, level: "normal",   elevation_m: 1439, last_eruption: "10 kya",   obs: "CalVO" },
  { id: "mono-inyo",     name: "Mono-Inyo Craters",   region: "California",      lat: 37.8800, lng: -119.0000, level: "normal",   elevation_m: 2796, last_eruption: "250 ya",   obs: "CalVO" },
  { id: "haleakala",     name: "Haleakalā",           region: "Maui, Hawaiʻi",   lat: 20.7097, lng: -156.2533, level: "normal",   elevation_m: 3055, last_eruption: "1790",     obs: "HVO" },
  { id: "mauna-kea",     name: "Mauna Kea",           region: "Hawaiʻi",         lat: 19.8207, lng: -155.4681, level: "normal",   elevation_m: 4207, last_eruption: "4500 ya",  obs: "HVO" },
  { id: "hualalai",      name: "Hualālai",            region: "Hawaiʻi",         lat: 19.6920, lng: -155.8700, level: "normal",   elevation_m: 2523, last_eruption: "1801",     obs: "HVO" },
  { id: "cleveland",     name: "Cleveland",           region: "Aleutians, AK",   lat: 52.8222, lng: -169.9450, level: "normal",   elevation_m: 1730, last_eruption: "2020",     obs: "AVO" },
  { id: "veniaminof",    name: "Veniaminof",          region: "AK Peninsula",    lat: 56.1979, lng: -159.3931, level: "normal",   elevation_m: 2507, last_eruption: "2021",     obs: "AVO" },
  { id: "redoubt",       name: "Redoubt",             region: "Cook Inlet, AK",  lat: 60.4852, lng: -152.7438, level: "normal",   elevation_m: 3108, last_eruption: "2009",     obs: "AVO" },
  { id: "augustine",     name: "Augustine",           region: "Cook Inlet, AK",  lat: 59.3626, lng: -153.4350, level: "normal",   elevation_m: 1260, last_eruption: "2006",     obs: "AVO" },
];
