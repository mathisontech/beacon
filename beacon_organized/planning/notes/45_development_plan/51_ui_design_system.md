# 51. UI Design System

## Overview
Cross-platform design system (iOS, Android, web) with Navy/Teal brand colors, WCAG 2.2 AA accessibility, and dual-mode UI (normal + emergency simplified). Component library with 40+ reusable elements; responsive from mobile to desktop.

## Ownership
- **Module Lead:** Product Designer + Design Engineer
- **Reports to:** Product Lead
- **Team Size:** 3 (1 designer, 1 design engineer, 1 QA)

## Parent/Submodules
- Parent: 35_ui_design, 43_brand
- Submodules: Component Library, Emergency Mode, Accessibility, Responsive

## Goals
- WCAG 2.2 AA compliance all screens (4.5:1 text contrast, 3:1 UI components)
- <100ms tap response (haptic feedback instant)
- Emergency mode activation <2s
- Mobile-first design (320px minimum width)
- No icons-only buttons (always paired with text labels)

---

## Functions (Component Rendering & Logic)

| Function | Purpose | Input | Output | SLA | Dependencies |
|----------|---------|-------|--------|-----|--------------|
| renderButton | Standard button component | {label, variant, disabled, onPress} | Button element | <16ms | Theme provider |
| renderCard | Content container | {title, content, variant, elevation} | Card element | <16ms | Theme |
| renderModal | Dialog overlay | {title, body, actions, dismissible} | Modal element | <50ms | Navigation stack |
| renderAlert | Alert message | {severity, message, action} | Alert banner | <16ms | Theme |
| renderTextField | Text input field | {label, value, onChange, error} | Input element | <16ms | Form state |
| renderSelect | Dropdown menu | {options, selected, onChange} | Select element | <32ms | Theme |
| renderCheckbox | Check/uncheck control | {label, checked, onChange} | Checkbox element | <16ms | Theme |
| renderToggle | On/off switch | {label, enabled, onChange} | Toggle element | <16ms | Theme |
| renderSlider | Range input | {min, max, value, onChange} | Slider element | <16ms | Theme |
| renderBadge | Status indicator | {count, color, size} | Badge element | <16ms | Theme |
| renderAvatar | User profile pic | {user_id, size} | Avatar element | <32ms | Image cache |
| renderHazardChip | Hazard type indicator | {hazard_type, severity} | Chip element | <16ms | Hazard colors |
| renderMapLayer | Layer toggle in dropdown | {layer_name, enabled, icon} | Layer toggle | <32ms | Map state |
| renderAppBar | Header with title/actions | {title, back_button, actions} | AppBar element | <16ms | Navigation |
| renderBottomTab | Tab navigation | {tabs, active_index, onChange} | Tab bar | <32ms | Navigation |
| renderSpinner | Loading indicator | {size, color} | Spinner element | <16ms | Theme |
| renderToast | Temporary notification | {message, duration, type} | Toast element | <100ms | Toast queue |
| renderEmergencyBanner | "Use at own risk" sticky header | {dismissible, expanded} | Banner element | <16ms | Legal content |
| renderEvacuationRoute | Route visualization | {route_geojson, eta_range} | Route overlay | <100ms | Map renderer |
| renderLiveLocation | User location dot | {location, accuracy_circle} | Location marker | <50ms | Location stream |
| renderGroupMembers | Contacts on map | {contacts_array, online_status} | Markers + popups | <100ms | Contact list |
| renderHazardLayer | Hazard extent polygon | {hazard_geojson, opacity, color} | Map layer | <200ms | Tile server |
| renderResourceMarker | EMS/shelter icon | {resource_type, occupancy} | Marker + badge | <50ms | Resource API |
| renderAccessibilityLabel | ARIA descriptor | {element_ref, description} | Accessible label | <16ms | Theme |
| renderContrastChecker | Validate color pair | {fg_color, bg_color} | Contrast ratio | <10ms | Color utils |
| renderKeyboardNav | Tab order manager | {element_tree} | Keyboard navigation | <32ms | React nav |
| renderScreenReader | Announce live update | {message, priority} | Screen reader event | <100ms | A11y API |
| renderResponsiveLayout | Mobile/tablet/desktop layout | {screen_width, breakpoint} | Layout element | <32ms | RN Dimensions |
| renderTextScale | Respect system text size | {base_size_px, scale_factor} | Scaled text | <16ms | Accessibility API |
| renderReducedMotion | Check motion preferences | {} | {should_reduce_motion} | <10ms | Accessibility API |
| renderHapticFeedback | Vibration pattern | {pattern_type} | Haptic event | <50ms | React Native |
| renderDarkMode | Toggle dark/light theme | {prefer_dark} | Theme override | <100ms | Theme provider |
| renderSystemFont | Use system typeface | {font_name, weight} | Font family | <16ms | React Native |

---

## Color Specifications

| Element | Color | Hex | WCAG Ratio | Usage |
|---------|-------|-----|-----------|-------|
| Primary Navy | Dark navy | #0B0F2A | 15:1 on white | Backgrounds, text, authority |
| Accent Teal | Teal/cyan | #0097B2 | 5.2:1 on white | Links, interactive, CTAs |
| Hazard Red | Fire danger | #D32F2F | 5.1:1 on white | Wildfire, critical alerts |
| Hazard Blue | Flood | #1976D2 | 5.8:1 on white | Flooding, informational |
| Hazard Orange | Earthquake | #F57C00 | 4.5:1 on white | Earthquake, warnings |
| Hazard Yellow | Severe weather | #FBC02D | 4.5:1 on white | Tornado, hail, caution |
| Success Green | Safe status | #388E3C | 5.6:1 on white | Shelter reached, all clear |
| Neutral Gray | Secondary | #424242 | 4.5:1 on white | Secondary text, dividers |
| Light Gray | Backgrounds | #F5F5F5 | N/A | Card backgrounds, table rows |
| White | Default bg | #FFFFFF | N/A | Main backgrounds |
| Disabled Gray | Inactive | #CCCCCC | <3:1 (acceptable for disabled) | Disabled buttons, inactive fields |

---

## Data Storage (Design Metadata)

| Table | Purpose | Key Fields | Retention |
|-------|---------|-----------|-----------|
| component_specs | Design component definitions | component_id, name, variants, tokens | Permanent |
| color_palette | Accessible color pairs | color_id, hex, wcag_ratio, hazard_type | Permanent |
| font_metrics | Typography specs | font_id, family, size_px, weight, line_height | Permanent |
| breakpoints | Responsive layout thresholds | breakpoint_id, name, width_px, grid_columns | Permanent |
| accessibility_requirements | A11y compliance per screen | screen_id, wcag_level, verified_date | Permanent |
| theme_overrides | User theme preferences | user_id, dark_mode, font_scale, reduced_motion | Per session |

---

## Message Bus (NATS)

| Channel | Publisher | Subscriber | Frequency | Payload |
|---------|-----------|------------|-----------|---------|
| ui.emergency_mode.activate | User gesture or auto-trigger | Map layer, controls, haptics | On event | {trigger_source, timestamp} |
| ui.emergency_mode.deactivate | User button press | Map layer, controls, theme | On event | {reason} |
| ui.theme.change | System preference change | All components | On change | {prefer_dark, font_scale} |
| ui.accessibility.announce | Screen reader message | A11y API | On alert | {message, priority} |
| ui.haptic.request | Component feedback needed | Haptic controller | On tap | {pattern_type, duration_ms} |

---

## Cache (Redis)

| Key Pattern | Purpose | TTL | Size | Update Freq |
|-------------|---------|-----|------|------------|
| design:theme:dark | Dark theme token cache | Permanent | 50KB | Never |
| design:theme:light | Light theme token cache | Permanent | 50KB | Never |
| design:accessibility:wcag_pairs | Pre-computed WCAG contrast pairs | Permanent | 100KB | Never |
| design:breakpoints | Responsive layout breakpoints | Permanent | 5KB | Never |
| ui:user_preferences:{user_id} | Font scale, motion preference | Permanent | 1KB | Per session |

---

## External Integrations

| System | Purpose | Integration | Auth |
|--------|---------|-------------|------|
| iOS Accessibility API | Screen reader, text scaling | Native iOS framework | None |
| Android Accessibility API | Screen reader, text scaling | Android A11y framework | None |
| React Native Haptics | Vibration feedback | react-native-haptics library | None |
| WebAIM Color Contrast Checker | WCAG validation | API or embedded tool | Public |
| Figma Design System | Design handoff | Figma REST API | Personal token |

---

## API Contracts (Design Token Delivery)

### Get Design Tokens
```
GET /api/v1/design/tokens?theme=light&wcag_level=AA
Response: {
  colors: {navy: "#0B0F2A", teal: "#0097B2", ...},
  typography: {heading_1: {size: 24, weight: 700}, ...},
  spacing: [8, 16, 24, 32],
  breakpoints: {mobile: 320, tablet: 768, desktop: 1024}
}
```

### Check Color Contrast
```
GET /api/v1/design/contrast?fg=%230B0F2A&bg=%23FFFFFF
Response: {
  ratio: 15.0,
  wcag_aa: true,
  wcag_aaa: true
}
```

### Get Component Spec
```
GET /api/v1/design/component/button?variant=primary
Response: {
  name: "Button",
  variants: ["primary", "secondary", "danger"],
  states: ["default", "hover", "active", "disabled"],
  tokens: {padding: 12, border_radius: 4, font_size: 14}
}
```

---

## UI Screens by Account Type

| Screen | PU | SD | DI | ET | EA | BE | Purpose |
|--------|----|----|----|----|----|----|---------|
| Login | Y | Y | Y | Y | Y | Y | Authentication |
| Home Map | Y | Y | Y | Y | Y | Y | Main view |
| Hazard Layer Selector | Y | Y | Y | Y | Y | Y | Layer toggle |
| Emergency Mode Toggle | Y | Y | Y | Y | Y | Y | Activation |
| Evacuation Routes | Y | Y | Y | Y | Y | Y | Route display |
| Safety Check-in | Y | Y | Y | Y | Y | Y | Status update |
| Contacts/Groups | Y | Y | Y | Y | Y | Y | Pack members |
| Shelter Finder | Y | Y | Y | Y | Y | Y | Location search |
| Mesh Network Status | N | N | Y | Y | N | Y | Connectivity |
| EMS Dispatch (custom) | N | N | N | Y | Y | Y | Resource mgmt |
| Event Playback (replay) | N | N | Y | N | Y | Y | Post-event analysis |
| Admin Dashboard | N | N | N | N | Y | Y | System oversight |
| Agentic Audit Trail | N | N | N | Y | Y | Y | Agent decisions |
| Settings (theme, a11y) | Y | Y | Y | Y | Y | Y | Preferences |

---

## Emergency Mode UX

| Feature | Normal Mode | Emergency Mode | Change |
|---------|------------|-----------------|--------|
| Map background | Detailed basemap | Navy (#0B0F2A) | Simplified, high contrast |
| Hazard layer | Semi-transparent | 100% opacity | Full visibility |
| Button size | 48px (44px min) | 56px minimum | Larger touch targets |
| Font size | 14-16px body | 18px+ minimum | Readable from distance |
| Pinch-to-zoom | Enabled | Disabled (scroll only) | Simplified gestures |
| Animations | Smooth transitions | Instant changes | No delays |
| Banner | Dismissible once | Persistent, always shows | Cannot dismiss |
| Color scheme | Light background + Navy text | Navy background + white text | Maximum contrast |
| Haptic feedback | Standard (50ms taps) | Enhanced (amplified) | More noticeable |
| Tab bar | All tabs visible | Collapsed (active only) | Space savings |

---

## Responsive Breakpoints

| Device Type | Width | Columns | Description |
|-------------|-------|---------|-------------|
| Mobile | 320-479px | 1-2 | Small phone, landscape phone |
| Mobile Large | 480-767px | 2 | Large phone portrait |
| Tablet | 768-1023px | 2-3 | Tablet portrait |
| Tablet Landscape | 1024px+ | 3-4 | Tablet landscape, small desktop |
| Desktop | 1280px+ | 4+ | Full desktop |

---

## Accessibility Compliance Checklist

| Requirement | Standard | Status | Verified |
|-------------|----------|--------|----------|
| Text contrast | WCAG 2.2 AA (4.5:1) | Compliant | WAVE tool |
| UI component contrast | WCAG 2.2 AA (3:1) | Compliant | WAVE tool |
| Keyboard navigation | All elements via Tab | Compliant | Manual test |
| Focus visible | 2px Teal outline | Compliant | Visual inspection |
| Screen reader labels | ARIA + semantic HTML | Compliant | NVDA/JAWS test |
| Touch targets | 44x44px minimum | Compliant | Measurement |
| Text scaling | Respects OS settings | Compliant | Manual test |
| Reduced motion | Respects prefers-reduced-motion | Compliant | System test |
| Color not sole indicator | Shapes + text paired | Compliant | Design review |
| Language tags | HTML lang attribute | Compliant | Code review |

---

## Haptic Feedback Patterns

| Pattern | Timing | Amplitude | Use Case |
|---------|--------|-----------|----------|
| Light tap | 10ms | 50% | Page transition, simple button press |
| Medium tap | 50ms | 80% | Slider change, selection |
| Double tap | 2x 10ms (100ms apart) | 60% | Confirmation (route selected) |
| Long vibration | 200ms | 100% | Error/warning state |
| Pulse | 500ms cycle (50ms on/off) | 60% | Searching for mesh connection |
| Success pattern | 3x 20ms rapid | 80% | Connection established |
| Alert pattern | Long + short + long | 100% | Critical alert received |

---

## Monitoring (5-Agent Team)

| Agent | Role | Frequency | Key Metrics | Escalation |
|-------|------|-----------|-------------|-----------|
| Quality | WCAG compliance, contrast checks | Daily | Contrast ratios, A11y violations | Ratio <4.5:1 text, <3:1 UI |
| Research | Component usage analytics | Weekly | Most-used components, A/B test results | Low adoption (<10%) of new components |
| Business | Performance metrics | Daily | Frame rate, tap latency, crash rate | >10% dropped frames, >500ms latency |
| Compliance | Accessibility audit | Monthly | Screen reader compatibility, keyboard nav | Any WCAG AA violation |
| Lead | Design consistency review | Weekly | Design system usage, off-brand deviations | >5 screens off-brand |

---

## Dependencies

| Module | Dependency | Type | Criticality |
|--------|-----------|------|------------|
| 35_ui_design | Design specs + Figma | Hard | Critical |
| 43_brand | Colors, fonts, guidelines | Hard | Critical |
| 32_operating_system | React Native, native APIs | Hard | Critical |
| 17_notifications_alerts | Alert UI rendering | Soft | High |
| 50_modeling_simulation | Evacuation route display | Soft | Medium |

---

## Implementation Notes

- **Theme provider:** Centralized token delivery; light/dark mode toggle at app level
- **Component library:** 40+ reusable components (buttons, cards, inputs, modals, lists); all tested for A11y compliance
- **Emergency mode:** Triggered by user button OR automatic FEMA event detection; stores preference per event
- **Responsive:** Mobile-first design; CSS Grid for layout; RN Dimensions API for runtime breakpoint detection
- **Accessibility:** Every interactive element has ARIA label; focus outline always visible; haptic feedback on tap
- **Offline:** Design tokens cached locally; emergency mode layout works fully offline
