# Better Coaching - UI Design System V2

## Design Philosophy

**Sharp, Reflective, Premium**
The app should feel clean, modern, and iOS-inspired with clear visual hierarchy. Elements should "pop" with definition while maintaining soft, approachable rounded corners. Think: glass, reflection, clarity.

---

## Color Palette

### Primary Colors
- **Sage Green**: `#6F8F79` - Primary CTA color
- **Sage Dark**: `#4F6F5A` - CTA gradient end, active states
- **Sage Light**: `#DCE9DF` - Pastel backgrounds, subtle highlights

### Background & Surfaces
- **Background Base**: `#F5F5F7` - Cool gray (iOS-style), replaced warm beige
- **Card Background**: `rgba(255, 255, 255, 0.92)` - Enhanced glass effect for cards
- **Surface Warm**: `#FDFCFA` - Alternative warm surface (sparingly used)

### Text Hierarchy
- **Primary Text**: `#111827` - Main headings, body text
- **Secondary Text**: `#6B7280` - Subtitles, captions
- **Muted Text**: `#9CA3AF` - Placeholders, metadata

### Borders & Separation
- **Border Sharp**: `#D1D5DB` - Main border color (darker for definition)
- **Border Light**: `#E7E7E7` - Legacy lighter border (minimal use)

### Accent Colors (Pastel)
- **Lavender**: `#E7E0F3` - Creativity, premium features
- **Lavender Dark**: `#8A7A9E` - Lavender accent
- **Blush**: `#D4A5A5` - Warmth, approachability
- **Sky**: `#D9ECF7` - Clarity, trust
- **Cream**: `#F5F0E8` - Warm tertiary

### Semantic Colors
- **Success**: `#22C55E`
- **Error**: `#CF3A3A`
- **Warning**: `#E8920F`
- **Premium/Gold**: `#E6B800`

---

## Typography

### Font Family
- **Primary**: Inter (Regular, Medium, SemiBold, Bold)

### Type Scale
- **Heading**: 24px, line-height 1.3, letter-spacing -0.02em, weight 700
- **Section**: 20px, line-height 1.3, letter-spacing -0.01em, weight 600
- **Card Title**: 17px, line-height 1.3, letter-spacing -0.01em, weight 600
- **Body**: 15px, line-height 1.5, weight 400
- **Body Small**: 13px, line-height 1.5, weight 400
- **Caption**: 12px, line-height 1.4, weight 400
- **Label**: 12px, line-height 1.3, letter-spacing 0.02em, weight 500

---

## Spacing

### Base Units
- **Section Gap**: 24px
- **Card Padding**: 16px
- **Screen Horizontal**: 20px
- **Tab Bar Bottom**: 16px

### Component Spacing
- Use multiples of 4px for consistency
- Generous white space between sections

---

## Border Radius

### Rounded Corners (Keep soft and approachable)
- **Card**: 22px - Main content cards
- **Card Small**: 18px - Smaller cards, inputs
- **Button**: 20px - Standard buttons
- **Input**: 20px - Text inputs, search bars
- **Chip**: 22px - Category chips, tags
- **Pill**: Full rounded (9999px)
- **Avatar**: 14px - Standard avatar
- **Avatar Small**: 12px
- **Avatar Large**: 22px
- **Tab Bar**: 24px - Navigation bar

---

## Borders & Strokes

### Border Widths (Enhanced for definition)
- **Standard**: 1.5px - All cards, inputs, interactive elements
- **Thin**: 1px - Minimal use only
- **Focus**: 2px - Active/focused states

### Border Colors
- **Default**: `#D1D5DB` (borderSharp) - Main border for all components
- **Focus**: `#6F8F79` (sage) - Active/focused states
- **Light**: `#E7E7E7` - Legacy use only

**Principle**: Borders should be visible and provide clear definition between elements.

---

## Shadows & Depth

### Shadow System (Enhanced for sharper look)
All shadows use `#111827` (textPrimary) as base color for better contrast.

- **Small**: `0 4px 12px rgba(17, 24, 39, 0.04)` - Subtle lift
- **Medium**: `0 8px 20px rgba(17, 24, 39, 0.06)` - Standard elevation
- **Large**: `0 12px 36px rgba(17, 24, 39, 0.08)` - High elevation
- **Card**: `0 6px 16px rgba(17, 24, 39, 0.14)` - Main card shadow (sharpened)
- **Card Hover**: `0 14px 36px rgba(17, 24, 39, 0.08)` - Interactive feedback
- **Button**: `0 6px 16px rgba(17, 24, 39, 0.08)` - Button elevation
- **Elevated**: `0 18px 50px rgba(17, 24, 39, 0.12)` - Modals, dialogs
- **FAB**: `0 16px 34px rgba(17, 24, 39, 0.28)` - Floating action button
- **Glass**: `0 10px 28px rgba(17, 24, 39, 0.06)` - Glassmorphism

### Shadow Application
- **Always apply shadows** to: cards, buttons, inputs, chips, floating nav bar
- **Higher opacity** (0.10-0.14) for cards and main interactive elements
- **Better offset** (y: 4-6px) for pronounced depth
- **Android elevation**: Use appropriate values (2-6)

**Principle**: Every interactive element should have visible depth and separation from the background.

---

## Glassmorphism / Reflective Effects

### Glass Surface
- **Background**: `rgba(255, 255, 255, 0.92)` - Enhanced opacity for sharper look
- **Border**: `rgba(255, 255, 255, 0.4)` or use `#D1D5DB` for sharpness
- **Backdrop Blur**: 20px (iOS) or fallback to solid with slight transparency (Android)
- **Shadow**: Card shadow or glass shadow

### Navigation Bar (Reference Implementation)
The floating tab bar is the gold standard for the app's aesthetic:
- Enhanced glass effect with blur
- Clear border definition
- Strong shadow for floating effect
- Perfect balance of transparency and sharpness

**Principle**: All cards and surfaces should approach this level of refinement.

---

## Component Guidelines

### Cards
```javascript
{
  backgroundColor: 'rgba(255, 255, 255, 0.92)',
  borderWidth: 1.5,
  borderColor: '#D1D5DB',
  borderRadius: 22,
  shadowColor: '#111827',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.14,
  shadowRadius: 16,
  elevation: 6,
}
```

### Buttons (Keep pastel colors)
- **Primary**: Sage green gradient or solid
- **Secondary**: Lavender pastel
- **Ghost**: Transparent with sage text
- **Outline**: Border with transparent background
- Maintain soft colors, add shadow for definition

### Inputs & Search Bars
```javascript
{
  backgroundColor: 'rgba(255, 255, 255, 0.92)',
  borderWidth: 1.5,
  borderColor: '#D1D5DB', // or '#6F8F79' on focus
  borderRadius: 20,
  shadowColor: '#111827',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
}
```

### Chips & Tags
- Background: Glass white or sage light
- Border: 1.5px sharp border
- Shadow: Subtle (0.08-0.10 opacity)
- Keep rounded (22px radius)

### Category Cards
- Enhanced glass background
- Visible borders (1.5px)
- Subtle shadow for depth
- Sage accent circle for initial

---

## Animation & Interaction

### Transitions
- **Duration**: 200ms for quick feedback, 300ms for larger movements
- **Easing**: ease-out for natural feel
- **Scale**: Active state can scale to 0.98 for tactile feedback

### Active States
- Reduce opacity to 0.7-0.8
- Optional: slight scale down (0.98)
- Maintain shadow for consistency

### Focus States
- Border color changes to sage (`#6F8F79`)
- Optional: slight shadow increase

---

## Design Principles Summary

1. **Sharp over Soft**: Clear borders, strong shadows, defined hierarchy
2. **Cool over Warm**: Gray backgrounds instead of beige for modern iOS feel
3. **Glass over Flat**: Enhanced transparency and reflective qualities
4. **Depth over Flatness**: Every element should have visible elevation
5. **Definition over Blending**: Cards should stand out from background
6. **Consistency**: Apply the same treatment across all screens and components
7. **Keep Soft Corners**: Rounded edges remain unchanged - they're perfect
8. **Keep Pastel Buttons**: Sage, lavender colors stay - they're part of the brand

---

## Implementation Checklist

When updating a component:
- [ ] Background: Switch to cool gray `#F5F5F7`
- [ ] Cards: Use `rgba(255, 255, 255, 0.92)` background
- [ ] Borders: 1.5px width with `#D1D5DB` color
- [ ] Shadows: Enhanced opacity (0.10-0.14) with better offset
- [ ] Border Radius: Keep existing values
- [ ] Colors: Keep pastel sage/lavender for CTAs
- [ ] Interactive elements: Add subtle shadows for depth
- [ ] Test on both iOS and Android

---

## Reference Components

These components exemplify the design system:
- **FloatingTabBar.tsx** - Perfect glass effect, shadows, and definition
- **Home screen (index.tsx)** - Updated with sharp aesthetic
- **CoachCard (grid variant)** - Enhanced glass cards
- **SearchBar** - Sharp borders with subtle shadow
- **CategoryCard** - Clean definition with depth

---

## Notes

- **Logo Background**: Gray (matches new aesthetic)
- **Inspiration**: iOS design language, glassmorphism, modern premium apps
- **Trade-offs**: Slightly higher opacity = less transparency, but more definition
- **Performance**: Shadows and blur are handled efficiently by React Native
