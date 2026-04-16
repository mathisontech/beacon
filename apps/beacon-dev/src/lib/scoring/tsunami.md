# Tsunami

## safetyScore(cell)

```
s_elev       = clamp((elev_m - 10) / 20)              // ≥30 m = 1.0
s_dist       = clamp(dist_coast_m / 2000)             // 2 km inland
s_hand_coast = clamp(hand_m / 15)
s_notriver   = 1 - river_mouth_mask                   // bores travel upriver
s_egress_up  = clamp(1 / (1 + time_to_20m_contour_s / 600))

safety = 0.40*s_elev + 0.20*s_dist + 0.20*s_hand_coast
       + 0.10*s_notriver + 0.10*s_egress_up
```

Hard rule: `elev_m >= 30 AND dist_coast_m >= 1000` → 1.0.
Hard rule: `elev_m < 3 AND dist_coast_m < 500` → 0.0.

## hazardScore(cell, event)

Event: source magnitude `M`, source distance `D_km`, est. runup `R_m`.

```
wave_arrival_s = D_km * 1000 / sqrt(9.8 * mean_depth_m)
inund_max_m    = R_m                                   // assume runup as ceiling
h_inund        = elev_m < inund_max_m ? clamp((inund_max_m - elev_m)/5) : 0
h_time         = exp(-wave_arrival_s / 900)            // urgency within 15 min
h_channel      = river_mouth_mask * 0.3

hazard = clamp(0.7*h_inund + 0.2*h_time + h_channel)
```
