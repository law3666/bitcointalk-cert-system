# Bitcointalk Certification System - Design System

## Visual Identity

### Color Palette

The design uses a sophisticated, professional palette inspired by blockchain and trust concepts.

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | Deep Blue | #0F172A | Main actions, headers, emphasis |
| Primary Light | Sky Blue | #3B82F6 | Interactive elements, links |
| Secondary | Gold | #F59E0B | Accents, highlights, premium tier |
| Success | Emerald | #10B981 | Approved status, positive actions |
| Warning | Amber | #F59E0B | Pending status, caution |
| Error | Rose | #EF4444 | Rejected status, errors |
| Neutral | Slate | #64748B | Secondary text, borders |
| Background | Off-white | #F8FAFC | Page background |
| Surface | White | #FFFFFF | Cards, panels |
| Text Primary | Dark Slate | #1E293B | Main text |
| Text Secondary | Slate | #64748B | Secondary text |

### Typography

**Font Stack**: `'Inter', 'Segoe UI', sans-serif`

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 32px | 700 | 1.2 |
| H2 | 28px | 700 | 1.3 |
| H3 | 24px | 600 | 1.3 |
| H4 | 20px | 600 | 1.4 |
| Body | 16px | 400 | 1.6 |
| Small | 14px | 400 | 1.5 |
| Tiny | 12px | 400 | 1.4 |

### Spacing System

Use 4px base unit for consistent spacing:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

### Border Radius

- Tight: 4px (inputs, small elements)
- Default: 8px (cards, buttons)
- Large: 12px (modals, panels)
- Full: 9999px (badges, avatars)

### Shadows

| Level | Shadow | Usage |
|-------|--------|-------|
| None | none | Flat elements |
| Subtle | 0 1px 2px rgba(0,0,0,0.05) | Borders, dividers |
| Small | 0 1px 3px rgba(0,0,0,0.1) | Cards, inputs |
| Medium | 0 4px 6px rgba(0,0,0,0.1) | Floating elements |
| Large | 0 10px 15px rgba(0,0,0,0.1) | Modals, dropdowns |
| Extra | 0 20px 25px rgba(0,0,0,0.15) | Overlays |

## Component Patterns

### Buttons

**Primary Button**
- Background: Deep Blue (#0F172A)
- Text: White
- Padding: 12px 24px
- Border Radius: 8px
- Hover: Darker shade
- Active: Even darker

**Secondary Button**
- Background: Transparent
- Border: 1px Sky Blue (#3B82F6)
- Text: Sky Blue
- Padding: 12px 24px
- Hover: Light blue background

**Tertiary Button**
- Background: Transparent
- Text: Sky Blue
- Padding: 12px 24px
- Hover: Light background

### Cards

- Background: White
- Border: 1px #E2E8F0
- Border Radius: 12px
- Padding: 24px
- Shadow: Small
- Hover: Subtle shadow increase

### Forms

**Input Fields**
- Background: #F8FAFC
- Border: 1px #E2E8F0
- Border Radius: 8px
- Padding: 12px 16px
- Focus: Border color changes to Sky Blue, shadow added
- Error: Border color changes to Rose

**Labels**
- Font Size: 14px
- Font Weight: 600
- Color: Text Primary
- Margin Bottom: 8px

### Status Badges

| Status | Background | Text | Icon |
|--------|-----------|------|------|
| Pending | #FEF3C7 | #92400E | ⏱️ |
| Approved | #D1FAE5 | #065F46 | ✓ |
| Rejected | #FEE2E2 | #7F1D1D | ✗ |
| Bronze | #FED7AA | #92400E | 🥉 |
| Silver | #E5E7EB | #374151 | 🥈 |
| Gold | #FEF3C7 | #B45309 | 🥇 |

### Navigation

**Top Navigation**
- Height: 64px
- Background: White
- Border Bottom: 1px #E2E8F0
- Logo: 32px height
- Items: 16px font, 12px letter spacing

**Sidebar (Admin)**
- Width: 280px
- Background: #F8FAFC
- Border Right: 1px #E2E8F0
- Items: 14px font, 8px vertical padding

## Layout Patterns

### Dashboard Layout
- Header: 64px fixed top
- Sidebar: 280px fixed left (admin only)
- Main Content: Responsive, max-width 1400px
- Padding: 24px

### Page Sections
- Hero/Header: Full width, gradient background
- Content: Max-width 1200px, centered
- Sidebar: 320px right column (optional)
- Footer: Full width, dark background

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Animation & Transitions

- **Duration**: 200ms for interactions, 300ms for page transitions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (standard easing)
- **Hover**: Subtle scale (1.02) or color shift
- **Loading**: Smooth spinner rotation
- **Transitions**: Fade in/out for modals, slide for drawers

## Accessibility

- Minimum contrast ratio: 4.5:1 for text
- Focus indicators: 2px outline in primary color
- Touch targets: Minimum 44x44px
- Keyboard navigation: Full support
- ARIA labels: All interactive elements

## Design Principles

1. **Trust & Security**: Professional, clean aesthetic with clear visual hierarchy
2. **Clarity**: Information organized logically, no cognitive overload
3. **Consistency**: Unified component library across all pages
4. **Elegance**: Subtle animations, generous whitespace, refined typography
5. **Accessibility**: Inclusive design for all users
6. **Performance**: Optimized assets, smooth interactions
