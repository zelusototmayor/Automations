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
        // BETTER COACHING DESIGN SYSTEM - NEUTRAL BASE WITH SAGE ACCENT
        // ═══════════════════════════════════════════════════════════════════

        // Primary - Sage (calming, growth, wellness) - THE SOLE ACCENT COLOR
        sage: {
          50: '#F0F4F1',
          100: '#E8F0EB',  // primaryLight (tag backgrounds, selected states)
          200: '#D1E3D8',
          300: '#A8C9B3',
          400: '#6B9C7A',  // Lighter sage variation
          500: '#4A7C59',  // primary (buttons, CTAs, links)
          600: '#3D6649',  // primaryDark (pressed states)
          700: '#2D5039',
          800: '#1F3929',
          900: '#14281C',
          DEFAULT: '#4A7C59',
        },

        // Primary alias (maps to sage for common convention)
        primary: {
          50: '#F0F4F1',
          100: '#E8F0EB',  // primaryLight
          200: '#D1E3D8',
          300: '#A8C9B3',
          400: '#6B9C7A',
          500: '#4A7C59',  // primary DEFAULT
          600: '#3D6649',  // primaryDark
          700: '#2D5039',
          800: '#1F3929',
          900: '#14281C',
          DEFAULT: '#4A7C59',
        },

        // Neutral - Gray scale for backgrounds, borders, text hierarchy
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',  // surfaceSecondary
          200: '#E5E7EB',  // border
          300: '#D1D5DB',
          400: '#9CA3AF',  // textTertiary
          500: '#6B7280',  // textSecondary
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',  // textPrimary
          DEFAULT: '#6B7280',
        },

        // Premium - Purple tone (ONLY for premium badges/indicators)
        premium: {
          50: '#F5F3F7',
          100: '#E8E5F0',
          200: '#D8D3E5',
          300: '#B8AFD1',
          400: '#9A8FB8',
          500: '#7C6FA0',  // premium (only for badges)
          600: '#6B5F8A',
          700: '#544D6E',
          800: '#3F3B52',
          900: '#2D2A3A',
          DEFAULT: '#7C6FA0',
        },

        // Surface colors for backgrounds - NEUTRAL WHITES/GRAYS
        surface: {
          DEFAULT: '#FFFFFF',  // White card backgrounds
          secondary: '#F3F4F6',  // Subtle gray for sections
          tertiary: '#F9FAFB',
        },

        // Background colors (alias for surface)
        background: {
          DEFAULT: '#FFFFFF',
          light: '#FFFFFF',
          dark: '#1F2937',
        },

        // Text colors - REFINED HIERARCHY
        text: {
          primary: '#111827',    // Main text
          secondary: '#6B7280',  // Secondary text
          tertiary: '#9CA3AF',   // Muted/placeholder text (was 'muted')
          inverse: '#FFFFFF',
        },

        // Border colors - CLEAN GRAYS
        border: {
          DEFAULT: '#E5E7EB',  // Main border color
          light: '#F3F4F6',
          dark: '#D1D5DB',
        },

        // ═══════════════════════════════════════════════════════════════════
        // SEMANTIC COLORS - For specific purposes
        // ═══════════════════════════════════════════════════════════════════

        // Success - Clean green
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',  // Main success
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          DEFAULT: '#16A34A',
        },

        // Error - Clean red
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',  // Main error
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
          DEFAULT: '#DC2626',
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

        // ═══════════════════════════════════════════════════════════════════
        // GLASS EFFECTS - Minimal use, neutral white
        // ═══════════════════════════════════════════════════════════════════
        glass: {
          white: 'rgba(255, 255, 255, 0.95)',
          border: 'rgba(229, 231, 235, 0.8)',
          shadow: 'rgba(17, 24, 39, 0.06)',
        },

        // ═══════════════════════════════════════════════════════════════════
        // CTA COLORS - Sage green accent
        // ═══════════════════════════════════════════════════════════════════
        cta: {
          start: '#4A7C59',  // primary
          end: '#3D6649',    // primaryDark
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
