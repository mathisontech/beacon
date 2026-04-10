// IPGP — Institut de Physique du Globe de Paris.
//
// Runs the French volcano observatories: OVPF (Piton de la Fournaise,
// Réunion), OVSM (Montagne Pelée, Martinique), OVSG (La Soufrière,
// Guadeloupe). Three disjoint bounding boxes.
//
// Docs: http://ws.ipgp.fr/fdsnws/event/1/

import type { QuakeSource } from "../types";
import { fetchFdsnText } from "../fdsn-text";

function inBox(lat: number, lng: number, box: [number, number, number, number]): boolean {
  return lat >= box[0] && lat <= box[1] && lng >= box[2] && lng <= box[3];
}

// [minLat, maxLat, minLng, maxLng]
const REUNION: [number, number, number, number] = [-21.9, -20.6, 54.9, 56.0];
const MARTINIQUE: [number, number, number, number] = [14.2, 15.1, -61.4, -60.6];
const GUADELOUPE: [number, number, number, number] = [15.7, 16.8, -62.1, -61.0];

export const ipgp: QuakeSource = {
  id: "ipgp",
  name: "IPGP",
  operatorUrl: "http://www.ipgp.fr/en",
  covers(lat, lng) {
    return (
      inBox(lat, lng, REUNION) ||
      inBox(lat, lng, MARTINIQUE) ||
      inBox(lat, lng, GUADELOUPE)
    );
  },
  async fetch(params, signal) {
    return fetchFdsnText(
      "http://ws.ipgp.fr/fdsnws/event/1/query",
      "IPGP",
      params,
      signal,
    );
  },
};
