/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ═══════════════════════════════════════════════════════════════════
        // UI DESIGN SPEC V1 - PREMIUM PASTEL COLOR PALETTE
        // ═══════════════════════════════════════════════════════════════════

        // Primary - Sage (calming, growth, wellness)
        sage: {
          50: '#F4F7F3',
          100: '#E8EFE6',
          200: '#DCE9DF',  // Main pastel (spec)
          300: '#B8C9B2',
          400: '#6F8F79',  // CTA start (spec)
          500: '#5F8069',
          600: '#4F6F5A',  // CTA end (spec)
          700: '#3F5F4A',
          800: '#2F4F3A',
          900: '#1F3F2A',
          DEFAULT: '#6F8F79',
        },

        // Primary alias (maps to sage for common convention)
        primary: {
          50: '#F4F7F3',
          100: '#E8EFE6',
          200: '#DCE9DF',
          300: '#B8C9B2',
          400: '#6F8F79',
          500: '#5F8069',
          600: '#4F6F5A',
          700: '#3F5F4A',
          800: '#2F4F3A',
          900: '#1F3F2A',
          DEFAULT: '#6F8F79',
        },

        // Neutral - Gray scale for backgrounds, borders, disabled states
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },

        // Secondary - Lavender (calm, creativity, premium)
        lavender: {
          50: '#F8F5FA',
          100: '#F0EAF4',
          200: '#E7E0F3',  // Main pastel (spec)
          300: '#CDBFDB',
          400: '#B8A9C9',
          500: '#A08FB8',
          600: '#8A7A9E',
          700: '#6E6180',
          800: '#564C64',
          900: '#433B4E',
          DEFAULT: '#E7E0F3',
        },

        // Accent - Blush (warmth, approachability)
        blush: {
          50: '#FDF6F6',
          100: '#FAEAEA',
          200: '#F0D4D4',
          300: '#E2BABA',
          400: '#D4A5A5',
          500: '#C08888',
          600: '#B87878',
          700: '#9A5F5F',
          800: '#7A4B4B',
          900: '#5F3A3A',
          DEFAULT: '#D4A5A5',
        },

        // Accent - Sky (clarity, trust, openness)
        sky: {
          50: '#F5F9FB',
          100: '#E8F2F7',
          200: '#D9ECF7',  // Main pastel (spec)
          300: '#BCD5E2',
          400: '#A5C4D4',
          500: '#8AB1C4',
          600: '#7A9EB0',
          700: '#5F7D8C',
          800: '#4A626E',
          900: '#3A4D56',
          DEFAULT: '#D9ECF7',
        },

        // Accent - Sand (warmth, tertiary)
        sand: {
          50: '#FBF9F6',
          100: '#F7F3ED',
          200: '#F1E9DD',  // Main pastel (spec)
          300: '#E5D9C7',
          400: '#D9C9B1',
          500: '#CDB99B',
          DEFAULT: '#F1E9DD',
        },

        // Neutral - Cream & Warm tones
        cream: {
          50: '#FDFCFA',
          100: '#FAF8F5',
          200: '#F5F0E8',
          300: '#EDE5D8',
          400: '#E0D4C4',
          500: '#CFC0AC',
          DEFAULT: '#F5F0E8',
        },

        // Surface colors for backgrounds (spec)
        surface: {
          DEFAULT: '#F7F6F3',  // Main background (spec)
          warm: '#FDFCFA',
          muted: '#F5F3F0',
        },

        // Background colors (alias for surface for common convention)
        background: {
          DEFAULT: '#F7F6F3',
          light: '#F7F6F3',
          dark: '#1F2937',
        },

        // Text colors (spec)
        text: {
          primary: '#111827',    // Spec value
          secondary: '#6B7280',  // Spec value
          muted: '#9CA3AF',      // Spec value (placeholder)
          inverse: '#FFFFFF',
        },

        // Border colors (spec)
        border: {
          DEFAULT: '#E7E7E7',  // Spec value
          light: '#F0EDE8',
          dark: '#D8D5D0',
        },

        // ═══════════════════════════════════════════════════════════════════
        // SEMANTIC COLORS - For specific purposes
        // ═══════════════════════════════════════════════════════════════════

        // Success - Green (spec: #22C55E)
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',  // Main success (spec)
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          DEFAULT: '#22C55E',
        },

        // Error - Soft red (aligned with blush)
        error: {
          50: '#FEF5F5',
          100: '#FDE8E8',
          200: '#FAD0D0',
          300: '#F5ABAB',
          400: '#ED7D7D',
          500: '#E25555',
          600: '#CF3A3A',  // Main error
          700: '#AD2E2E',
          800: '#8F2929',
          900: '#772828',
          DEFAULT: '#CF3A3A',
        },

        // Warning - Soft amber
        warning: {
          50: '#FFFCF5',
          100: '#FFF6E5',
          200: '#FFEBCC',
          300: '#FFDAA8',
          400: '#FFC577',
          500: '#FFAB42',
          600: '#E8920F',  // Main warning
          700: '#C17609',
          800: '#9A5D0B',
          900: '#7D4C0C',
          DEFAULT: '#E8920F',
        },

        // Premium/Gold - For subscription badges
        premium: {
          50: '#FFFDF5',
          100: '#FFF9E5',
          200: '#FFF0C2',
          300: '#FFE599',
          400: '#FFD966',
          500: '#FFCC33',
          600: '#E6B800',
          DEFAULT: '#E6B800',
        },

        // ═══════════════════════════════════════════════════════════════════
        // LIQUID GLASS - For glassmorphism effects (spec)
        // ═══════════════════════════════════════════════════════════════════
        glass: {
          white: 'rgba(255, 255, 255, 0.88)',  // Spec surface opacity
          border: 'rgba(255, 255, 255, 0.4)',
          shadow: 'rgba(17, 24, 39, 0.06)',    // Spec shadow color
        },

        // ═══════════════════════════════════════════════════════════════════
        // CTA COLORS (spec)
        // ═══════════════════════════════════════════════════════════════════
        cta: {
          start: '#6F8F79',  // Gradient start
          end: '#4F6F5A',    // Gradient end
        },

        // Ink color for dark text/icons on light surfaces (spec)
        ink: '#1F2937',
      },

      fontFamily: {
        sans: ['Inter_400Regular', 'System'],
        heading: ['Inter_600SemiBold', 'System'],
        'inter-regular': ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
      },

      fontSize: {
        // UI Design Spec V1 - Typography scale
        // Spec: titles use -0.02em tracking (~-0.44px at 22px)
        'display': ['26px', { lineHeight: '1.2', letterSpacing: '-0.52px', fontWeight: '700' }],  // -0.02em
        'title': ['22px', { lineHeight: '1.25', letterSpacing: '-0.44px', fontWeight: '600' }],   // -0.02em (spec: section-title)
        'section': ['22px', { lineHeight: '1.25', letterSpacing: '-0.44px', fontWeight: '600' }], // Spec: 22-24px, -0.02em
        'card-title': ['17px', { lineHeight: '1.3', letterSpacing: '-0.17px', fontWeight: '600' }], // Spec: 16-18px, -0.01em
        'body': ['15px', { lineHeight: '1.5', fontWeight: '400' }],   // Spec: 15px
        'body-sm': ['13px', { lineHeight: '1.5', fontWeight: '400' }], // Spec: meta/caption 12-13px
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '400' }], // Spec: meta/caption
        'label': ['12px', { lineHeight: '1.3', letterSpacing: '0.24px', fontWeight: '500' }], // Spec: pill-text 12px, 0.02em
      },

      borderRadius: {
        'card': '22px',       // Spec: 22px (was 16px)
        'card-sm': '18px',    // Spec: 18-20px (was 14px)
        'button': '20px',     // Spec: 18-20px (was 14px)
        'input': '20px',      // Spec: 18-20px (new)
        'chip': '22px',       // Spec: 22px (was 20px)
        'pill': '9999px',     // Unchanged
        'avatar': '14px',     // Unchanged
        'avatar-sm': '12px',  // Unchanged
        'avatar-lg': '22px',  // Unchanged
        'tab-bar': '24px',    // Spec: 22-24px (was 30px)
      },

      spacing: {
        'section': '24px',
        'card-padding': '16px',
        'screen-x': '20px',
        'tab-bar-bottom': '16px',
      },

      boxShadow: {
        // UI Design Spec V1 - Wide/soft shadows
        'sm': '0 4px 12px rgba(17, 24, 39, 0.04)',
        'md': '0 8px 20px rgba(17, 24, 39, 0.06)',
        'lg': '0 12px 36px rgba(17, 24, 39, 0.08)',
        // Card shadow (spec): 0 10px 28px rgba(17,24,39,0.06)
        'card': '0 10px 28px rgba(17, 24, 39, 0.06)',
        'card-hover': '0 14px 36px rgba(17, 24, 39, 0.08)',
        'button': '0 6px 16px rgba(17, 24, 39, 0.08)',
        // Elevated shadow (spec): 0 18px 50px rgba(17,24,39,0.12)
        'elevated': '0 18px 50px rgba(17, 24, 39, 0.12)',
        // FAB shadow (spec): 0 16px 34px rgba(17,24,39,0.28)
        'fab': '0 16px 34px rgba(17, 24, 39, 0.28)',
        // Liquid glass shadow
        'glass': '0 10px 28px rgba(17, 24, 39, 0.06)',
      },

      // Backdrop blur for liquid glass effect
      backdropBlur: {
        'glass': '20px',
      },
    },
  },
  plugins: [],
};
