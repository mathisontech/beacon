# Volcanic observatory quake feeds

Roadmap for the `/api/volcano-quakes` regional router. Each entry
below is a real observatory with known or suspected data endpoints.

Status legend:
- `live` — source file committed in `./sources/`, routed by
  bounding box
- `fdsn?` — observatory is a known FDSN data centre but the event
  endpoint has not been verified in a running dev server
- `json?` — observatory publishes JSON but the endpoint shape is
  not yet mapped to our `Quake` type
- `html` — only HTML/PDF bulletins are public; needs a scraper
- `blocked` — no public machine-readable feed

## Implemented

| Source    | Region                                          | Status     | Notes |
|-----------|--------------------------------------------------|------------|-------|
| USGS      | global fallback                                  | live       | FDSN geojson, existing code path |
| INGV      | Italy + surrounding seas                         | live       | FDSN text, priority over EMSC inside the Italian box. Verified: 26 quakes/30d at Campi Flegrei incl. M3.4, M3.3. |
| GeoNet    | NZ + Kermadec Arc                                | live       | FDSN text. Verified working at Whakaari. |
| IPGP      | Réunion, Martinique, Guadeloupe                  | live       | FDSN text, three disjoint boxes. Verified at Piton de la Fournaise. |
| EMSC      | Aegean + Azores + Canaries + Madeira             | live       | FDSN text (spec `maxradius` degrees). Verified at Santorini. |
| BMKG      | Indonesia (Merapi, Semeru, Krakatau, Agung, …)   | live       | FDSN text. Verified: real quakes at Merapi. |

## Tried and pulled

| Source    | Region                                         | Status   | Why pulled |
|-----------|-------------------------------------------------|----------|------------|
| OVSICORI  | Costa Rica (Arenal, Poás, Turrialba, Rincón…)  | no-api   | `sdb.ovsicori.una.ac.cr` does not resolve. OVSICORI publishes weekly bulletins and alert levels but no machine-readable FDSN event service. Costa Rica currently falls through to USGS. Future: scrape weekly bulletins or use INETER cross-border catalog. |
| CSN Chile | Chile (Villarrica, Nevados de Chillán, Calbuco…) | no-api   | `http://evtdb.csn.uchile.cl/fdsnws/event/1/` redirects HTTP→HTTPS and the HTTPS target serves the CSN website HTML, not an FDSN event service. Endpoint guess was wrong; CSN may not expose FDSN publicly. Chile currently falls through to USGS. Future: IRIS/EarthScope federator proxy (CSN's C1 network is federated), GEOFON, or sismologia.cl HTML scraping. |

## High priority — should be next

| Source      | Region                         | Status | Known/suspected endpoint |
|-------------|--------------------------------|--------|--------------------------|
| NIED Hi-net | Japan (Sakurajima, Aso, Unzen, Fuji, Kusatsu-Shirane, Zao, Tokachi…) | fdsn?  | `https://www.hinet.bosai.go.jp/` — waveform focused; event catalog may require NIED login |
| SGC         | Colombia (Nevado del Ruiz, Galeras, Nevado del Huila, Purace…) | fdsn?  | `https://bdrsnc.sgc.gov.co/` — may require account; also publishes weekly PDF bulletins |
| IG-EPN      | Ecuador (Cotopaxi, Sangay, Tungurahua, Reventador, Chimborazo…) | json?  | `https://www.igepn.edu.ec/solicitud-de-datos/` — data requests only, no clean API |
| GEOFON/GFZ  | secondary global fallback, esp. Europe          | fdsn?  | `http://geofon.gfz-potsdam.de/fdsnws/event/1/query` — well-known FDSN data centre, could sit between regional sources and USGS |

## Medium priority

| Source     | Region                                             | Status  | Notes |
|------------|----------------------------------------------------|---------|-------|
| IMO        | Iceland (Grímsvötn, Katla, Hekla, Bárðarbunga, Askja, Fagradalsfjall…) | json?   | `https://api.vedur.is/skjalftalisa/v1/quake/array` (POST JSON) — shape not yet mapped |
| PHIVOLCS   | Philippines (Taal, Mayon, Pinatubo, Kanlaon, Bulusan, Hibok-Hibok) | html    | Weekly bulletins + daily advisories on phivolcs.dost.gov.ph |
| KVERT      | Kamchatka + Kuril (Shiveluch, Klyuchevskoy, Bezymianny, Sheveluch, Tolbachik…) | html    | emsd.ru weekly reports; Russian Geophysical Survey publishes FDSN for waveforms only |
| INSIVUMEH  | Guatemala (Fuego, Pacaya, Santiaguito, Santa María) | html    | insivumeh.gob.gt daily bulletins |
| CENAPRED   | Mexico (Popocatépetl, Colima, El Chichón, Ceboruco) | html    | cenapred.unam.mx — publishes JSON for Popo only |
| INETER     | Nicaragua (Masaya, Telica, San Cristóbal, Concepción) | html    | ineter.gob.ni |
| MARN       | El Salvador (Santa Ana, San Miguel, Izalco)        | html    | marn.gob.sv |
| OVG (SGC)  | covered above under SGC                            | —       | same agency |
| MVO        | Montserrat (Soufrière Hills)                        | html    | mvo.ms weekly reports |
| UWI-SRC    | Eastern Caribbean (La Soufrière St Vincent, Mt Scenery, Quill, Kick-'em-Jenny) | html   | uwiseismic.com |
| RVO        | Papua New Guinea (Ulawun, Rabaul/Tavurvur, Bagana, Manam, Lamington) | html    | rvo.gov.pg |
| VMGD       | Vanuatu (Yasur, Ambrym, Ambae, Lopevi, Gaua)       | html    | vmgd.gov.vu |
| PVMBG      | Indonesia VHP (separate from BMKG seismic catalog) | html    | magma.esdm.go.id — MAGMA Indonesia app publishes JSON for alert levels, less clear for quakes |

## Quirks and decisions still to make

- **BMKG vs PVMBG for Indonesia.** BMKG runs the national seismic
  network; PVMBG runs the volcano observatories. For raw quake data
  BMKG is the right source, but PVMBG also publishes per-volcano
  quake counts in its alert bulletins. We should query BMKG for the
  catalog and surface PVMBG's own counts separately as a
  "observatory is currently reporting X quakes/day" baseline.
- **EMSC already covers the Mediterranean.** INGV is prioritized
  over EMSC inside the Italian box so Campi Flegrei stays on INGV.
  Santorini, Nisyros, and Milos fall through to EMSC.
- **IRIS as a secondary fallback?** IRIS federates regional US
  networks (PNSN, NCEDC, UUSS, CERI) that catch smaller quakes than
  the USGS NEIC global catalog. Worth considering as a fallback
  between the regional sources and USGS for US volcanoes,
  especially Cascades / Long Valley / Yellowstone.
- **Cross-border volcanoes.** A few volcanoes sit on or near
  borders (Ruapehu is NZ-only, but Yellowstone is USGS NEIC-wide,
  and Ili Birru'u near the DRC/Uganda border). Box priority should
  put the more local observatory first.
- **CORS.** All of the above run server-side in the Next.js API
  route, so CORS is not a concern for us — but the observatory
  endpoints still need to allow our server's IP. Anything that
  requires an account or API key is flagged above.
