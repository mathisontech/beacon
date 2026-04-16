# Earthquake

## safetyScore(cell)

Goal: shelter-in-place suitability, not "outrun shaking" — no one outruns P-waves. Judges ground + structure.

```
s_vs30       = clamp((shake_vs30 - 180) / 620)        // rock > soft soil
s_notliquef  = 1 - liquef_susc                        // dist_water, hand_m, vs30
s_notsteep   = 1 - clamp(slope_deg / 30)              // landslide risk
s_notfault   = clamp(fault_dist_m / 2000)             // surface rupture
s_open       = clamp(1 - bldg_density)                // outside > inside old masonry
s_bldg_qual  = building_code_era_score(cell)          // region LUT, 0..1
s_notcoast   = clamp(dist_coast_m / 1000)             // tsunami overlap

safety = 0.20*s_vs30 + 0.15*s_notliquef + 0.15*s_notsteep
       + 0.10*s_notfault + 0.10*s_open + 0.15*s_bldg_qual
       + 0.15*s_notcoast
```

Override: unreinforced masonry + pre-code era → cap safety at 0.3 regardless.

## hazardScore(cell, event)

Event: hypocenter `(lat,lon,depth_km)`, magnitude `M`.

```
R          = hypo_distance_km(cell, event)
// BooreAtkinson-style lite
pga_g      = exp(c1 + c2*(M-6) - c3*log(R+10)) * site_amp(shake_vs30)
mmi        = 3.66*log10(pga_g*100) + 1.66              // Wald
h_shake    = clamp((mmi - 4) / 5)                      // MMI 4..9 → 0..1
h_liquef   = liquef_susc * (mmi>6 ? 1 : 0) * 0.4
h_landslide= (slope_deg>25 && mmi>6) ? 0.4 : 0
h_collapse = (1 - s_bldg_qual) * clamp((mmi-5)/4)

hazard = clamp(0.5*h_shake + h_liquef + h_landslide + 0.3*h_collapse)
```
