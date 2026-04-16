# Hazard Framework

## Module Structure

All 25 hazard models follow 12-module standard:

| Module | Purpose |
|--------|---------|
| Detection | Event identification from sensor data |
| Risk Assessment | Severity, location, affected population |
| Spread/Evolution | Physics-based propagation modeling |
| Alerting | Trigger logic, content generation |
| Shelter/Evacuation | Safe zone mapping, routes |
| Resource Overlays | Hospital, utility, infrastructure location |
| Sensor Integration | Real-time feeds (NOAA, USGS, cameras) |
| DL Surrogate | Physics model → neural net compression |
| On-Device Inference | TFLite/CoreML execution |
| Validation | Accuracy metrics, post-event AAR |
| Communication/UI | Maps, tables, notifications |
| Vulnerability Assessment | Building, population, infrastructure risk |

## DL-ification Pipeline

```
Physics Model → Train Surrogate → Quantize/Prune/Distill → TFLite/CoreML
```

- Tier 1 (priority): Wildfire (Rothermel), Flood (HEC-RAS), Tsunami (MOST), Smoke (HYSPLIT)
- Tier 2 (secondary): Earthquake (ShakeMap), Avalanche (RAMMS), Surge (SLOSH), Landslide (Newmark)
- Tier 3 (native-fast): Tornado, Hurricane, Winter Storm, Dust, Extreme Heat, Air Quality

## Shared Functions (15+)

| Function | Purpose | Ownership |
|----------|---------|-----------|
| detect_hazard_event() | Parse sensor feeds, trigger detection | Detection |
| assess_risk_level() | Compute severity 1-5 | Risk Assessment |
| predict_spread() | Run physics/DL model | Spread/Evolution |
| generate_safe_zones() | Compute evacuation perimeter | Shelter/Evacuation |
| calculate_lethality() | Heat, smoke, structural damage risk | Vulnerability |
| estimate_casualties() | Affected population × lethality | Risk Assessment |
| generate_alert_content() | Alert text, map layers | Communication |
| validate_prediction() | Compare forecast vs observed | Validation |
| compute_asymmetric_loss() | Custom loss weights per hazard | Training |
| run_digital_twin_test() | Synthetic event replay | Validation |
| detect_model_drift() | Monitor accuracy over time | Validation |
| trigger_retraining() | Flag stale models | Training |
| compress_for_device() | Quantize/prune model | DL Surrogate |
| deploy_ota_model() | Push update to devices | On-Device |
| run_post_event_aar() | After-action review & logging | Validation |

## Asymmetric Loss Weights

| Hazard | FN Weight | Notes |
|--------|-----------|-------|
| Wildfire | 1000x | Spread, life safety critical |
| Flood | 500x | Slow onset, evacuation window |
| Hurricane | 300x | Compound hazards, surge |
| Earthquake | 100x | Short warning window |
| Severe Weather | 200x | Tornado, hail fatality risk |
| Tsunami | 400x | Minimal warning time |

## Module Accuracy Targets

| Module | Metric | Target |
|--------|--------|--------|
| Detection | Sensitivity | >99% |
| Risk Assessment | Severity classification | >95% |
| Spread | Perimeter error at T+1h | <5% |
| Spread | Perimeter error at T+6h | <15% |
| Alerting | False positive rate | <2% |
| Shelter | Evacuation zone coverage | >98% |
| Vulnerability | Building damage prediction | >85% |
| Lethality | Casualty range (factor 2) | 90% |

## Shared Databases

| Database | Schema | Retention |
|----------|--------|-----------|
| hazard_events | type, location, start_time, magnitude, extent | 10y |
| hazard_predictions | event_id, model, forecast_time, geojson, confidence | 10y |
| hazard_observations | event_id, source, timestamp, feature, value | 10y |
| hazard_alerts | event_id, alert_id, tier, recipients, issuance_time, dismissal_time | 10y |
| model_versions | hazard_type, model_name, accuracy, deployment_date, status | indefinite |
| validation_results | model_id, test_event, metric, score, date | indefinite |

## NATS Messaging

```
hazard.{type}.detection → Detection module publishes
hazard.{type}.prediction → Spread module publishes forecasts
hazard.{type}.alert → Alerting module publishes
hazard.{type}.validation → Validation publishes QC results
```

## Agent Monitor Teams

Per hazard, 5-agent team:

| Agent | Responsibility |
|-------|-----------------|
| Quality | Accuracy, drift detection, model performance |
| Research | NOAA/USGS updates, academic papers, new methods |
| Business | Compute costs, model latency, deployment strategy |
| Compliance | Alert legality, disclaimer compliance, Good Samaritan review |
| Ops | Sensor uptime, data pipeline, incident response |

## Event Lifecycle

```
Detection → Auto-trigger (15-min override window) → Active Monitoring
→ Event Close (T+24h or hazard end) → AAR (T+7d)
```

## Cross-Hazard Coordination

- Wildfire → Smoke → Air Quality chain
- Flood → Dam Failure cascade
- Earthquake → Tsunami, Liquefaction, Landslide
- Hurricane → Flood, Surge, Wind Damage

## Legal/Compliance

- Good Samaritan review: All alerts checked for liability
- Disclaimer: Forecast data for advisory only
- Equal Protection: Safe zone routing verified bias-free
- Data Privacy: Location aggregation at zipcode level minimum
