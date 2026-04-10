import type { Volcano } from "./types";

// Globally significant volcanoes outside the US, keyed by
// regional observatory. Alert levels are conservative:
// persistently active systems (Stromboli, Sakurajima, Yasur,
// Shiveluch, Fuego, Nyiragongo, Erebus, Sangay...) carry
// "watch" or "warning"; everything else defaults to "normal"
// unless well-known sustained unrest is documented.
//
// Sources: Smithsonian Global Volcanism Program, JMA, PVMBG,
// PHIVOLCS, INGV, IMO, KVERT, RVO, GNS, SERNAGEOMIN, IG-EPN,
// IGP, SGC, INSIVUMEH, CENAPRED, INETER, OVSICORI, OVG.
//
// This list is hand-curated (~120 entries). It is the seed
// for C1.8c — later slices can expand it and can pull live
// alert levels from the respective observatory feeds.

export const VOLCANOES_GLOBAL: Volcano[] = [
  // ───────── INDONESIA (PVMBG) ─────────
  { id: "merapi",          name: "Merapi",            region: "Java, Indonesia",        lat: -7.5407, lng: 110.4457, level: "watch",    elevation_m: 2930, last_eruption: "2020–present", obs: "PVMBG" },
  { id: "semeru",          name: "Semeru",            region: "Java, Indonesia",        lat: -8.1077, lng: 112.9224, level: "watch",    elevation_m: 3676, last_eruption: "2021–present", obs: "PVMBG" },
  { id: "anak-krakatau",   name: "Anak Krakatau",     region: "Sunda Strait, Indonesia",lat: -6.1020, lng: 105.4230, level: "watch",    elevation_m: 157,  last_eruption: "2023–present", obs: "PVMBG" },
  { id: "sinabung",        name: "Sinabung",          region: "Sumatra, Indonesia",     lat: 3.1700,  lng: 98.3920,  level: "normal",   elevation_m: 2460, last_eruption: "2021",         obs: "PVMBG" },
  { id: "agung",           name: "Agung",             region: "Bali, Indonesia",        lat: -8.3425, lng: 115.5078, level: "normal",   elevation_m: 2997, last_eruption: "2019",         obs: "PVMBG" },
  { id: "ijen",            name: "Ijen",              region: "Java, Indonesia",        lat: -8.0580, lng: 114.2420, level: "normal",   elevation_m: 2386, last_eruption: "2023",         obs: "PVMBG" },
  { id: "kelud",           name: "Kelud",             region: "Java, Indonesia",        lat: -7.9300, lng: 112.3080, level: "normal",   elevation_m: 1731, last_eruption: "2014",         obs: "PVMBG" },
  { id: "bromo",           name: "Bromo (Tengger)",   region: "Java, Indonesia",        lat: -7.9425, lng: 112.9500, level: "advisory", elevation_m: 2329, last_eruption: "2019",         obs: "PVMBG" },
  { id: "raung",           name: "Raung",             region: "Java, Indonesia",        lat: -8.1250, lng: 114.0420, level: "normal",   elevation_m: 3332, last_eruption: "2022",         obs: "PVMBG" },
  { id: "ili-lewotolok",   name: "Ili Lewotolok",     region: "Lesser Sunda, Indonesia",lat: -8.2720, lng: 123.5050, level: "watch",    elevation_m: 1423, last_eruption: "2023–present", obs: "PVMBG" },
  { id: "lewotobi",        name: "Lewotobi Laki-laki",region: "Flores, Indonesia",      lat: -8.5300, lng: 122.7750, level: "watch",    elevation_m: 1703, last_eruption: "2024–present", obs: "PVMBG" },
  { id: "karangetang",     name: "Karangetang",       region: "Sangihe, Indonesia",     lat: 2.7800,  lng: 125.4070, level: "advisory", elevation_m: 1784, last_eruption: "2023",         obs: "PVMBG" },
  { id: "dukono",          name: "Dukono",            region: "Halmahera, Indonesia",   lat: 1.6930,  lng: 127.8800, level: "watch",    elevation_m: 1229, last_eruption: "persistent",   obs: "PVMBG" },
  { id: "ibu",             name: "Ibu",               region: "Halmahera, Indonesia",   lat: 1.4880,  lng: 127.6300, level: "watch",    elevation_m: 1325, last_eruption: "2024–present", obs: "PVMBG" },
  { id: "soputan",         name: "Soputan",           region: "Sulawesi, Indonesia",    lat: 1.1100,  lng: 124.7370, level: "normal",   elevation_m: 1784, last_eruption: "2019",         obs: "PVMBG" },
  { id: "lokon",           name: "Lokon-Empung",      region: "Sulawesi, Indonesia",    lat: 1.3580,  lng: 124.7930, level: "normal",   elevation_m: 1580, last_eruption: "2015",         obs: "PVMBG" },
  { id: "tambora",         name: "Tambora",           region: "Sumbawa, Indonesia",     lat: -8.2500, lng: 118.0000, level: "advisory", elevation_m: 2850, last_eruption: "1967",         obs: "PVMBG" },
  { id: "kerinci",         name: "Kerinci",           region: "Sumatra, Indonesia",     lat: -1.8140, lng: 101.2640, level: "normal",   elevation_m: 3800, last_eruption: "2023",         obs: "PVMBG" },
  { id: "slamet",          name: "Slamet",            region: "Java, Indonesia",        lat: -7.2420, lng: 109.2080, level: "normal",   elevation_m: 3428, last_eruption: "2014",         obs: "PVMBG" },

  // ───────── JAPAN (JMA) ─────────
  { id: "sakurajima",      name: "Sakurajima",        region: "Kyushu, Japan",          lat: 31.5830, lng: 130.6570, level: "watch",    elevation_m: 1117, last_eruption: "persistent",   obs: "JMA" },
  { id: "aso",             name: "Aso",               region: "Kyushu, Japan",          lat: 32.8840, lng: 131.1040, level: "watch",    elevation_m: 1592, last_eruption: "2021–present", obs: "JMA" },
  { id: "fuji",            name: "Mount Fuji",        region: "Honshu, Japan",          lat: 35.3606, lng: 138.7274, level: "normal",   elevation_m: 3776, last_eruption: "1707",         obs: "JMA" },
  { id: "asama",           name: "Asama",             region: "Honshu, Japan",          lat: 36.4061, lng: 138.5230, level: "advisory", elevation_m: 2568, last_eruption: "2019",         obs: "JMA" },
  { id: "ontake",          name: "Ontake",            region: "Honshu, Japan",          lat: 35.8931, lng: 137.4803, level: "advisory", elevation_m: 3067, last_eruption: "2014",         obs: "JMA" },
  { id: "kuchinoerabu",    name: "Kuchinoerabu",      region: "Ryukyu, Japan",          lat: 30.4430, lng: 130.2170, level: "normal",   elevation_m: 657,  last_eruption: "2020",         obs: "JMA" },
  { id: "suwanosejima",    name: "Suwanosejima",      region: "Ryukyu, Japan",          lat: 29.6380, lng: 129.7140, level: "watch",    elevation_m: 799,  last_eruption: "persistent",   obs: "JMA" },
  { id: "nishinoshima",    name: "Nishinoshima",      region: "Izu, Japan",             lat: 27.2470, lng: 140.8740, level: "watch",    elevation_m: 100,  last_eruption: "2023–present", obs: "JMA" },
  { id: "shinmoedake",     name: "Shinmoedake",       region: "Kyushu, Japan",          lat: 31.9090, lng: 130.8860, level: "normal",   elevation_m: 1421, last_eruption: "2018",         obs: "JMA" },
  { id: "usu",             name: "Usu",               region: "Hokkaido, Japan",        lat: 42.5410, lng: 140.8390, level: "normal",   elevation_m: 733,  last_eruption: "2000",         obs: "JMA" },
  { id: "tokachi",         name: "Tokachi",           region: "Hokkaido, Japan",        lat: 43.4180, lng: 142.6860, level: "normal",   elevation_m: 2077, last_eruption: "2004",         obs: "JMA" },

  // ───────── PHILIPPINES (PHIVOLCS) ─────────
  { id: "taal",            name: "Taal",              region: "Luzon, Philippines",     lat: 14.0020, lng: 120.9930, level: "watch",    elevation_m: 311,  last_eruption: "2022–present", obs: "PHIVOLCS" },
  { id: "mayon",           name: "Mayon",             region: "Luzon, Philippines",     lat: 13.2577, lng: 123.6856, level: "advisory", elevation_m: 2462, last_eruption: "2023",         obs: "PHIVOLCS" },
  { id: "pinatubo",        name: "Pinatubo",          region: "Luzon, Philippines",     lat: 15.1300, lng: 120.3500, level: "normal",   elevation_m: 1486, last_eruption: "1993",         obs: "PHIVOLCS" },
  { id: "bulusan",         name: "Bulusan",           region: "Luzon, Philippines",     lat: 12.7700, lng: 124.0500, level: "advisory", elevation_m: 1565, last_eruption: "2022",         obs: "PHIVOLCS" },
  { id: "kanlaon",         name: "Kanlaon",           region: "Negros, Philippines",    lat: 10.4120, lng: 123.1320, level: "watch",    elevation_m: 2435, last_eruption: "2024–present", obs: "PHIVOLCS" },
  { id: "hibok-hibok",     name: "Hibok-Hibok",       region: "Mindanao, Philippines",  lat: 9.2030,  lng: 124.6730, level: "normal",   elevation_m: 1552, last_eruption: "1953",         obs: "PHIVOLCS" },

  // ───────── ITALY (INGV) ─────────
  { id: "etna",            name: "Etna",              region: "Sicily, Italy",          lat: 37.7510, lng: 14.9930,  level: "watch",    elevation_m: 3357, last_eruption: "2024–present", obs: "INGV" },
  { id: "stromboli",       name: "Stromboli",         region: "Aeolian, Italy",         lat: 38.7890, lng: 15.2130,  level: "watch",    elevation_m: 924,  last_eruption: "persistent",   obs: "INGV" },
  { id: "vesuvius",        name: "Vesuvius",          region: "Campania, Italy",        lat: 40.8210, lng: 14.4260,  level: "advisory", elevation_m: 1281, last_eruption: "1944",         obs: "INGV" },
  { id: "campi-flegrei",   name: "Campi Flegrei",     region: "Campania, Italy",        lat: 40.8270, lng: 14.1390,  level: "watch",    elevation_m: 458,  last_eruption: "1538",         obs: "INGV" },
  { id: "vulcano",         name: "Vulcano",           region: "Aeolian, Italy",         lat: 38.4040, lng: 14.9620,  level: "advisory", elevation_m: 500,  last_eruption: "1890",         obs: "INGV" },

  // ───────── ICELAND (IMO) ─────────
  { id: "reykjanes",       name: "Fagradalsfjall",    region: "Reykjanes, Iceland",     lat: 63.9000, lng: -22.2700, level: "watch",    elevation_m: 385,  last_eruption: "2024–present", obs: "IMO" },
  { id: "grimsvotn",       name: "Grímsvötn",         region: "Vatnajökull, Iceland",   lat: 64.4160, lng: -17.3160, level: "advisory", elevation_m: 1725, last_eruption: "2011",         obs: "IMO" },
  { id: "eyjafjallajokull",name: "Eyjafjallajökull",  region: "South, Iceland",         lat: 63.6330, lng: -19.6050, level: "normal",   elevation_m: 1651, last_eruption: "2010",         obs: "IMO" },
  { id: "katla",           name: "Katla",             region: "South, Iceland",         lat: 63.6340, lng: -19.0500, level: "advisory", elevation_m: 1512, last_eruption: "1918",         obs: "IMO" },
  { id: "hekla",           name: "Hekla",             region: "South, Iceland",         lat: 63.9930, lng: -19.7000, level: "advisory", elevation_m: 1491, last_eruption: "2000",         obs: "IMO" },
  { id: "bardarbunga",     name: "Bárðarbunga",       region: "Vatnajökull, Iceland",   lat: 64.6400, lng: -17.5280, level: "normal",   elevation_m: 2009, last_eruption: "2015",         obs: "IMO" },
  { id: "askja",           name: "Askja",             region: "Highlands, Iceland",     lat: 65.0300, lng: -16.7500, level: "advisory", elevation_m: 1516, last_eruption: "1961",         obs: "IMO" },

  // ───────── GREECE ─────────
  { id: "santorini",       name: "Santorini",         region: "Cyclades, Greece",       lat: 36.4040, lng: 25.3960,  level: "advisory", elevation_m: 329,  last_eruption: "1950",         obs: "IGME" },
  { id: "nisyros",         name: "Nisyros",           region: "Dodecanese, Greece",     lat: 36.5860, lng: 27.1620,  level: "normal",   elevation_m: 698,  last_eruption: "1888",         obs: "IGME" },

  // ───────── KAMCHATKA + KURILS (KVERT) ─────────
  { id: "klyuchevskoy",    name: "Klyuchevskoy",      region: "Kamchatka, Russia",      lat: 56.0560, lng: 160.6420, level: "watch",    elevation_m: 4750, last_eruption: "persistent",   obs: "KVERT" },
  { id: "shiveluch",       name: "Shiveluch",         region: "Kamchatka, Russia",      lat: 56.6530, lng: 161.3600, level: "warning",  elevation_m: 3283, last_eruption: "persistent",   obs: "KVERT" },
  { id: "bezymianny",      name: "Bezymianny",        region: "Kamchatka, Russia",      lat: 55.9720, lng: 160.5950, level: "watch",    elevation_m: 2882, last_eruption: "persistent",   obs: "KVERT" },
  { id: "karymsky",        name: "Karymsky",          region: "Kamchatka, Russia",      lat: 54.0490, lng: 159.4430, level: "watch",    elevation_m: 1513, last_eruption: "persistent",   obs: "KVERT" },
  { id: "avachinsky",      name: "Avachinsky",        region: "Kamchatka, Russia",      lat: 53.2560, lng: 158.8360, level: "advisory", elevation_m: 2741, last_eruption: "2001",         obs: "KVERT" },
  { id: "tolbachik",       name: "Tolbachik",         region: "Kamchatka, Russia",      lat: 55.8320, lng: 160.3260, level: "normal",   elevation_m: 3682, last_eruption: "2013",         obs: "KVERT" },
  { id: "ebeko",           name: "Ebeko",             region: "Kurils, Russia",         lat: 50.6860, lng: 156.0140, level: "watch",    elevation_m: 1156, last_eruption: "persistent",   obs: "SVERT" },
  { id: "alaid",           name: "Alaid",             region: "Kurils, Russia",         lat: 50.8580, lng: 155.5650, level: "normal",   elevation_m: 2339, last_eruption: "2012",         obs: "SVERT" },

  // ───────── PAPUA NEW GUINEA (RVO) ─────────
  { id: "rabaul",          name: "Rabaul (Tavurvur)", region: "New Britain, PNG",       lat: -4.2710, lng: 152.2030, level: "advisory", elevation_m: 688,  last_eruption: "2014",         obs: "RVO" },
  { id: "ulawun",          name: "Ulawun",            region: "New Britain, PNG",       lat: -5.0500, lng: 151.3300, level: "watch",    elevation_m: 2334, last_eruption: "2023–present", obs: "RVO" },
  { id: "bagana",          name: "Bagana",            region: "Bougainville, PNG",      lat: -6.1400, lng: 155.1950, level: "watch",    elevation_m: 1855, last_eruption: "persistent",   obs: "RVO" },
  { id: "manam",           name: "Manam",             region: "Bismarck Sea, PNG",      lat: -4.0800, lng: 145.0370, level: "watch",    elevation_m: 1807, last_eruption: "persistent",   obs: "RVO" },
  { id: "langila",         name: "Langila",           region: "New Britain, PNG",       lat: -5.5250, lng: 148.4200, level: "advisory", elevation_m: 1330, last_eruption: "2019",         obs: "RVO" },
  { id: "kadovar",         name: "Kadovar",           region: "Bismarck Sea, PNG",      lat: -3.6100, lng: 144.6380, level: "watch",    elevation_m: 365,  last_eruption: "persistent",   obs: "RVO" },

  // ───────── VANUATU (VMGD) ─────────
  { id: "yasur",           name: "Yasur",             region: "Tanna, Vanuatu",         lat: -19.5300,lng: 169.4420, level: "watch",    elevation_m: 361,  last_eruption: "persistent",   obs: "VMGD" },
  { id: "ambrym",          name: "Ambrym",            region: "Ambrym, Vanuatu",        lat: -16.2500,lng: 168.1200, level: "advisory", elevation_m: 1334, last_eruption: "2018",         obs: "VMGD" },
  { id: "aoba",            name: "Ambae (Aoba)",      region: "Ambae, Vanuatu",         lat: -15.4000,lng: 167.8300, level: "advisory", elevation_m: 1496, last_eruption: "2018",         obs: "VMGD" },
  { id: "lopevi",          name: "Lopevi",            region: "Lopevi, Vanuatu",        lat: -16.5070,lng: 168.3460, level: "normal",   elevation_m: 1413, last_eruption: "2007",         obs: "VMGD" },
  { id: "gaua",            name: "Gaua",              region: "Banks, Vanuatu",         lat: -14.2700,lng: 167.5000, level: "normal",   elevation_m: 797,  last_eruption: "2013",         obs: "VMGD" },

  // ───────── NEW ZEALAND (GNS) ─────────
  { id: "whakaari",        name: "Whakaari/White Is.",region: "Bay of Plenty, NZ",      lat: -37.5230,lng: 177.1800, level: "watch",    elevation_m: 321,  last_eruption: "2019",         obs: "GNS" },
  { id: "ruapehu",         name: "Ruapehu",           region: "North Island, NZ",       lat: -39.2800,lng: 175.5700, level: "advisory", elevation_m: 2797, last_eruption: "2022",         obs: "GNS" },
  { id: "tongariro",       name: "Tongariro",         region: "North Island, NZ",       lat: -39.1300,lng: 175.6400, level: "advisory", elevation_m: 2291, last_eruption: "2012",         obs: "GNS" },
  { id: "taupo",           name: "Taupō",             region: "North Island, NZ",       lat: -38.8200,lng: 176.0000, level: "normal",   elevation_m: 760,  last_eruption: "232 CE",       obs: "GNS" },
  { id: "taranaki",        name: "Taranaki (Egmont)", region: "North Island, NZ",       lat: -39.2960,lng: 174.0650, level: "normal",   elevation_m: 2518, last_eruption: "1854",         obs: "GNS" },

  // ───────── AFRICA ─────────
  { id: "nyiragongo",      name: "Nyiragongo",        region: "Virunga, DRC",           lat: -1.5200, lng: 29.2500,  level: "watch",    elevation_m: 3470, last_eruption: "2021–present", obs: "OVG" },
  { id: "nyamulagira",     name: "Nyamulagira",       region: "Virunga, DRC",           lat: -1.4080, lng: 29.2000,  level: "watch",    elevation_m: 3058, last_eruption: "2024–present", obs: "OVG" },
  { id: "ol-doinyo-lengai",name: "Ol Doinyo Lengai",  region: "Rift Valley, Tanzania",  lat: -2.7640, lng: 35.9140,  level: "advisory", elevation_m: 2962, last_eruption: "2013",         obs: "GST" },
  { id: "erta-ale",        name: "Erta Ale",          region: "Afar, Ethiopia",         lat: 13.6000, lng: 40.6700,  level: "watch",    elevation_m: 613,  last_eruption: "persistent",   obs: "IGA" },
  { id: "mount-cameroon",  name: "Mount Cameroon",    region: "Cameroon",               lat: 4.2030,  lng: 9.1700,   level: "normal",   elevation_m: 4095, last_eruption: "2012",         obs: "MCGO" },
  { id: "karthala",        name: "Karthala",          region: "Grande Comore",          lat: -11.7500,lng: 43.3800,  level: "normal",   elevation_m: 2361, last_eruption: "2007",         obs: "OVK" },
  { id: "piton-fournaise", name: "Piton de la Fournaise", region: "Réunion, France",    lat: -21.2440,lng: 55.7080,  level: "watch",    elevation_m: 2632, last_eruption: "2024–present", obs: "OVPF" },

  // ───────── CHILE (SERNAGEOMIN) ─────────
  { id: "villarrica",      name: "Villarrica",        region: "Araucanía, Chile",       lat: -39.4200,lng: -71.9300, level: "watch",    elevation_m: 2847, last_eruption: "2023–present", obs: "SERNAGEOMIN" },
  { id: "llaima",          name: "Llaima",            region: "Araucanía, Chile",       lat: -38.6930,lng: -71.7290, level: "advisory", elevation_m: 3125, last_eruption: "2009",         obs: "SERNAGEOMIN" },
  { id: "calbuco",         name: "Calbuco",           region: "Los Lagos, Chile",       lat: -41.3260,lng: -72.6140, level: "normal",   elevation_m: 2003, last_eruption: "2015",         obs: "SERNAGEOMIN" },
  { id: "chaiten",         name: "Chaitén",           region: "Los Lagos, Chile",       lat: -42.8330,lng: -72.6460, level: "normal",   elevation_m: 1122, last_eruption: "2011",         obs: "SERNAGEOMIN" },
  { id: "puyehue",         name: "Puyehue-Cordón Caulle", region: "Los Ríos, Chile",    lat: -40.5900,lng: -72.1170, level: "normal",   elevation_m: 2236, last_eruption: "2012",         obs: "SERNAGEOMIN" },
  { id: "lascar",          name: "Láscar",            region: "Antofagasta, Chile",     lat: -23.3700,lng: -67.7300, level: "advisory", elevation_m: 5592, last_eruption: "2022",         obs: "SERNAGEOMIN" },
  { id: "copahue",         name: "Copahue",           region: "Biobío, Chile",          lat: -37.8560,lng: -71.1830, level: "advisory", elevation_m: 2965, last_eruption: "2021",         obs: "SERNAGEOMIN" },
  { id: "nevados-chillan", name: "Nevados de Chillán",region: "Ñuble, Chile",           lat: -36.8630,lng: -71.3770, level: "watch",    elevation_m: 3212, last_eruption: "2023",         obs: "SERNAGEOMIN" },

  // ───────── ECUADOR (IG-EPN) ─────────
  { id: "cotopaxi",        name: "Cotopaxi",          region: "Andes, Ecuador",         lat: -0.6770, lng: -78.4360, level: "advisory", elevation_m: 5897, last_eruption: "2023",         obs: "IG-EPN" },
  { id: "tungurahua",      name: "Tungurahua",        region: "Andes, Ecuador",         lat: -1.4670, lng: -78.4420, level: "normal",   elevation_m: 5023, last_eruption: "2016",         obs: "IG-EPN" },
  { id: "sangay",          name: "Sangay",            region: "Andes, Ecuador",         lat: -2.0050, lng: -78.3410, level: "watch",    elevation_m: 5286, last_eruption: "persistent",   obs: "IG-EPN" },
  { id: "reventador",      name: "Reventador",        region: "Andes, Ecuador",         lat: -0.0780, lng: -77.6560, level: "watch",    elevation_m: 3562, last_eruption: "persistent",   obs: "IG-EPN" },
  { id: "chimborazo",      name: "Chimborazo",        region: "Andes, Ecuador",         lat: -1.4690, lng: -78.8170, level: "normal",   elevation_m: 6263, last_eruption: "550 CE",       obs: "IG-EPN" },
  { id: "cayambe",         name: "Cayambe",           region: "Andes, Ecuador",         lat: 0.0290,  lng: -77.9860, level: "normal",   elevation_m: 5790, last_eruption: "1786",         obs: "IG-EPN" },
  { id: "pichincha",       name: "Guagua Pichincha",  region: "Andes, Ecuador",         lat: -0.1710, lng: -78.5980, level: "normal",   elevation_m: 4784, last_eruption: "2002",         obs: "IG-EPN" },
  { id: "wolf",            name: "Wolf",              region: "Galápagos, Ecuador",     lat: 0.0200,  lng: -91.3300, level: "normal",   elevation_m: 1710, last_eruption: "2022",         obs: "IG-EPN" },
  { id: "sierra-negra",    name: "Sierra Negra",      region: "Galápagos, Ecuador",     lat: -0.8300, lng: -91.1700, level: "normal",   elevation_m: 1124, last_eruption: "2018",         obs: "IG-EPN" },
  { id: "fernandina",      name: "Fernandina",        region: "Galápagos, Ecuador",     lat: -0.3700, lng: -91.5500, level: "watch",    elevation_m: 1476, last_eruption: "2024",         obs: "IG-EPN" },

  // ───────── PERU (IGP) ─────────
  { id: "sabancaya",       name: "Sabancaya",         region: "Andes, Peru",            lat: -15.7870,lng: -71.8570, level: "watch",    elevation_m: 5967, last_eruption: "persistent",   obs: "IGP" },
  { id: "ubinas",          name: "Ubinas",            region: "Andes, Peru",            lat: -16.3550,lng: -70.9030, level: "advisory", elevation_m: 5672, last_eruption: "2019",         obs: "IGP" },
  { id: "misti",           name: "Misti",             region: "Andes, Peru",            lat: -16.2940,lng: -71.4090, level: "normal",   elevation_m: 5822, last_eruption: "1985",         obs: "IGP" },

  // ───────── COLOMBIA (SGC) ─────────
  { id: "nevado-ruiz",     name: "Nevado del Ruiz",   region: "Andes, Colombia",        lat: 4.8950,  lng: -75.3230, level: "watch",    elevation_m: 5321, last_eruption: "2023–present", obs: "SGC" },
  { id: "galeras",         name: "Galeras",           region: "Andes, Colombia",        lat: 1.2200,  lng: -77.3590, level: "advisory", elevation_m: 4276, last_eruption: "2014",         obs: "SGC" },
  { id: "nevado-huila",    name: "Nevado del Huila",  region: "Andes, Colombia",        lat: 2.9300,  lng: -76.0300, level: "normal",   elevation_m: 5365, last_eruption: "2012",         obs: "SGC" },
  { id: "purace",          name: "Puracé",            region: "Andes, Colombia",        lat: 2.3140,  lng: -76.3970, level: "watch",    elevation_m: 4650, last_eruption: "2023–present", obs: "SGC" },
  { id: "cerro-machin",    name: "Cerro Machín",      region: "Andes, Colombia",        lat: 4.4870,  lng: -75.3920, level: "advisory", elevation_m: 2750, last_eruption: "1180",         obs: "SGC" },

  // ───────── GUATEMALA (INSIVUMEH) ─────────
  { id: "fuego",           name: "Fuego",             region: "Guatemala",              lat: 14.4730, lng: -90.8800, level: "warning",  elevation_m: 3763, last_eruption: "persistent",   obs: "INSIVUMEH" },
  { id: "pacaya",          name: "Pacaya",            region: "Guatemala",              lat: 14.3810, lng: -90.6010, level: "watch",    elevation_m: 2552, last_eruption: "2023–present", obs: "INSIVUMEH" },
  { id: "santiaguito",     name: "Santiaguito",       region: "Guatemala",              lat: 14.7560, lng: -91.5520, level: "watch",    elevation_m: 3772, last_eruption: "persistent",   obs: "INSIVUMEH" },
  { id: "acatenango",      name: "Acatenango",        region: "Guatemala",              lat: 14.5010, lng: -90.8760, level: "normal",   elevation_m: 3976, last_eruption: "1972",         obs: "INSIVUMEH" },

  // ───────── MEXICO (CENAPRED) ─────────
  { id: "popocatepetl",    name: "Popocatépetl",      region: "Central Mexico",         lat: 19.0230, lng: -98.6220, level: "watch",    elevation_m: 5426, last_eruption: "persistent",   obs: "CENAPRED" },
  { id: "colima",          name: "Volcán de Colima",  region: "Jalisco, Mexico",        lat: 19.5140, lng: -103.6170,level: "advisory", elevation_m: 3850, last_eruption: "2017",         obs: "CENAPRED" },
  { id: "el-chichon",      name: "El Chichón",        region: "Chiapas, Mexico",        lat: 17.3600, lng: -93.2290, level: "normal",   elevation_m: 1150, last_eruption: "1982",         obs: "CENAPRED" },

  // ───────── NICARAGUA (INETER) ─────────
  { id: "masaya",          name: "Masaya",            region: "Nicaragua",              lat: 11.9840, lng: -86.1610, level: "watch",    elevation_m: 635,  last_eruption: "persistent",   obs: "INETER" },
  { id: "telica",          name: "Telica",            region: "Nicaragua",              lat: 12.6020, lng: -86.8450, level: "advisory", elevation_m: 1061, last_eruption: "2020",         obs: "INETER" },
  { id: "san-cristobal",   name: "San Cristóbal",     region: "Nicaragua",              lat: 12.7020, lng: -87.0040, level: "advisory", elevation_m: 1745, last_eruption: "2019",         obs: "INETER" },
  { id: "concepcion",      name: "Concepción",        region: "Nicaragua",              lat: 11.5380, lng: -85.6220, level: "normal",   elevation_m: 1700, last_eruption: "2010",         obs: "INETER" },

  // ───────── COSTA RICA (OVSICORI) ─────────
  { id: "poas",            name: "Poás",              region: "Costa Rica",             lat: 10.1990, lng: -84.2330, level: "advisory", elevation_m: 2708, last_eruption: "2023",         obs: "OVSICORI" },
  { id: "arenal",          name: "Arenal",            region: "Costa Rica",             lat: 10.4630, lng: -84.7030, level: "normal",   elevation_m: 1670, last_eruption: "2010",         obs: "OVSICORI" },
  { id: "turrialba",       name: "Turrialba",         region: "Costa Rica",             lat: 10.0250, lng: -83.7670, level: "advisory", elevation_m: 3340, last_eruption: "2019",         obs: "OVSICORI" },
  { id: "rincon-vieja",    name: "Rincón de la Vieja",region: "Costa Rica",             lat: 10.8300, lng: -85.3240, level: "advisory", elevation_m: 1916, last_eruption: "2024",         obs: "OVSICORI" },

  // ───────── EL SALVADOR (MARN) ─────────
  { id: "santa-ana",       name: "Santa Ana",         region: "El Salvador",            lat: 13.8530, lng: -89.6300, level: "normal",   elevation_m: 2381, last_eruption: "2005",         obs: "MARN" },
  { id: "san-miguel",      name: "San Miguel",        region: "El Salvador",            lat: 13.4340, lng: -88.2690, level: "normal",   elevation_m: 2130, last_eruption: "2013",         obs: "MARN" },

  // ───────── ANTARCTIC ─────────
  { id: "erebus",          name: "Erebus",            region: "Ross Island, Antarctica",lat: -77.5300,lng: 167.1700, level: "watch",    elevation_m: 3794, last_eruption: "persistent",   obs: "MEVO" },

  // ───────── CARIBBEAN ─────────
  { id: "soufriere-hills", name: "Soufrière Hills",   region: "Montserrat",             lat: 16.7200, lng: -62.1800, level: "advisory", elevation_m: 915,  last_eruption: "2012",         obs: "MVO" },
  { id: "la-soufriere",    name: "La Soufrière",      region: "St Vincent",             lat: 13.3300, lng: -61.1800, level: "advisory", elevation_m: 1220, last_eruption: "2021",         obs: "UWI-SRC" },
  { id: "mount-pelee",     name: "Mount Pelée",       region: "Martinique",             lat: 14.8200, lng: -61.1700, level: "normal",   elevation_m: 1397, last_eruption: "1932",         obs: "OVSM" },
  { id: "soufriere-gp",    name: "La Soufrière",      region: "Guadeloupe",             lat: 16.0500, lng: -61.6700, level: "advisory", elevation_m: 1467, last_eruption: "1977",         obs: "OVSG" },
  { id: "kick-em-jenny",   name: "Kick 'em Jenny",    region: "Grenada (submarine)",    lat: 12.3000, lng: -61.6400, level: "watch",    elevation_m: -185, last_eruption: "2017",         obs: "UWI-SRC" },

  // ───────── ATLANTIC ─────────
  { id: "cumbre-vieja",    name: "Cumbre Vieja",      region: "La Palma, Canary",       lat: 28.5700, lng: -17.8400, level: "advisory", elevation_m: 1949, last_eruption: "2021",         obs: "IGN" },
  { id: "teide",           name: "Teide",             region: "Tenerife, Canary",       lat: 28.2720, lng: -16.6430, level: "normal",   elevation_m: 3715, last_eruption: "1909",         obs: "IGN" },
  { id: "fogo",            name: "Fogo",              region: "Cape Verde",             lat: 14.9500, lng: -24.3500, level: "normal",   elevation_m: 2829, last_eruption: "2015",         obs: "INMG" },

  // ───────── PACIFIC ─────────
  { id: "hunga-tonga",     name: "Hunga Tonga",       region: "Tonga",                  lat: -20.5460,lng: -175.3900,level: "advisory", elevation_m: 114,  last_eruption: "2022",         obs: "TGS" },
  { id: "home-reef",       name: "Home Reef",         region: "Tonga",                  lat: -18.9920,lng: -174.7750,level: "normal",   elevation_m: 5,    last_eruption: "2023",         obs: "TGS" },
];
