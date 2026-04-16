# Operating System Architecture

## React Native / Expo Stack

Beacon uses React Native with Expo for code sharing between iOS and Android, reducing development cost and time-to-market.

**Rationale**
- Single codebase reduces maintenance burden for small team
- Expo managed service simplifies deployment and updates
- Native performance adequate for map rendering and mesh networking (delegated to native modules)
- Over 50% code reuse between platforms

**Architecture**
- Expo SDK 51+ for iOS 14+ and Android 11+
- Native modules in Objective-C (iOS) and Kotlin (Android) for sensor access, mesh stack
- JavaScript Core for business logic
- Metro bundler for development, EAS Build for production distribution

## iOS vs. Android Feature Parity Challenges

**Background Processing**
- iOS BGTaskScheduler allows 30-second processing windows, requires battery status check
- Android WorkManager allows periodic tasks (minimum 15 minutes), no battery restrictions
- Parity solution: Beacon sync frequency capped at 15 minutes on both platforms for consistent behavior

**Sensor Access**
- iOS: Core Motion (accelerometer, gyroscope), Core Location (GPS), CoreBluetooth
- Android: SensorManager, LocationManager, BluetoothAdapter
- Challenge: iOS restricts background location to 500 meters accuracy (vs. Android's full precision)
- Parity: Toggle between high-accuracy (foreground) and standard-accuracy (background) modes

**Push Notifications**
- iOS APNs: Immediate, device token required, includes silent notifications
- Android FCM: 30-second delivery SLA, requires Google Play Services
- Parity: Both support rich media (images, custom sounds); Beacon uses identical payload structure

**File System**
- iOS: App sandbox limits to app-specific documents directory (~10GB available)
- Android: Scoped storage (Android 11+) restricts broad file access, requires user permission
- Parity: Beacon stores tile cache in app-specific directory, respects 5GB limit on both platforms

**Offline Capability**
- iOS: DataVault persistent container survives app force-quit
- Android: SharedPreferences + Room database provide equivalent persistence
- Parity: Both support 30MB local SQLite database for event history

## Background Processing Limitations

**iOS BGTaskScheduler**
- Processing tasks: 30-second budget, executes once per request (not periodic)
- Refresh tasks: 15-minute minimum interval, not guaranteed timing
- Typical use: Beacon syncs mesh state, downloads updated hazard tiles
- Battery impact: Minimal; iOS suspends if power reserve < 20%

**Android WorkManager**
- Periodic: Minimum 15-minute interval, respects Doze mode (batched with other apps)
- One-time: Immediate execution if constraints satisfied
- Battery impact: WorkManager respects app standby buckets; long-running jobs suspended in Restricted bucket

**Beacon Implementation**
- Mesh network background sync: 15-minute interval (Android), triggered by BGTaskScheduler on iOS
- Priority tasks: Force app to foreground when critical alert received (30-second window)
- Mesh receives: Always fire local notification to wake app if location update received offline

## Sensor Access: Accelerometer, Gyroscope, Barometer, GPS

**Accelerometer & Gyroscope**
- iOS Core Motion: 100 Hz sampling available
- Android SensorManager: Variable Hz per device, typically 50-200 Hz
- Use case: Detect device orientation (portrait/landscape) for map UI, detect if user is moving (evacuation confirmation)
- Permissions: iOS prompts on first access; Android requires runtime permission (API 31+)

**Barometer**
- iOS: Core Motion pressure sensor (if available on newer iPhones)
- Android: android.hardware.sensor.barometer (available on most modern devices)
- Use case: Estimate elevation for evacuation route planning (critical in mountainous areas)
- Parity challenge: Not all devices have barometer; Beacon falls back to map elevation data

**GPS**
- iOS: Core Location, CLLocationManager
- Android: LocationManager
- Accuracy: 5-20 meters in open air, degrades in urban canyons, tunnels
- Battery impact: High; Beacon uses standard accuracy (100m) in background, high accuracy (5m) on demand
- Permissions: Both iOS and Android require location permission; Beacon uses "while using" scope for non-background sharing

**Mesh Network Integration**
- Accelerometer used to detect if user is stationary (suppresses redundant position broadcasts)
- Barometer provides elevation for altitude-aware routing
- GPS provides mesh node location for geographic broadcasts

## On-Device ML Inference

**Core ML (iOS)**
- Framework: Apple Core ML
- Model format: .mlmodel (converted from TensorFlow, PyTorch)
- Inference: CPU/Neural Engine (M-series, A14+)
- Typical latency: 50-200ms per inference
- Use case: Local hazard feature detection (smoke detection from camera, audio anomaly detection)

**TensorFlow Lite (Android)**
- Framework: TensorFlow Lite
- Model format: .tflite (quantized, optimized)
- Inference: CPU/GPU/NNAPI
- Typical latency: 100-300ms per inference
- Use case: Same as iOS, plus support for Qualcomm Snapdragon NPU

**Beacon Models**
- Wildfire smoke detection: EfficientNet-B0, 224x224 input, ~80ms on iPhone 12+
- Flood water surface detection: Custom CNN, 512x512 input, ~200ms
- Both quantized to 8-bit integer format for speed; accuracy loss < 2%

**Model Distribution**
- Models bundled in app binary; no runtime download
- Update cadence: Quarterly app updates via App Store/Play Store
- File size impact: ~30MB total (Expo + native modules + models)

## Push Notification Delivery

**Apple Push Notification Service (APNs)**
- Device Token: Beacon obtains token on app launch, renews if invalid
- Payload: Max 4KB per notification, includes title, body, badge, sound
- Delivery: Prioritized (high) for critical alerts, default for informational
- Silent notifications: No user alert; wakes app to download data in background

**Firebase Cloud Messaging (FCM)**
- Device Token: Registered with Firebase after GooglePlayServicesAvailable check
- Payload: Max 4KB, supports data-only messages (no user alert)
- Delivery: Best-effort, batches notifications if device sleeping
- Priority: High (immediate if device awake), normal (batched)

**Beacon Architecture**
- Critical alerts (evacuation orders): High priority on both platforms, triggers 30-second background processing window
- Informational updates (new hazard reports): Normal priority, batches with other app notifications
- Mesh network updates: Data-only notification wakes app to sync local state

## Battery Optimization & Emergency Override

**Standard Mode Battery Management**
- Location services: Standard accuracy only, updated every 5 minutes
- Mesh sync: 15-minute background interval
- Display: Auto-lock after 2 minutes
- Estimated battery consumption: 3-5% per hour during active use

**Emergency Mode** (activated during active event)
- Location services: High accuracy, updates every 30 seconds
- Mesh sync: 5-minute background interval
- Display: Prevents auto-lock, screen brightness fixed at maximum
- Estimated battery consumption: 15-20% per hour (sustainable for ~5 hours)

**Battery Saver Override**
- Beacon disables battery saver mode during active event (with user consent)
- Alert: "Beacon will use significant battery during this event. Disable battery saver?"
- Implementation: `BatteryManager.setOptimizationBanned()` on Android, background activity exception on iOS
- Recovery: Battery saver re-enabled after event concluded or 24 hours elapsed

## App Distribution & Update Strategy

**iOS App Store**
- Review process: 24-48 hours typical
- Phased rollout: Beacon uses 5% initial, increase 25% daily
- Automatic updates: Enabled by default, users can defer
- Minimum iOS: 14.0

**Google Play Store**
- Review process: 2-4 hours typical
- Phased rollout: 10% initial, increase 50% daily
- Staged rollout available for production testing
- Minimum Android: 11 (API level 30)

**Critical Update Cadence**
- Security patches: Deployed within 24 hours
- Bug fixes: Weekly batches (Monday releases)
- Feature releases: Bi-weekly cycle
- Model updates: Quarterly (coordinated with hazard team)
