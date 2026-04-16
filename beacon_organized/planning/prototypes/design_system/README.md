# Beacon Design System

A shared design system for the Beacon emergency management platform. This package provides design tokens, component patterns, and a Tailwind CSS configuration that can be used across all Beacon applications.

## Installation

```bash
npm install @beacon/design-system
```

## Quick Start

### Using with Tailwind CSS

Extend your app's Tailwind config with the Beacon preset:

```typescript
// tailwind.config.ts
import beaconPreset from '@beacon/design-system/tailwind.config';

export default {
  presets: [beaconPreset],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
};
```

### Importing Tokens Directly

```typescript
import { colors, typography, spacing } from '@beacon/design-system/tokens';
```

### Using Component Patterns

```typescript
import { buttons, inputs, cards, getButtonClasses } from '@beacon/design-system/components';

// Use helper functions
const primaryBtnClass = getButtonClasses('primary', 'lg');

// Or compose manually
const className = `${buttons.base} ${buttons.variants.primary} ${buttons.sizes.md}`;
```

---

## Color Palette

### Brand Colors

| Name | Hex | Usage |
|------|-----|-------|
| ![#0097b2](https://placehold.co/20x20/0097b2/0097b2) `beacon-primary` | `#0097b2` | Primary brand color, headers, CTAs |
| ![#007a94](https://placehold.co/20x20/007a94/007a94) `beacon-primaryHover` | `#007a94` | Primary hover state |
| ![#e6f3f6](https://placehold.co/20x20/e6f3f6/e6f3f6) `beacon-primaryLight` | `#e6f3f6` | Light primary backgrounds |
| ![#0b0f2a](https://placehold.co/20x20/0b0f2a/0b0f2a) `beacon-navy` | `#0b0f2a` | Dark navy for text emphasis |

### Status Colors

#### Success (Green)
| Name | Hex | Usage |
|------|-----|-------|
| ![#10b981](https://placehold.co/20x20/10b981/10b981) `status-success` | `#10b981` | Success states, "safe" status |
| ![#dcfce7](https://placehold.co/20x20/dcfce7/dcfce7) `status-successLight` | `#dcfce7` | Success backgrounds |
| ![#166534](https://placehold.co/20x20/166534/166534) `status-successDarkest` | `#166534` | Success text on light bg |

#### Error/Danger (Red)
| Name | Hex | Usage |
|------|-----|-------|
| ![#dc2626](https://placehold.co/20x20/dc2626/dc2626) `status-error` | `#dc2626` | Error states, emergencies |
| ![#fee2e2](https://placehold.co/20x20/fee2e2/fee2e2) `status-errorLight` | `#fee2e2` | Error backgrounds |
| ![#991b1b](https://placehold.co/20x20/991b1b/991b1b) `status-errorDark` | `#991b1b` | Critical emergency gradient |

#### Warning (Amber)
| Name | Hex | Usage |
|------|-----|-------|
| ![#f59e0b](https://placehold.co/20x20/f59e0b/f59e0b) `status-warning` | `#f59e0b` | Warning states, "sheltering" status |
| ![#fef3c7](https://placehold.co/20x20/fef3c7/fef3c7) `status-warningLight` | `#fef3c7` | Warning backgrounds |

#### Info (Blue)
| Name | Hex | Usage |
|------|-----|-------|
| ![#3b82f6](https://placehold.co/20x20/3b82f6/3b82f6) `status-info` | `#3b82f6` | Information, moderate alerts |
| ![#2563eb](https://placehold.co/20x20/2563eb/2563eb) `status-infoDark` | `#2563eb` | Info hover/emphasis |

### Neutral Colors

| Name | Hex | Usage |
|------|-----|-------|
| ![#ffffff](https://placehold.co/20x20/ffffff/ffffff?text=+) `neutral-white` | `#ffffff` | Backgrounds |
| ![#f8fafc](https://placehold.co/20x20/f8fafc/f8fafc) `neutral-50` | `#f8fafc` | Subtle backgrounds |
| ![#e5e7eb](https://placehold.co/20x20/e5e7eb/e5e7eb) `neutral-300` | `#e5e7eb` | Borders, dividers |
| ![#6b7280](https://placehold.co/20x20/6b7280/6b7280) `neutral-600` | `#6b7280` | Muted text |
| ![#333333](https://placehold.co/20x20/333333/333333) `neutral-900` | `#333333` | Primary text |
| ![#1e293b](https://placehold.co/20x20/1e293b/1e293b) `neutral-950` | `#1e293b` | Dark backgrounds |

---

## Typography

### Font Families

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
font-family: 'Monaco', 'Menlo', 'Consolas', monospace; /* for code */
```

### Font Sizes

| Token | Size | Typical Usage |
|-------|------|---------------|
| `2xs` | 10px | Timestamps, micro labels |
| `xs` | 11px | Captions, meta info |
| `sm` | 12px | Secondary text, badges |
| `sm-md` | 13px | Chat messages, list items |
| `md` | 14px | Body text (mobile) |
| `base` | 16px | Body text (desktop) |
| `lg` | 18px | Subheadings |
| `xl` | 20px | Section titles |
| `2xl` | 24px | Page titles |
| `3xl` | 34px | Hero headings |

### Font Weights

| Token | Weight | Usage |
|-------|--------|-------|
| `light` | 300 | Decorative, large text |
| `normal` | 400 | Body text |
| `medium` | 500 | Labels, buttons |
| `semibold` | 600 | Subheadings |
| `bold` | 700 | Headings, emphasis |

---

## Components

### Buttons

#### Variants

| Variant | Description | Use When |
|---------|-------------|----------|
| `primary` | Teal filled button | Primary actions, CTAs |
| `secondary` | Gray gradient button | Secondary actions, form submits |
| `outline` | Bordered button | Tertiary actions |
| `danger` | Red filled button | Destructive actions |
| `emergency` | Red gradient with shadow | Emergency triggers |
| `link` | Underlined text button | Navigation, "forgot password" |
| `ghost` | Transparent on dark | Actions on dark backgrounds |
| `fab` | Circular floating button | Map actions |

#### Usage

```tsx
import { getButtonClasses } from '@beacon/design-system/components';

// Primary large button
<button className={getButtonClasses('primary', 'lg')}>
  Sign In
</button>

// Danger pill button (auth style)
<button className={getButtonClasses('danger', 'pill')}>
  Delete Account
</button>

// Floating action button
<button className={getButtonClasses('fab', 'fab')}>
  +
</button>
```

### Inputs

#### Variants

| Variant | Description | Use When |
|---------|-------------|----------|
| `default` | Pill-shaped with gradient | Auth forms |
| `standard` | Rectangular | Settings, forms |
| `search` | Glass-morphism style | Search overlays |
| `chat` | Rounded for chat | Messaging |

#### Usage

```tsx
import { getInputClasses, inputs } from '@beacon/design-system/components';

// Auth-style input
<div>
  <label className={inputs.label.default}>Email</label>
  <input className={getInputClasses('default', 'pill')} />
</div>

// With error
<input className={getInputClasses('default', 'md', true)} />
```

### Cards

#### Variants

| Variant | Description | Use When |
|---------|-------------|----------|
| `default` | Subtle shadow | General containers |
| `elevated` | Lifts on hover | Clickable cards |
| `glass` | Frosted glass | Dark backgrounds |
| `form` | White gradient | Auth forms |
| `notification` | Left border accent | Alerts, messages |
| `entity` | Interactive list item | Feed items |
| `emergency` | Red border/background | Emergency notices |

#### Severity Colors (for notification cards)

```tsx
// Alert card with severity
<div className={`${cards.base} ${cards.variants.notification} ${cards.severity.critical}`}>
  Critical Alert Content
</div>
```

### Status Badges

```tsx
import { badges, statusDot } from '@beacon/design-system/components';

// User status badge
<span className={`${badges.base} ${badges.variants.safe} ${badges.sizes.md}`}>
  Safe
</span>

// Connection status dot
<span className={`${statusDot.base} ${statusDot.variants.connected}`} />
```

---

## Spacing Scale

| Token | Value | Pixels |
|-------|-------|--------|
| `0` | 0 | 0px |
| `1` | 0.25rem | 4px |
| `2` | 0.5rem | 8px |
| `3` | 0.75rem | 12px |
| `4` | 1rem | 16px |
| `5` | 1.25rem | 20px |
| `6` | 1.5rem | 24px |
| `8` | 2rem | 32px |
| `10` | 2.5rem | 40px |
| `12` | 3rem | 48px |
| `16` | 4rem | 64px |
| `20` | 5rem | 80px |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `none` | 0 | Sharp corners |
| `sm` | 4px | Subtle rounding |
| `default` | 6px | Standard buttons |
| `md` | 8px | Cards, containers |
| `lg` | 12px | Large cards |
| `xl` | 16px | Modals |
| `2xl` | 24px | Auth form containers |
| `full` | 50px | Pills, auth buttons |

---

## Shadows

| Token | Usage |
|-------|-------|
| `shadow-card` | Default card elevation |
| `shadow-cardHover` | Card hover state |
| `shadow-modal` | Modal/dialog |
| `shadow-fab` | Floating action button |
| `shadow-emergency` | Emergency glow effect |
| `shadow-button` | Inset button depth |
| `shadow-inner` | Input inner shadow |

---

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `z-base` | 0 | Default layer |
| `z-dropdown` | 10 | Dropdowns, popovers |
| `z-sticky` | 20 | Sticky headers |
| `z-fixed` | 30 | Fixed elements |
| `z-overlay` | 40 | Map overlays |
| `z-modal` | 50 | Modals |
| `z-toast` | 80 | Toast notifications |
| `z-emergency` | 100 | Emergency indicators |
| `z-max` | 2000 | Highest priority |

---

## Animations

### Available Animations

| Name | Duration | Usage |
|------|----------|-------|
| `animate-spin` | 1s | Loading spinners |
| `animate-pulse` | 2s | Loading states |
| `animate-emergencyPulse` | 2s | Emergency glow |
| `animate-beaconPulse` | 2s | Beacon button ripple |
| `animate-alertPulse` | 2s | Alert banner pulse |

### Usage

```tsx
// Loading spinner
<div className="w-10 h-10 border-4 border-gray-300 border-t-red-600 rounded-full animate-spin" />

// Emergency beacon
<button className="animate-beaconPulse bg-red-600">
  EMERGENCY
</button>
```

---

## Breakpoints

| Token | Value | Target |
|-------|-------|--------|
| `sm` | 480px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

---

## Usage Guidelines

### When to Use Each Color

- **beacon-primary**: Navigation, headers, primary buttons, links
- **status-error**: Emergencies, errors, "needs help" status, critical alerts
- **status-warning**: Cautions, "sheltering" status, severe alerts
- **status-success**: Confirmations, "safe" status, minor alerts
- **status-info**: Information, moderate alerts, selected states

### Button Hierarchy

1. **Primary**: One per screen section, main action
2. **Secondary**: Supporting actions
3. **Outline**: Tertiary, cancel actions
4. **Link**: Navigation, "forgot password"
5. **Danger**: Destructive actions (delete, remove)
6. **Emergency**: Only for emergency triggers

### Card Selection

- Use `elevated` for interactive cards
- Use `glass` on dark/image backgrounds
- Use `notification` with severity for alerts
- Use `form` for auth/settings forms

---

## Contributing

When adding new tokens or components:

1. Add to `tokens.ts` for design tokens
2. Add to `components.ts` for component patterns
3. Update `tailwind.config.ts` to expose in Tailwind
4. Document in this README

---

## License

Internal Mathison/Beacon use only.
