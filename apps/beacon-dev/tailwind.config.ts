import baseConfig from './src/lib/design-system/tailwind.config';
import type { Config } from 'tailwindcss';

const config = {
  presets: [baseConfig as Config],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/design-system/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      // Admin-specific overrides if needed
    }
  }
} satisfies Config;

export default config;
