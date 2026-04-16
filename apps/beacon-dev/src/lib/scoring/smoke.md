# Wildland-urban smoke intrusion

## safetyScore(cell)

Different shape: "safe" = shelter indoors with filtration, not escape. Scoring indoor survivability.

```
s_bldg_tight = bldg_code_era_score(cell)              // newer = tighter envelope
s_indoor     = bldg_density > 0 ? 1 : 0
s_hvac       = hvac_filter_prob(cell)                 // region/income proxy
s_elev_above = clamp(elev_m_relative_to_valley / 200) // smoke pools in valleys
s_upwind     = 1 - downwind_from_fire(wind)           // requires event
s_notvalley  = 1 - valley_mask                         // from tpi

safety_static = 0.30*s_bldg_tight + 0.20*s_indoor + 0.20*s_hvac
              + 0.15*s_elev_above + 0.15*s_notvalley
// s_upwind folded in at runtime
```

## hazardScore(cell, event)

Event: fire sources with emission rate `Q_g_s`, wind `(u,v,speed)`, BL height `H_m`, stability class.

```
// Gaussian plume superposition
pm25 = 0
for src in sources:
   x = downwind_dist_m(cell, src, wind)
   y = crosswind_dist_m(cell, src, wind)
   if x <= 0: continue
   sy, sz = pasquill(x, stability)
   C = Q / (pi * wind_speed * sy * sz) * exp(-0.5*(y/sy)^2) * f_H(sz, H_m)
   pm25 += C
AQI_proxy   = pm25_to_aqi(pm25)
h_outdoor   = clamp((AQI_proxy - 100) / 400)          // 100..500 → 0..1
h_indoor    = h_outdoor * (1 - s_bldg_tight*s_hvac)
h_vuln      = popdens_vulnerable(cell) * 0.2

hazard = clamp(0.7*h_indoor + 0.3*h_outdoor + h_vuln)
```
