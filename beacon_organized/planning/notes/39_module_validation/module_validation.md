# Module Validation & Performance Metrics

## Asymmetric Loss Weighting: False Negatives vs. False Positives

Beacon prioritizes preventing missed hazards (false negatives) over false alarms. Loss functions are weighted asymmetrically to reflect this priority.

**False Negative Penalty**
- Missed wildfire: 1000x weight (most dangerous - lives lost)
- Missed flood: 500x weight (cascading failures, infrastructure damage)
- Missed earthquake: 100x weight (USGS detects, but Beacon missed local validation)
- Missed severe weather: 200x weight (lead time lost for evacuation)

**False Positive Penalty**
- False wildfire alarm: 1x weight (EMS skepticism, user fatigue)
- False flood alarm: 1x weight (evacuation cost, economic impact)
- False earthquake alarm: 10x weight (triggers unnecessary evacuation, high social cost)
- False weather alarm: 5x weight (user trust erosion)

**Weighting Rationale**
- Wildfire FN worst: Undetected fire spreads exponentially, fast-moving
- Flood FP more tolerable: Residents can ignore false flood alert; missing real flood causes drowning
- Earthquake asymmetry smaller: USGS catches most earthquakes; Beacon's role is confidence boosting

**Model Training Impact**
- Loss function: `Loss = FN_weight * loss_negative + FP_weight * loss_positive`
- Threshold tuning: Model confidence threshold set to minimize weighted loss (not F1)
- Example: Wildfire model publishes alerts at 60% confidence (vs. typical 70%) to reduce FN rate

## Per-Module Accuracy Metrics

**Wildfire Module**
- Precision: % of published alerts that had actual fire within 24 hours (target: >85%)
- Recall: % of actual fires detected before spreading beyond initial burn area (target: >90%)
- F1 Score: Harmonic mean (target: >87%)
- Lead Time: Hours between alert publication and fire growth to 10K acres (target: 4+ hours)
- False Alarm Rate: Alerts with no fire detected (target: <15%)

**Flood Module**
- Precision: % of flood extent predictions matching observed water within 12 hours (target: >80%)
- Recall: % of actual flooding areas covered by model prediction (target: >85%)
- F1 Score: Harmonic mean (target: >82%)
- Lag Time: Delay between flood onset and Beacon alert publication (target: <2 hours)
- Depth Accuracy: MAE of predicted vs. observed water depth (target: <0.5 meters)

**Earthquake Module**
- Magnitude Accuracy: MAE of predicted vs. USGS magnitude (target: <0.3)
- Location Accuracy: Median distance between predicted epicenter and USGS location (target: <20km)
- Confidence Calibration: Expected accuracy = reported confidence (target: within 5%)
- Publication Lead Time: Time before USGS official report (target: <30 seconds)

**Severe Weather Module**
- Path Accuracy: % of forecast path overlapping actual storm track (target: >80%)
- Timing Accuracy: Forecast arrival time vs. actual (MAE target: <30 minutes)
- Intensity Prediction: Wind speed accuracy (RMSE target: <10 mph)
- False Alarm Rate: Watches/warnings issued but no weather materialized (target: <10%)

## A/B Testing Framework for Model Updates

**Test Design**
- Control: Current production model
- Treatment: New candidate model
- Metrics: Accuracy metrics above, plus user engagement (acknowledgment rate, route follow-through)
- Sample size: 20% of active users in region with hazard history
- Duration: Minimum 2 weeks or 10 events, whichever is longer

**Randomization**
- Stratified by hazard density (high/medium/low risk regions)
- User-stable (same user sees same model throughout test to avoid confusion)
- Geographic: Model A deployed to counties 1-5, Model B to counties 6-10

**Statistical Testing**
- Primary metric: F1 score improvement (two-proportion z-test)
- Significance threshold: p < 0.05
- Non-inferiority: Treatment must not decrease F1 by >2%
- Sample size calculation: 80% power to detect 3% F1 improvement

**Decision Rules**
- If treatment beats control: Deploy to 100% over 1 week (10% daily increase)
- If equivalent: Keep current model (no regression risk)
- If treatment worse: Revert, investigate failure, schedule follow-up test

**Historical Examples**
- 2026-Q1: XGBoost vs. LightGBM for wildfire (LightGBM won: +4% F1)
- 2026-Q2: ResNet vs. EfficientNet for image classification (EfficientNet won: -0.5% precision, but +3% recall -> net +2% F1)

## Digital Twin Simulation for Pre-Deployment Testing

**Simulation Environment**
- Synthetic hazard scenarios generated from historical event data
- Example: Replay 2022 California wildfire with new model
- Ground truth: Known outcomes (actual fire extent, spread rate)
- A/B comparison: New model vs. old model on same scenario

**Scenario Library**
- 100+ past events: 25 wildfires, 20 floods, 15 earthquakes, 40 weather events
- Normalized features: All scenarios scaled to test region geography
- Edge cases: Rare events (simultaneous hazards), anomalies (model drift)
- Validation: Human experts confirm scenario realism

**Testing Workflow**
1. Extract sensor data from past event (temperature, precipitation, seismic waves)
2. Feed to candidate model in isolation (no external data)
3. Compare predictions to actual observed event
4. Measure accuracy metrics, compare to baseline
5. If metrics acceptable, proceed to A/B test on 5% of users

**Cost**: ~2-4 hours per model update (automated simulation).

## Drift Detection for Model Degradation

**Monitoring Approach**
- Compare live predictions to expected distribution (derived from training data)
- Detect shift in input features (data drift) and output predictions (concept drift)

**Input Drift Detection**
- Monthly comparison of temperature, precipitation, wind distributions
- KL-divergence test: If divergence > threshold (0.1), flag drift
- Example: Winter model tested on summer data shows temperature shift
- Response: Retrain on seasonal data or adjust thresholds

**Output Drift Detection**
- Track published alert confidence scores over time
- If average confidence drops 15% month-over-month, flag potential degradation
- Statistical test: Kolmogorov-Smirnov test on prediction distributions
- Response: A/B test candidate model or investigate feature source (e.g., sensor failure)

**Performance Drift**
- Weekly F1 score tracking: Plot vs. baseline
- Alert: If F1 drops >5% compared to 12-month average
- Root cause: Investigate for data quality issues, sensor failures, model decay
- Recovery: Retrain if detected, or temporarily reduce confidence thresholds

**Monitoring Dashboard**
- Real-time display: F1, precision, recall, false alarm rate
- Alerts: Slack notification if any metric drops >5%
- Trend: 90-day rolling average to distinguish noise from true degradation
- Audit trail: Log all model updates, metric changes for compliance

## Real-Time vs. Training Validation Comparison

**Training Validation** (offline, during development)
- Dataset: Historical data (past events)
- Sample size: 1000+ events per hazard type
- Metric: F1 on held-out test set
- Timing: Measured once per model version
- Example: Wildfire model achieves 89% F1 on 2020-2025 historical data

**Real-Time Validation** (online, during production)
- Dataset: Live predictions vs. observed outcomes
- Sample size: Accumulates over weeks of operation
- Metric: Precision, recall calculated as events complete
- Timing: Continuous measurement, weekly reporting
- Example: Wildfire model shows 82% F1 in first month of deployment (vs. 89% training)

**Discrepancy Analysis**
- If real-time < training by >5%: Investigate
- Common causes: Domain shift (new region), data quality (sensor failure), feature deprecation
- Actions: Retrain on recent data, investigate feature distributions, check sensor health
- Documentation: Log discrepancy in model version history

**Validation Gap Closure**
- Monthly retraining on accumulated recent data
- Gradual improvement in real-time metrics as model adapts
- Target: Converge real-time metrics to within 2% of training metrics

## Benchmark Datasets Per Hazard Type

**Wildfire Benchmark Dataset**
- Source: NIFC historical fires (2000-2025), Sentinel-2 satellite imagery
- Size: 500 confirmed fires, each with 100+ observation points
- Features: Temperature, humidity, wind, vegetation index, burned area
- Ground truth: USGS Burned Area Reflectance Classification (BARC)
- Baseline F1: 87% (from published literature)
- Beacon target: >88% F1

**Flood Benchmark Dataset**
- Source: USGS flood gauge data, NWS flood forecasts, satellite flood extents
- Size: 300 flood events, geographically diverse (coastal, riverine, flash flood)
- Features: Precipitation, stream flow, elevation, land use
- Ground truth: Satellite-derived flood extent (Sentinel-1 SAR)
- Baseline F1: 82% (published models)
- Beacon target: >84% F1

**Earthquake Benchmark Dataset**
- Source: USGS earthquake catalog, NEIC global seismic network
- Size: 1000+ earthquakes (magnitude 3.0-8.0)
- Features: Seismic wave arrivals, magnitudes from multiple networks
- Ground truth: USGS official magnitude, location
- Baseline accuracy: 95% magnitude within 0.2 of USGS
- Beacon target: >97% accuracy

**Severe Weather Benchmark Dataset**
- Source: NWS Storm Data, NOAA Severe Weather Verification, radar archives
- Size: 400 tornado, hail, wind events
- Features: Radar reflectivity, velocity, temperature profile, atmospheric stability
- Ground truth: Storm reports from NWS verification surveys
- Baseline precision: 75%, recall: 80%
- Beacon target: >80% precision, >85% recall

**Annual Benchmark Updates**
- Add new events from current year to benchmark
- Retrain all baseline models with expanded data
- Publish updated baseline metrics (transparent accountability)
- Beacon model updated similarly to maintain relative improvement
