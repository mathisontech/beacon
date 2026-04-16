# Volcano

## safetyScore(cell)

```
s_dist        = clamp(volcano_dist_m / 30000)         // 30 km = 1.0
s_not_valley  = 1 - drainage_from_volcano_mask        // lahars follow valleys
s_elev_above  = clamp((elev_m - volcano_base_elev)/500)
s_upwind_clim = 1 - prevailing_downwind_frac          // climatology ashfall
s_hand_lahar  = clamp(hand_m / 20)

safety = 0.35*s_dist + 0.20*s_not_valley + 0.15*s_elev_above
       + 0.15*s_upwind_clim + 0.15*s_hand_lahar
```

## hazardScore(cell, event)

Event: GVP alert level `{normal, advisory, watch, warning}`, VEI estimate, ash plume height `H_km`, wind column.

```
alert_w    = {normal:0.0, advisory:0.3, watch:0.6, warning:1.0}[alert]
r          = volcano_dist_m
vei_reach  = {0:2e3, 1:5e3, 2:10e3, 3:30e3, 4:100e3, 5:300e3, 6:1e6}[VEI]
h_pyro     = r < vei_reach ? clamp(1 - r/vei_reach) : 0
h_lahar    = drainage_from_volcano_mask * clamp(1 - r/vei_reach) * (VEI>=2 ? 1 : 0.3)
h_ashfall  = downwind_of_plume(cell, wind) * clamp(VEI/4)
h_ballistic= r < 5000 && VEI>=3 ? 0.5 : 0

hazard = clamp(alert_w * max(h_pyro, h_lahar, h_ashfall, h_ballistic))
```
