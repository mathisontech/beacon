# 52. System Updates Architecture

## Overview
Multi-channel OTA update strategy: JavaScript runtime via Expo EAS (fast, no app store), native binaries via App Store/Play Store (security, OS integration), ML models via delta updates (minimal bandwidth). Automatic rollback on anomaly detection; staged rollout (1% → 10% → 50% → 100%).

## Ownership
- **Module Lead:** Infrastructure Engineer
- **Reports to:** CTO
- **Team Size:** 2 (1 infrastructure, 1 mobile platform)

## Parent/Submodules
- Parent: 40_system_updates
- Submodules: EAS Updates, Binary Updates, Model OTA, Rollback, Version Management

## Goals
- <4hr from commit to production for non-critical updates
- <1hr for critical security patches
- Auto-rollback within 5min if crash rate >10%
- Staged rollout complete in 72 hours
- Zero downtime during rollback
- Bandwidth optimized: delta updates, compression

---

## Functions

| Function | Purpose | Input | Output | SLA | Dependencies |
|----------|---------|-------|--------|-----|--------------|
| build_eas_bundle | Compile JS → EAS bundle | Git commit hash + version | EAS bundle (.tar.gz) | 15min | Node.js, Expo CLI |
| publish_eas_staging | Push to staging channel | EAS bundle | Staging URL | 5min | EAS servers |
| run_staging_tests | Smoke test on 1% users | Staging URL | Test results | 1hr | Staging users |
| approve_production | Validate ready for prod | Test results + metrics | Approval token | 30min | QA gate |
| publish_eas_production | Push to production channel | EAS bundle + approval | Production URL | 5min | EAS servers |
| configure_rollout_stages | Set 1%/10%/50%/100% schedule | Rollout config | Deployment plan | <5min | Firebase Remote Config |
| deploy_rollout_stage | Deploy to next cohort | Deployment plan + stage | Stage deployed | <10min | Remote Config |
| monitor_rollout_metrics | Track crash/error rates per stage | Live app telemetry | Metrics dashboard | Continuous | Crashlytics, Sentry |
| detect_rollout_anomaly | Alert on crash/error spike | Metrics stream | Anomaly flag + severity | 2min | Anomaly detection model |
| trigger_automatic_rollback | Revert to prior version | Anomaly detection result | Rollback executed | 5min | EAS servers |
| notify_rollback | Alert users + team of rollback | Rollback event | Notification published | 1min | Push notification service |
| compute_version_delta | Diff old/new app version | Version A, Version B | Delta bundle | 5min | Delta compression lib |
| publish_model_update | Release new hazard model | Model weights + version | Model version published | 10min | Model registry |
| bundle_model_in_app | Embed model in app bundle | Model + TFLite | App bundle | <5min | Build pipeline |
| validate_model_compatibility | Check model/app compatibility | Model version, app version | Compatibility matrix | <1min | Version matrix DB |
| download_eas_update | Client pull latest update | App version | Update downloaded | <30sec | WiFi/LTE |
| apply_eas_update | Install update on device | Downloaded bundle | Update applied | <5sec | Device storage |
| schedule_noncritical_update | Queue update for 2-6am | Update metadata | Scheduled job | <1min | Scheduler |
| force_critical_update | Push security patch immediately | Critical CVE metadata | Update forced | <5min | Push notification |
| handle_update_decline | User rejects deferred update | User response | Reminder scheduled | <1min | Reminder queue |
| apply_delayed_update | Auto-apply after 14 days | Deferred update + deadline | Update applied at startup | - | Startup hook |
| generate_version_changelog | Create release notes | Version diff, PR titles | Changelog markdown | 10min | Git API |
| archive_version_history | Store old version info | Version metadata | Archived in DB | <1min | Version DB |
| compute_app_size | Estimate download size | App bundle | Size estimate (MB) | <1min | Bundle analyzer |
| show_update_dialog | Prompt user for update | Update available flag | User response (yes/no) | - | UI component |
| enable_hot_reload | Apply code change without restart | Update content | New code active | <5sec | RN bridge |
| disable_auto_updates | User opts out of auto updates | User preference | Preference stored | <100ms | User preferences DB |
| check_for_updates | Client polls update server | App version | Update available flag | 5sec | EAS API |
| compress_bundle | Reduce bundle size | EAS bundle | Compressed bundle | 2min | zstd compression |
| parallel_deploy | Deploy to multiple regions | Version + regions | Multi-region deployment | 15min | CDN config |

---

## Data Storage

| Table | Purpose | Key Fields | Retention |
|-------|---------|-----------|-----------|
| app_versions | App build history | build_number, version_string, release_date, channel, rollout_percentage | 1 year |
| model_versions | Hazard model versions | model_id, version, training_date, validation_rmse, release_notes | 2 years |
| deployment_history | All update deployments | version_id, deployment_time, channel, rollout_completion_time | 1 year |
| rollout_metrics | Per-stage metrics | version_id, stage, crash_rate, error_rate, user_count, timestamp | 1 year |
| rollback_events | Rollback triggers + decisions | version_id, reason, automatic_flag, timestamp, approved_by | 2 years |
| user_update_status | Individual user update state | user_id, current_version, version_installed_at, last_check | 90 days |
| critical_patches | Security patch tracking | cve_id, severity, affected_versions, patch_version, deployed_at | 3 years |
| update_failures | Failed update logs | user_id, version, error_code, error_message, timestamp | 30 days |

---

## Message Bus (NATS)

| Channel | Publisher | Subscriber | Frequency | Payload |
|---------|-----------|------------|-----------|---------|
| deploy.eas.staging | EAS API | Monitoring, QA | On deploy | {version, timestamp, channel} |
| deploy.eas.production | EAS API | Monitoring, Users | On deploy | {version, rollout_stage, timestamp} |
| rollout.stage.begin | Rollout Manager | Monitoring | Per stage | {version, stage_pct, eta_complete} |
| rollout.stage.complete | Rollout Manager | Slack, Email | Per stage | {version, stage_pct, user_count, metrics} |
| rollout.anomaly.detected | Anomaly Detector | Incident Commander | On spike | {metric, previous_baseline, current_value, z_score} |
| rollback.triggered | Incident Commander | Users, Team | On rollback | {version, reason, eta_complete} |
| model.update.available | Model Registry | Apps | On release | {model_id, version, size_kb, release_notes} |
| update.user.prompted | App Client | Analytics | On prompt | {version, user_response, offered_defer} |
| update.user.downloaded | App Client | Analytics | On download | {version, download_time_sec, file_size_kb} |

---

## Cache (Redis)

| Key Pattern | Purpose | TTL | Size | Update Freq |
|-------------|---------|-----|------|------------|
| deploy:current_production_version | Active prod version | Permanent | 100B | Per deploy |
| rollout:stage_percentage | Current rollout %age | 1min | 50B | Per stage trigger |
| metrics:crash_rate:1hr | Last hour crash rate | 1hr | 100B | Per minute |
| metrics:error_rate:1hr | Last hour error rate | 1hr | 100B | Per minute |
| model:latest:{model_id} | Latest model version per type | Permanent | 1KB | Per model release |
| user:version_status:{user_id} | User's installed version | 24hr | 100B | Per check |
| rollback:ready_version | Prior version ready to rollback to | Permanent | 100B | Per new deploy |

---

## External Integrations

| System | Purpose | Protocol | Auth | SLA |
|--------|---------|----------|------|-----|
| Expo EAS | JavaScript bundle hosting | REST API | API key | <5min deploy |
| Firebase Remote Config | Feature flags, rollout control | Firebase SDK | API key | <1min sync |
| Crashlytics | Crash telemetry | Firebase SDK | API key | <5min reporting |
| Google Play Store | Android binary distribution | Play Console API | OAuth2 | 1-2 day review |
| Apple App Store | iOS binary distribution | App Store Connect API | JWT key | 1-2 day review |
| GitHub Actions | CI/CD pipeline | GitHub API | OAuth2 | <15min build |
| AWS Lambda | Automated rollout tasks | AWS SDK | IAM role | <1sec invoke |
| PagerDuty | Incident alerting | REST API | API key | <1min notify |

---

## API Contracts

### Check for Update (Client → Server)
```
GET /api/v1/updates/check?current_version=1.2.3&app_channel=ios
Response: {
  update_available: true,
  latest_version: "1.2.4",
  download_url: "https://eas.expo.dev/bundle/...",
  release_notes: "Bug fixes and performance improvements",
  size_bytes: 2500000,
  critical: false,
  can_defer: true,
  defer_days: 7
}
```

### Get Version Status (Admin Dashboard)
```
GET /api/v1/admin/deployments/latest
Response: {
  version: "1.2.4",
  channel: "production",
  rollout_percentage: 50,
  rollout_stage: 2,
  metrics: {
    crash_rate: 0.012,
    error_rate: 0.008,
    user_count: 5000000
  },
  status: "rolling_out",
  eta_complete: "2026-03-12T14:00:00Z"
}
```

### Trigger Rollback (Admin Only)
```
POST /api/v1/admin/rollback
Body: {
  version: "1.2.4",
  reason: "unacceptable_crash_rate"
}
Response: {
  rollback_initiated: true,
  rollback_to_version: "1.2.3",
  eta_complete_sec: 300
}
```

### Publish Model Update
```
POST /api/v1/models/publish
Body: {
  model_id: "wildfire_v2.3.1",
  weights_url: "s3://bucket/models/wildfire_v2.3.1.tflite",
  validation_rmse: 0.087,
  release_notes: "Improved seasonal accuracy"
}
Response: {
  version_published: true,
  bundle_size_bytes: 45000000,
  deployment_status: "ready_for_eas_bundle"
}
```

---

## Rollout Strategy

### Stage 1: Staging (1% of beta testers)
- Duration: 12 hours
- Metrics threshold: Crash rate <0.5%, Error rate <0.2%
- Decision: If metrics OK → proceed to Stage 2; else → fix and redeploy

### Stage 2: Small Production (1% of users)
- Duration: 24 hours
- Users: ~50K active users
- Metrics threshold: Crash rate <0.8%, Error rate <0.5%
- Decision: If metrics OK → proceed to Stage 3; else → automatic rollback

### Stage 3: Medium Production (10% of users)
- Duration: 24 hours
- Users: ~500K active users
- Metrics threshold: Crash rate <1.2%, Error rate <0.8%
- Decision: If metrics OK → proceed to Stage 4; else → rollback

### Stage 4: Full Production (100% of users)
- Duration: 24 hours
- Users: 5M+ active users
- Metrics threshold: Crash rate <1.5%, Error rate <1.0%
- Completion: Once 95% of users updated (≈7 days)

---

## Automatic Rollback Triggers

| Metric | Threshold | Action | Latency |
|--------|-----------|--------|---------|
| Crash rate | >10% above baseline | Auto rollback | 5min |
| API error rate | >5% errors | Auto rollback | 5min |
| Model inference failure | >1% errors (NaN outputs) | Auto rollback | 5min |
| Network protocol failure | >2% disconnects | Auto rollback | 5min |
| App startup failure | >0.5% | Auto rollback | 10min |

---

## Force Update Policy

**Trigger Criteria:** CVSS ≥7.0 OR known active exploit

| Severity | Action | User UX | Timeline |
|----------|--------|---------|----------|
| Critical | Force immediate | "Update required. App will not start without update." | <1hr |
| High | Scheduled force | "Critical update available. Defer until 2am?" | 14 days max defer |
| Medium | Soft nudge | "Update recommended. Check now?" | 30 days before auto-install |
| Low | Optional | "Update available. Install now?" | User choice, no deadline |

---

## Deferred Update Behavior

- **Initial offer:** "Update now or defer? (Up to 7 days)"
- **After 7 days:** "Important update ready. Dismiss or install?" (reminder every 24hrs)
- **After 14 days:** Auto-install at next startup (non-critical only)
- **Critical security:** No defer option; force update immediately

---

## Offline & Mesh Considerations

- **Mesh deployment:** Updates replicated via mesh nodes; priority given to high-connectivity hubs
- **No-service updates:** Client checks version at startup; if newer available locally (via mesh), prompts user to install
- **Model distribution:** Models (45MB wildfire, 32MB flood) bundled in app update; mesh replication not needed (size too large)

---

## Cost Breakdown

| Component | Cost/Month | Scale | Notes |
|-----------|-----------|-------|-------|
| Expo EAS hosting | $500 | 50M users, ~5TB/month traffic | 3MB bundle × 10M daily active users ÷ 24hrs |
| Firebase Remote Config | $100 | Feature flag management | Minimal usage |
| Crashlytics | $0 | Included in Firebase | |
| GitHub Actions | $200 | 100+ daily CI/CD builds | 15min builds, parallelized |
| AWS Lambda (rollout automation) | $50 | Auto-deploy tasks | Triggered per rollout stage |
| App Store/Play Store review | $0 | Binary updates quarterly | No per-transaction cost |
| **Subtotal** | **$850** | | |
| **Peak event (10x traffic for rollback)** | **$8,500** | 10-day incident + daily deployments | Temporary spike |

---

## Monitoring (5-Agent Team)

| Agent | Role | Frequency | Key Metrics | Escalation |
|-------|------|-----------|-------------|-----------|
| Quality | Deployment success, test coverage | Daily | Build success rate, test pass rate | >5% build failures |
| Research | Update adoption, version distribution | Weekly | Version distribution curve, adoption curve | Adoption <50% after 7 days |
| Business | Update speed, SLA compliance | Daily | Deploy-to-prod time, rollback frequency | Deploy >4hrs, rollback >2/month |
| Compliance | Patch tracking, CVE remediation | Daily | Patch deployment lag, critical patch status | Unpatched critical CVE >7 days |
| Lead | Rollout decision authority | Per stage | Metrics vs thresholds, team escalations | Any threshold exceeded |

---

## Dependencies

| Module | Dependency | Type | Criticality |
|--------|-----------|------|------------|
| 32_operating_system | React Native, iOS/Android SDKs | Hard | Critical |
| 50_modeling_simulation | Model bundle integration | Hard | Critical |
| 33_agentic_planners | Agent deployment configs | Soft | Medium |
| All other modules | OTA delivery mechanism | Soft | High |

---

## Implementation Notes

- **EAS workflow:** Git commit → GitHub Actions build → Expo CLI publish to EAS staging → validation → Expo CLI publish to EAS production
- **Rollout control:** Firebase Remote Config manages rollout percentage per app version; client queries at startup + every 24 hours
- **Automatic rollback:** CloudWatch anomaly detection triggers on crash rate; Lambda function reverts Remote Config to prior version
- **Offline updates:** App bundle cached locally; mesh peers can share bundles (P2P, local network only)
- **Model distribution:** Models embedded in EAS bundles (not separate OTA); version tracked per app version
- **Binary updates:** Quarterly releases to App Store/Play Store; security patches can bypass normal review cycle via expedited review
