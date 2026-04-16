# Hurricane / tropical cyclone

Split: wind + storm surge + inland flood (delegates to flood.md for rainfall).

## safetyScore(cell)

```
s_surge_elev = clamp((elev_m - 5) / 10)               // >15 m = 1.0
s_dist_coast = clamp(dist_coast_m / 3000)
s_hand       = clamp(hand_m / 8)
s_bldg_wind  = wind_rated_score(bldg_code_era, bldg_h_m)   // low-rise masonry > mobile
s_not_mobile = 1 - mobile_home_frac
s_not_trees  = 1 - clamp(canopy_h_m / 25)             // falling trees
s_notbarrier = 1 - barrier_island_mask

safety = 0.25*s_surge_elev + 0.15*s_dist_coast + 0.10*s_hand
       + 0.20*s_bldg_wind + 0.10*s_not_mobile + 0.10*s_not_trees
       + 0.10*s_notbarrier
```

## hazardScore(cell, event)

Event: storm center `(lat,lon)`, `Vmax_ms`, `Rmax_km`, forward speed, landfall ETA, predicted surge `S_m`.

```
r            = dist_to_center_km(cell, event)
// Holland-ish parametric wind
V_cell       = Vmax_ms * (Rmax/r)^B * exp(1 - (Rmax/r)^B)   // r>=Rmax
h_wind       = clamp((V_cell - 20) / 50)              // 20..70 m/s → 0..1
h_surge      = elev_m < S_m ? clamp((S_m - elev_m)/4) : 0
h_rain       = flood.hazardScore(cell, rainfall_subevent)
h_time       = exp(-eta_landfall_s / 21600)           // 6 hr

hazard = clamp(max(0.5*h_wind, h_surge, h_rain) + 0.2*h_time)
```
