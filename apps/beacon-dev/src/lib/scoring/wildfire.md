# Wildfire

## safetyScore(cell)

Goal: "can I survive a front passing over this cell?" — NWCG safety-zone logic, reduced to tiles.

```
s_fuel       = 1 - clamp(fuel_load_norm)          // fm40→load LUT
s_nonburn    = nonburnable_frac                    // pavement, sand, water, bare
s_open       = 1 - min(1, canopy_h_m / 20)         // overstory torching risk
s_slope      = 1 - clamp(slope_deg / 30)           // preheating below upslope fire
s_position   = clamp((tpi + 50) / 100)             // ridges/flats > draws
s_sizebuffer = clamp(dist_to_fuel_m / 120)         // ≥4x flame length rule
s_egress     = clamp(1 / (1 + dist_road_m / 200))
s_water      = 0.1 * clamp(1 - dist_water_m / 500) // bonus

safety = 0.25*s_nonburn + 0.15*s_fuel + 0.15*s_open
       + 0.15*s_slope   + 0.10*s_position + 0.15*s_sizebuffer
       + 0.05*s_egress  + s_water
```

Hard overrides: `s_nonburn > 0.9 AND area > 4*(flame_len)^2` → safety = 1.0 (parking lot, beach, lake).
Structures alone never set safety > 0.6 (they burn).

## hazardScore(cell, event)

Event inputs: active perimeter polygon, wind vector `(u,v)`, RH, temp, `fuel_moisture_1h`.

```
d        = signed_dist_to_perimeter_m(cell)          // + outside, - inside
if d <= 0: return 1.0
headingDot = max(0, dot(unit(cell - nearestFirePt), wind))
ros_proxy  = fm40_ros(fuel_fm40) * (1 + 0.3*slope_deg/10) * (1 + headingDot)
            * exp(-fuel_moisture_1h / 10)
eta_s      = d / max(ros_proxy, 0.01)
h_time     = exp(-eta_s / 3600)                       // 1 hr e-fold
h_spot     = canopy_h_m>10 && wind>8 ? 0.3 : 0
h_struct   = clamp(bldg_density * 0.5)                // urban conflagration

hazard = clamp(0.7*h_time + h_spot + 0.2*h_struct)
```

Emits `eta_minutes = eta_s/60` for UI.
