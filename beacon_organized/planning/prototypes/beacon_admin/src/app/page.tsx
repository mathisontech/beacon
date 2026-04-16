import {
  colors,
  buttons,
  getButtonClasses,
  cards,
  getCardClasses,
  badges,
  typography,
} from '@/lib/design';

export default function Home() {
  return (
    <div className="min-h-screen bg-background-secondary p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-3xl font-bold text-beacon-navy mb-2">
            Beacon Admin Design System
          </h1>
          <p className="text-text-secondary">
            Shared design tokens and components from @beacon/design-system
          </p>
        </header>

        {/* Colors Section */}
        <section className={getCardClasses('default', 'lg')}>
          <h2 className="text-2xl font-semibold text-beacon-navy mb-6">Colors</h2>

          {/* Brand Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-text-primary mb-4">Brand Colors</h3>
            <div className="flex flex-wrap gap-4">
              <ColorSwatch name="Primary" color={colors.beacon.primary} />
              <ColorSwatch name="Primary Hover" color={colors.beacon.primaryHover} />
              <ColorSwatch name="Primary Light" color={colors.beacon.primaryLight} />
              <ColorSwatch name="Navy" color={colors.beacon.navy} />
              <ColorSwatch name="Navy Light" color={colors.beacon.navyLight} />
            </div>
          </div>

          {/* Status Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-text-primary mb-4">Status Colors</h3>
            <div className="flex flex-wrap gap-4">
              <ColorSwatch name="Success" color={colors.status.success} />
              <ColorSwatch name="Error" color={colors.status.error} />
              <ColorSwatch name="Warning" color={colors.status.warning} />
              <ColorSwatch name="Info" color={colors.status.info} />
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className={getCardClasses('default', 'lg')}>
          <h2 className="text-2xl font-semibold text-beacon-navy mb-6">Typography</h2>

          <div className="space-y-4">
            <p className="text-3xl font-bold">Heading 3XL (34px) - {typography.sizes['3xl']}</p>
            <p className="text-2xl font-semibold">Heading 2XL (24px) - {typography.sizes['2xl']}</p>
            <p className="text-xl font-semibold">Heading XL (20px) - {typography.sizes.xl}</p>
            <p className="text-lg font-medium">Heading LG (18px) - {typography.sizes.lg}</p>
            <p className="text-base">Body Base (16px) - {typography.sizes.base}</p>
            <p className="text-md text-text-secondary">Body MD (14px) - {typography.sizes.md}</p>
            <p className="text-sm text-text-muted">Body SM (12px) - {typography.sizes.sm}</p>
            <p className="text-xs text-text-light">Body XS (11px) - {typography.sizes.xs}</p>
          </div>
        </section>

        {/* Buttons Section */}
        <section className={getCardClasses('default', 'lg')}>
          <h2 className="text-2xl font-semibold text-beacon-navy mb-6">Buttons</h2>

          <div className="space-y-6">
            {/* Primary Buttons */}
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-4">Primary Variant</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <button className={getButtonClasses('primary', 'sm')}>Small</button>
                <button className={getButtonClasses('primary', 'md')}>Medium</button>
                <button className={getButtonClasses('primary', 'lg')}>Large</button>
                <button className={getButtonClasses('primary', 'pill')}>Pill Style</button>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-4">Secondary Variant</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <button className={getButtonClasses('secondary', 'sm')}>Small</button>
                <button className={getButtonClasses('secondary', 'md')}>Medium</button>
                <button className={getButtonClasses('secondary', 'lg')}>Large</button>
              </div>
            </div>

            {/* Danger Buttons */}
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-4">Danger Variant</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <button className={getButtonClasses('danger', 'sm')}>Small</button>
                <button className={getButtonClasses('danger', 'md')}>Medium</button>
                <button className={getButtonClasses('danger', 'lg')}>Large</button>
              </div>
            </div>

            {/* Outline Buttons */}
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-4">Outline Variant</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <button className={getButtonClasses('outline', 'sm')}>Small</button>
                <button className={getButtonClasses('outline', 'md')}>Medium</button>
                <button className={getButtonClasses('outline', 'lg')}>Large</button>
              </div>
            </div>

            {/* Emergency Button */}
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-4">Emergency Variant</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <button className={getButtonClasses('emergency', 'lg')}>Emergency Action</button>
              </div>
            </div>
          </div>
        </section>

        {/* Badges Section */}
        <section className={getCardClasses('default', 'lg')}>
          <h2 className="text-2xl font-semibold text-beacon-navy mb-6">Badges</h2>

          <div className="flex flex-wrap gap-4">
            <span className={`${badges.base} ${badges.variants.primary} ${badges.sizes.md}`}>
              Primary
            </span>
            <span className={`${badges.base} ${badges.variants.secondary} ${badges.sizes.md}`}>
              Secondary
            </span>
            <span className={`${badges.base} ${badges.variants.success} ${badges.sizes.md}`}>
              Success
            </span>
            <span className={`${badges.base} ${badges.variants.warning} ${badges.sizes.md}`}>
              Warning
            </span>
            <span className={`${badges.base} ${badges.variants.error} ${badges.sizes.md}`}>
              Error
            </span>
            <span className={`${badges.base} ${badges.variants.safe} ${badges.sizes.md}`}>
              Safe
            </span>
            <span className={`${badges.base} ${badges.variants.sheltering} ${badges.sizes.md}`}>
              Sheltering
            </span>
            <span className={`${badges.base} ${badges.variants.help} ${badges.sizes.md}`}>
              Need Help
            </span>
          </div>
        </section>

        {/* Cards Section */}
        <section className={getCardClasses('default', 'lg')}>
          <h2 className="text-2xl font-semibold text-beacon-navy mb-6">Cards</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={getCardClasses('default', 'md')}>
              <h3 className="font-semibold text-beacon-navy mb-2">Default Card</h3>
              <p className="text-text-secondary text-sm">Basic card with subtle shadow and border.</p>
            </div>

            <div className={getCardClasses('elevated', 'md')}>
              <h3 className="font-semibold text-beacon-navy mb-2">Elevated Card</h3>
              <p className="text-text-secondary text-sm">Hover to see the lift effect.</p>
            </div>

            <div className={`${cards.base} ${cards.variants.notification} ${cards.severity.success} ${cards.sizes.md}`}>
              <h3 className="font-semibold text-status-successDarkest mb-2">Success Notification</h3>
              <p className="text-status-successMuted text-sm">Operation completed successfully.</p>
            </div>

            <div className={`${cards.base} ${cards.variants.notification} ${cards.severity.warning} ${cards.sizes.md}`}>
              <h3 className="font-semibold text-status-warningDarker mb-2">Warning Notification</h3>
              <p className="text-status-warningDark text-sm">Please review before continuing.</p>
            </div>

            <div className={`${cards.base} ${cards.variants.notification} ${cards.severity.error} ${cards.sizes.md}`}>
              <h3 className="font-semibold text-status-errorDark mb-2">Error Notification</h3>
              <p className="text-status-error text-sm">An error occurred.</p>
            </div>
          </div>
        </section>

        {/* Import Example */}
        <section className={getCardClasses('default', 'lg')}>
          <h2 className="text-2xl font-semibold text-beacon-navy mb-6">Usage Example</h2>

          <div className="bg-neutral-900 text-neutral-100 p-6 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`// Import from convenience file
import { colors, buttons, getButtonClasses } from '@/lib/design';

// Use in your components
<button className={getButtonClasses('primary', 'md')}>
  Click Me
</button>

// Access tokens directly
const primaryColor = colors.beacon.primary; // ${colors.beacon.primary}`}</pre>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-text-muted text-sm">
          <p>Design system loaded from @beacon/design-system</p>
        </footer>
      </div>
    </div>
  );
}

// Helper component for color swatches
function ColorSwatch({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-16 h-16 rounded-lg shadow-md border border-gray-200"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-text-secondary mt-2">{name}</span>
      <span className="text-xs text-text-muted font-mono">{color}</span>
    </div>
  );
}
