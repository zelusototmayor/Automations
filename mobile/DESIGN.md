# Better Coaching UI Design Spec v1

This document defines the official design system for the Better Coaching mobile application.

---

## Color Tokens

### Neutrals
| Token | Hex Value | Usage |
|-------|-----------|-------|
| `bg-base` | `#F7F6F3` | Main background |
| `surface` | `rgba(255,255,255,0.88)` | Card surfaces with glass effect |
| `border` | `#E7E7E7` | Default borders |
| `text-primary` | `#111827` | Primary text |
| `text-secondary` | `#6B7280` | Secondary text |
| `text-placeholder` | `#9CA3AF` | Placeholder/muted text |

### Pastels
| Token | Hex Value | Usage |
|-------|-----------|-------|
| `sage` | `#DCE9DF` | Primary pastel (wellness, growth) |
| `lavender` | `#E7E0F3` | Secondary pastel (premium, creativity) |
| `sky` | `#D9ECF7` | Accent pastel (clarity, trust) |
| `sand` | `#F1E9DD` | Tertiary pastel (warmth) |

### Action Colors
| Token | Hex Value | Usage |
|-------|-----------|-------|
| `cta-start` | `#6F8F79` | CTA gradient start |
| `cta-end` | `#4F6F5A` | CTA gradient end |
| `ink` | `#1F2937` | Dark text/icons on light surfaces |
| `success` | `#22C55E` | Success states |

### Dark Mode Adaptations
| Light Token | Dark Equivalent |
|-------------|-----------------|
| `bg-base` | `#1A1A1A` |
| `surface` | `rgba(30,30,30,0.92)` |
| `border` | `#333333` |
| `text-primary` | `#F5F5F5` |
| `text-secondary` | `#A0A0A0` |

---

## Typography

### Font Family
- **Primary:** Inter (all weights: 400, 500, 600, 700)
- **Fallback:** System font

### Type Scale
| Variant | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| `section-title` | 22-24px | SemiBold (600) | 1.25 | -0.02em |
| `card-title` | 16-18px | SemiBold (600) | 1.3 | -0.01em |
| `body` | 15px | Regular (400) | 1.5 | 0 |
| `body-sm` | 13px | Regular (400) | 1.5 | 0 |
| `meta/caption` | 12-13px | Regular (400) | 1.4 | 0 |
| `pill-text` | 12px | Medium (500) | 1.3 | 0.02em |

### Letter Spacing for Titles
All titles (section headers, card titles) use `-0.02em` tracking for a tighter, more premium look.

---

## Spacing

### Base Scale (px)
`4, 8, 12, 16, 20, 24, 32`

### Common Applications
| Element | Value |
|---------|-------|
| Screen horizontal padding | 20px |
| Section vertical gap | 24px |
| Card internal padding | 16px |
| Component gaps | 8-12px |

---

## Border Radius

| Element | Radius |
|---------|--------|
| `card` | 22px |
| `input` | 18-20px |
| `chip` | 22px |
| `pill` | 9999px (full) |
| `tab-bar` | 22-24px |
| `avatar` | 14px |
| `avatar-lg` | 22px |

---

## Shadows

### Card Shadow (Default)
```
0 10px 28px rgba(17, 24, 39, 0.06)
```
- offsetX: 0
- offsetY: 10px
- blurRadius: 28px
- color: `rgba(17, 24, 39, 0.06)`

### Elevated Shadow
```
0 18px 50px rgba(17, 24, 39, 0.12)
```
For modals, popovers, and elevated content.

### FAB Shadow
```
0 16px 34px rgba(17, 24, 39, 0.28)
```
For floating action buttons.

### React Native Implementation
```javascript
shadowColor: 'rgb(17, 24, 39)',
shadowOffset: { width: 0, height: 10 },
shadowOpacity: 0.06,
shadowRadius: 28,
elevation: 4, // Android
```

---

## Component Specifications

### Cards
- Background: `rgba(255,255,255,0.88)` (glass effect)
- Border: 1px `#E7E7E7`
- Radius: 22px
- Shadow: Card shadow
- Padding: 16px

### Buttons (Primary CTA)
- Height: 48px (md), 56px (lg)
- Radius: 18-20px
- Background: Linear gradient `#6F8F79` → `#4F6F5A`
- Text: White, 15px, SemiBold
- Shadow: Card shadow

### Inputs / Search Bar
- Height: 48px
- Radius: 18-20px
- Border: 1px `#E7E7E7` (focus: sage color)
- Background: `rgba(255,255,255,0.88)`
- Text: 15px, Regular
- Placeholder: `#9CA3AF`

### Chips / Category Pills
- Height: auto (padding-based)
- Padding: 10px 20px
- Radius: 22px
- Border: 1px (selected: filled, unselected: border only)
- Text: 13px, Medium

### Floating Tab Bar
- Height: 64px
- Radius: 22-24px
- Background: `rgba(255,255,255,0.85)` with blur
- Border: 1px `rgba(255,255,255,0.5)`
- Shadow: Card shadow
- Position: 16px from bottom and sides

### Badges
- Padding: 3-5px vertical, 8-12px horizontal
- Radius: 10-12px
- Text: 10-12px, SemiBold, uppercase
- Letter spacing: 0.3px

---

## Glass Effect (Glassmorphism)

### Surface Glass
```css
background: rgba(255, 255, 255, 0.88);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.4);
```

### Dark Mode Glass
```css
background: rgba(30, 30, 30, 0.92);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.08);
```

---

## Quality Checklist (Section 7)

Before shipping, verify:

- [ ] All backgrounds use `#F7F6F3` (not `#FAFAF8`)
- [ ] All primary text uses `#111827` (not `#2D2D2D`)
- [ ] All borders use `#E7E7E7` (not `#E8E6E3`)
- [ ] Sage pastel is `#DCE9DF` (not `#D4DDD0`)
- [ ] Lavender pastel is `#E7E0F3` (not `#E0D6EA`)
- [ ] Sky pastel is `#D9ECF7` (not `#D4E5ED`)
- [ ] Sand pastel `#F1E9DD` exists and is used
- [ ] CTA gradient uses `#6F8F79` → `#4F6F5A`
- [ ] Card radius is 22px (not 16px)
- [ ] Shadows are wide/soft: `0 10px 28px rgba(17,24,39,0.06)`
- [ ] Title tracking is `-0.02em` (not `-0.009em`)
- [ ] Dark mode still functions with adapted tokens
- [ ] No hardcoded old color values remain in components

---

## Migration Notes

### Colors Changed
| Old Value | New Value | Notes |
|-----------|-----------|-------|
| `#FAFAF8` | `#F7F6F3` | Background base |
| `#2D2D2D` | `#111827` | Primary text |
| `#E8E6E3` | `#E7E7E7` | Border |
| `#D4DDD0` | `#DCE9DF` | Sage pastel |
| `#E0D6EA` | `#E7E0F3` | Lavender pastel |
| `#D4E5ED` | `#D9ECF7` | Sky pastel |
| `#A8B5A0` | `#6F8F79` | CTA start |
| `#7A8A72` | `#4F6F5A` | CTA end |
| `#6B6B6B` | `#6B7280` | Secondary text |
| `#9A9A9A` | `#9CA3AF` | Muted text |

### Radius Changed
| Element | Old | New |
|---------|-----|-----|
| Card | 16px | 22px |
| Input | 14px | 18-20px |
| Tab bar | 30-32px | 22-24px |

### Shadow Changed
| Old Shadow | New Shadow |
|------------|------------|
| `0 2px 8px rgba(0,0,0,0.04)` | `0 10px 28px rgba(17,24,39,0.06)` |
