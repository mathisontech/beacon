# Flash flood

## safetyScore(cell)

```
s_hand      = clamp(hand_m / 10)                     // >10 m above drainage = safe
s_notchan   = 1 - channel_mask                        // HydroSHEDS streams
s_slope_away= clamp(slope_away_from_drainage / 5)
s_elev_rank = percentile_in_500m(elev_m)              // local high ground
s_nothollow = clamp((tpi + 20) / 40)                  // avoid concave cells
s_egress_up = clamp(1 / (1 + dist_to_higher_ground_m / 100))
penalty_bldg_base = bldg_density>0.3 && hand_m<3 ? 0.3 : 0

safety = 0.35*s_hand + 0.10*s_notchan + 0.10*s_slope_away
       + 0.20*s_elev_rank + 0.10*s_nothollow + 0.15*s_egress_up
       - penalty_bldg_base
```

## hazardScore(cell, event)

Event: upstream rainfall rate `R_mm_hr`, basin area `A_km2`, antecedent soil moisture `theta`.

```
Q_proxy    = R_mm_hr * A_km2 * (0.2 + 0.8*theta)     // crude rational
stage_m    = k * Q_proxy^0.4                          // regime curve
inund      = stage_m > hand_m ? (stage_m - hand_m) : 0
h_depth    = clamp(inund / 2)                         // 2 m = 1.0
h_vel      = slope_deg>5 && inund>0 ? 0.3 : 0
h_channel  = channel_mask * 0.4
h_debris   = (landcover==burn_scar || canopy_loss) ? 0.2 : 0

hazard = clamp(h_depth + h_vel + h_channel + h_debris)
```
