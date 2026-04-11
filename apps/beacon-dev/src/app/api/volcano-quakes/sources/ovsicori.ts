// OVSICORI — Observatorio Vulcanológico y Sismológico de Costa Rica
// at Universidad Nacional.
//
// Covers the five most-active Costa Rican volcanoes: Arenal, Poás,
// Turrialba, Rincón de la Vieja, Irazú. Also catches the
// surrounding volcanic arc including Miravalles and Tenorio.
//
// Docs: http://sdb.ovsicori.una.ac.cr/fdsnws/event/1/

import type { QuakeSource } from "../types";
import { fetchFdsnText } from "../fdsn-text";

export const ovsicori: QuakeSource = {
  id: "ovsicori",
  name: "OVSICORI",
  operatorUrl: "https://www.ovsicori.una.ac.cr/",
  covers(lat, lng) {
    return lat >= 8 && lat <= 11.5 && lng >= -86 && lng <= -82.5;
  },
  async fetch(params, signal) {
    return fetchFdsnText(
      "http://sdb.ovsicori.una.ac.cr/fdsnws/event/1/query",
      "OVSICORI",
      params,
      signal,
    );
  },
};
