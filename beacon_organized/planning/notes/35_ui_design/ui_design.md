# UI Design System

## Design System Specifications

**Color Palette**
- Primary Navy: #0B0F2A (high contrast background, authority)
- Accent Teal: #0097B2 (interactive elements, call-to-action buttons)
- Hazard Red: #D32F2F (wildfire, danger indicator)
- Hazard Blue: #1976D2 (flood, informational)
- Hazard Orange: #F57C00 (earthquake, warning)
- Hazard Yellow: #FBC02D (severe weather, caution)
- Neutral Gray: #424242 (secondary text)
- Success Green: #388E3C (confirmation, safe)

**Typography**
- Heading: Inter Bold, 20-24px (critical alerts, section titles)
- Body: Inter Regular, 14-16px (descriptions, list content)
- Label: Inter Semibold, 12-14px (form labels, button text)
- Monospace: IBM Plex Mono, 12px (coordinates, technical data)
- Line height: 1.5 (readability)
- Letter spacing: 0.5px (clarity in emergency context)

**Spacing Scale**
- Base unit: 8px
- Gaps: 8px (tight), 16px (standard), 24px (section), 32px (major)
- Padding: 12px (buttons), 16px (cards), 24px (screens)

## WCAG 2.2 AA Accessibility Compliance

**Color Contrast**
- Text: 4.5:1 minimum contrast ratio (Navy on white, Teal on white)
- UI Components: 3:1 for non-text elements (buttons, borders)
- Validation: Checked with WAVE tool, Lighthouse CI
- Exception: Disabled buttons may use lower contrast (not actionable)

**Keyboard Navigation**
- All interactive elements accessible via Tab key
- Tab order logical (left-to-right, top-to-bottom)
- Focus indicator: 2px Teal outline (visible on all interactive elements)
- No keyboard trap: User can exit any element without modifier keys

**Screen Reader Support**
- Semantic HTML: Proper heading hierarchy (h1 > h2 > h3)
- ARIA labels: Image alt text, button purposes, landmark regions
- Live regions: Hazard alerts marked as `role="alert"` for immediate announcement
- Form labels: Each input has associated `<label>` element

**Mobile Accessibility**
- Touch targets: Minimum 44px x 44px (buttons, form fields)
- Pinch-to-zoom: Enabled (maximum 200% zoom)
- Text scaling: Responsive to system text size settings (iOS, Android)
- Motion: Reduced motion respected (disable animations if `prefers-reduced-motion` set)

## Emergency Mode UX

**Activation Trigger**
- Manual: User taps "Emergency Mode" button
- Automatic: App detects FEMA event declaration in user's location; prompts user to activate
- Override: User can dismiss prompt once per session

**Emergency Mode Features**
- Simplified map: Only active hazard layer shown (no overlays, basemap simplified)
- Enlarged controls: All buttons increased to 56px minimum
- High contrast: Background switched to Navy, text to white (maximum contrast)
- Haptic amplification: Every tap produces vibration feedback
- Alert banner: Sticky "Use at Your Own Risk" banner, cannot be dismissed
- Font size: Minimum 18px for all text (overrides system preferences)

**Gesture Simplification**
- No pinch-to-zoom (scroll wheel on map zoom only)
- Single-tap evacuation route: Route to nearest EMS marker pre-calculated, displayed immediately
- Back button: Always visible in top-left corner (red Teal background)
- Direct call: One-tap calling to EMS (phone dialer launched, number pre-filled)

**Navigation**
- Breadcrumb hidden (no space for it)
- Bottom tab bar collapsed (only show active map section)
- No animations during transitions (instant screen changes)

## Haptic Feedback Patterns

**Navigation Feedback**
- Light tap (short, 10ms): Page transition, button press
- Medium tap (50ms, amplitude 80%): Slider change, selection
- Double tap (2x 10ms): Confirmation action (route selected, alert acknowledged)
- Long vibration (200ms): Warning/error state, invalid action

**Mesh Network Events**
- Pulse pattern (500ms cycle): Searching for mesh connection
- Success pattern (3x 20ms rapid taps): Mesh connection established
- Alert pattern (long + short + long): Critical alert received while app backgrounded

**Examples**
- User opens Emergency Mode: Medium tap
- User selects evacuation route: Double tap
- User acknowledges critical alert: Medium tap + screen flash

## Map Layer Selector (Top-Right Dropdown)

**Placement:** Top-right corner of the map interface. Most-used buttons live on the top right.

**Behavior:** Dropdown opens to show available map layers. Layers are sorted by relevance to the current situation:
- During an active hazard, the layers triggering at-risk models appear first. Example during a hurricane: flooding, wind, fallen trees, road conditions.
- Road conditions / transit status layer is ALWAYS one of the suggested layers regardless of hazard type. Includes blocked roads, detours, transit status, plow routes — all in a single composite layer with sublayers expandable via dropdown.
- Group member locations layer (or for EMS: police unit locations) is always suggested.
- Utilities layer is always suggested.

**Sublayer Expansion:** Related layers are grouped. The parent layer shows the composite; tapping the dropdown arrow reveals sublayers. Example: Transit/Road Conditions parent → sublayers: blocked roads, detours, plow routes, transit status, road surface conditions. User can select just "blocked roads" to filter.

**Starred Layers:** Users can star any layer to pin it to the top of the dropdown. Starred layers persist across sessions. Easy unstar with a single tap.

**Layer Content Rules:**
- Each layer shows predicted future state where available BUT only if backed by solid data or a validated model. Do not show predicted tree fall unless the model has been validated. Do show what has been formally projected by authorities or modeled and validated by Beacon.
- Unverified predictions are never shown as fact. If the model exists but hasn't been validated, the layer is suppressed.

**EMS View:** EMS sees the same layer selector but with additional layers: dispatch markings, 911 call locations, resource positions, evacuation zone drawings, mutual aid unit positions.

**Public View:** Public users see hazard predictions, shared status from contacts/group members (location, "I'm stuck", "need help"), loved ones sharing locations, evacuation routes, shelters.

## Aggregated High-Risk Layer

People at high risk are aggregated across all active risk layers and displayed in a single "high risk" composite layer. EMS sees this as a priority dispatch tool. The underlying alert manager within each individual risk layer is already warning those users independently — the aggregated layer exists for EMS situational awareness, not for user self-notification.

Risk aggregation inputs: proximity to hazard perimeter, evacuation route availability, mobility limitations (from vulnerability data), shelter access, vehicle access, medical dependency. Output: per-person severity score displayed as color-coded dots on the EMS map.

## Map Declutter Rules

**Hazard Layer Visibility**
- Wildfire extent: Always visible if active, orange/red heatmap
- Flood zones: Always visible if active, blue polygon with transparency
- Earthquake epicenter: Yellow circle, visible for 2 hours post-event
- Severe weather: Dynamic polygon (moves with storm), animated border

**POI (Points of Interest) Declutter**
- EMS stations: Always visible (green cross marker)
- Evacuation centers: Shown if within zoom level 12+ (limit 50 on-screen)
- Shelters: Shown if zoom 13+, selected evacuation route active
- User location: Always visible (blue dot with 10m radius circle)

**Background Elements**
- Roads: Simplified basemap (major roads only), hidden if hazard opacity > 60%
- Building footprints: Hidden in Emergency Mode, visible if zoom 16+
- Labels: Decluttered if hazard layer covers >50% of map; keep only critical (major cities, highways)

**Timeout Rules**
- Old alerts (>6 hours): Fade to 30% opacity
- Resolved hazards: Remove from map after post-event period (24-48 hours)
- Behind fire-line: Masks map tiles behind active fire perimeter (user cannot see addresses, reduce privacy risk)

## Vehicle Icons & Occupant Counts

**Icon Design**
- Ambulance: Red + white siren symbol, 32px on map, scalable to 48px
- Fire truck: Ladder symbol, red color
- Police: Badge symbol, blue color
- Generic responder: Vehicle silhouette, neutral gray
- Civilian help: Heart symbol (shelter offer), teal color
- Supply distribution: Box symbol, green color

**Occupant Count Display**
- Badge number in top-right corner of icon (1-9, "9+" for >9)
- Color coding: Green (0-3 occupants), Yellow (4-6), Red (7+)
- Update frequency: Real-time via mesh network or cellular
- Size: Scales with zoom level, readable from 14px

**Clustering**
- Zoom <11: Cluster multiple vehicles into single "N vehicles" marker
- Zoom >14: Show individual vehicle locations
- Cluster color: Averages occupant count across all vehicles in cluster

## Use-at-Your-Own-Risk Banner

**Placement & Visibility**
- Sticky header: Top of map screen, always visible (height 56px)
- Priority: Renders above all map elements
- Persistence: Reappears on every map interaction (cannot permanently dismiss)
- Modal on first use: On app first launch, modal displays full disclaimer text with "I understand" button required before map shown

**Design**
- Background: Navy (#0B0F2A) with 90% opacity (shows map underneath)
- Text: Teal (#0097B2), bold, 14px
- Icon: Triangle warning icon (left side, 20px)
- Action: Tap banner to expand full disclaimer (modal overlay)

**Text Content**
"Beacon provides hazard predictions for informational use only. Do not solely rely on this app for evacuation decisions. Follow official emergency services guidance."

**Legal Documentation**
- Tap expands to full Terms of Service modal
- User acknowledges via checkbox before dismissing modal
- Acknowledgment logged: timestamp + user ID + app version
- Audit trail: Required for compliance review

**Emergency Mode Enhancement**
- Banner height increased to 72px
- Font size increased to 18px
- Background opacity increased to 100% (opaque)
- Additional text: "Evacuate immediately if told to do so"
- Cannot be dismissed (no close button)
