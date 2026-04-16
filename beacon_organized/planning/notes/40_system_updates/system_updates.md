# System Updates

## Overview

Beacon uses multi-channel update strategy: Expo EAS for JavaScript runtime updates (business logic, UI, hazard models), native binary updates via App Store/Play Store (critical system components), and ML model distribution via OTA delta updates (minimize bandwidth). Update scheduling prioritizes non-emergency periods; critical security patches bypass scheduling.

## Expo EAS Over-the-Air Updates

Expo EAS (Expo Application Services) enables JavaScript bundle updates without app store review. Beacon uses EAS Update to ship code changes (feature development, bug fixes, business logic changes) within 1-4 hours of deployment.

Deployment workflow: Developer commits code to main branch, CI/CD pipeline builds JavaScript bundle, Expo CLI publishes to EAS servers. Staging environment (shadow traffic, 1% of users) receives update first. Metrics collected: crash rate, performance, usage. If metrics OK after 12 hours, production rollout (100% of users) begins.

Update propagation: App checks for updates on startup or after 24 hours of runtime (whichever earlier). If new version available, download (typically 2-5MB bundle) during WiFi sync or on-demand over LTE. User notified: "App update ready. Install now? (Requires restart)"

Non-blocking updates: JavaScript updates do not require app restart (hot reload). Code changes (business logic, maps, models) apply within 5 seconds. UI changes require restart.

Rollback: If production update causes crash (e.g., >10% crash rate within 1 hour), EAS automatically rolls back to prior version. Users are notified: "App update rolled back due to stability issue. Please report problems."

Update history: Users can view prior versions applied, revert to prior version if desired (for known issues). Versions retained for 30 days.

## Native Binary Updates

App Store/Play Store updates ship quarterly (or on critical security patches). Native layer includes:
- React Native core runtime
- Network stack (mesh protocol, HTTP client)
- Camera/sensor drivers
- Maps rendering engine
- Cryptography library (OpenSSL)

Binary updates required for:
- New OS APIs (iOS version requirements, Android API level bump)
- Security patches (library CVEs)
- Performance optimizations (camera, mesh, rendering)
- New sensors/permissions

Update rollout: Deploy to TestFlight (iOS) / Google Play Internal Testing first. Beta test with 10K users for 1 week, collect crash reports. If crash rate <0.1% and no critical issues, submit to App Store/Play Store for review (1-2 day review cycle). Once approved, staged rollout: 5% of users day 1, 25% day 2, 100% by day 3.

Forced update: For critical security patches (e.g., media player CVE affecting playback of disaster footage), system can force updates. App shows dialog: "Critical security update required. Update now? (App will not start without update)". Users cannot defer.

Update size: Binary updates 30-50MB. Encourage download on WiFi. Over LTE, allow users to choose: download now or defer until WiFi. No defer on forced security updates.

## ML Model Versioning and OTA Updates

Hazard models (fire spread, flood, wind, avalanche) versioned independently. Each model has version ID (e.g., fire_spread_v2.3.1) and training metadata (training date, training data sources, validation RMSE).

New model deployment: When new model epoch released (monthly), EAS Update includes model weights (trained PyTorch model, quantized to TensorFlow Lite). Model files embedded in JavaScript bundle, distributed via EAS Update.

Model selection: Device can optionally run multiple model versions and compare outputs (e.g., run v2.2 and v2.3, average results if agreement >80%, escalate to human oversight if disagreement). Useful for A/B testing new models.

Fallback: If new model causes inference failures (e.g., outputs NaN), app automatically falls back to prior stable version. Fallback logged for debugging.

Historical model access: Users can query prior model outputs for past events. Example: "What did the fire model predict 6 hours before the evacuation?" Useful for understanding decision-making post-event.

## Tile Delta Updates

Map tiles (terrain, imagery, structures) updated incrementally. Base tiles (terrain, roads) updated quarterly via native binary. Thematic tiles (buildings, utilities) updated monthly via EAS Update.

Delta mechanism: Only changed tiles distributed. If 1000 tiles changed out of 100K tiles since last update, only 1000 tiles downloaded (~20MB vs. 500MB if all tiles updated).

Tile versioning: Each tile has hash ID. Client requests delta: "I have hash [old], what's changed?" Server responds: "Hashes [new] have changed. Download [delta bundle]."

Compression: Delta bundles compressed (zstd, 70% ratio typical). 20MB → 6MB compressed.

Incremental delivery: Tiles prioritized: user's current map area updated first, surrounding areas updated in background. User can use app while tiles updating.

## Force Update Policy

Critical security patches force immediate update:
- Network protocol exploits
- Cryptography library vulnerabilities
- Media player exploits
- OS integration vulnerabilities

Force criteria: CVSS ≥7.0 (high severity) and exploit is known/active. Force updates delivered via EAS Update (for JavaScript) or require app store version update (for binary).

User UX for force update: Dialog: "Critical security update required. Your app will not function without this update. Update now?" Button: "Update" (only option). No defer. App becomes non-functional if update declined (shows error: "Please update app from app store").

Scheduled updates (non-critical): Updates can be deferred by users for up to 7 days. After 7 days, app shows increasingly persistent reminders. After 14 days, update applied without user consent (non-blocking, applies at next startup).

Update windows: Non-critical updates scheduled for 2-6am local time (low-usage period). Avoids disrupting users during day/evening. Users can override and force immediate update if desired.

## Rollback Procedures

Automatic rollback: If production system detects anomaly within 1 hour of update deployment, automatic rollback triggered:
- Crash rate spike (>10% above baseline)
- API error rate spike (>5% errors)
- Model inference failures (>1% errors)
- Network protocol failures (>2% disconnects)

Rollback execution: EAS reverts to prior version, users re-download old bundle (usually cached, ~5 MB transfer if not cached). Automatic re-download within 5 minutes.

Manual rollback: Admin can manually trigger rollback via dashboard (e.g., if new feature causing user confusion and we want to defer). Requires approval from two admins.

Notification: Users notified: "App update was rolled back due to [issue]. Please report any problems. Reverting to prior version."

Post-rollback: Development team investigates issue, fixes locally, re-deploys to staging. No re-deployment to production until issue confirmed resolved and 48-hour stability window achieved.

## Implementation Notes

Version tracking: AppVersion table (build_number, version_string, release_date, channel [staging/production], rollout_percentage, crash_rate, manual_rollback_flag). Indexed for quick lookup of current production version.

Deployment infrastructure: GitHub Actions CI/CD → Expo EAS publish → Firebase Remote Config (feature flags) → user clients. Parallel channels: staging (test), production (users), rollback-ready (prior version, ready for quick redeploy).

User consent: Updates require user acknowledgment (except forced security patches). In-app notification + badge count. Users can disable auto-updates if desired; manual check for updates in settings.

Bandwidth optimization: Update downloads occur during WiFi sync, never force LTE. Users can see data saved/pending updates in settings.

Scale: Beacon targets 50M users. Daily active users: 10M. EAS bundle size: 3MB, Δ typically 500KB. Daily EAS update traffic: 10M × 500KB = 5TB, spread over 24 hours = 58 MB/sec average. Peak (rollout phase): 200 MB/sec.
