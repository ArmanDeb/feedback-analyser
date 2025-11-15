# Design System - Minimal, Clear, Aesthetic

## Philosophy
**"Minimal, clear, aesthetic"** - Every design decision prioritizes clarity and purpose over decoration.

## Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Fallback**: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

### Usage
- **Headings**: Semibold (600) or Bold (700)
- **Body**: Regular (400) or Medium (500)
- **Small Text**: Regular (400), 12-14px

## Color System

### Monochromatic Palette
The entire UI uses a grayscale palette with one accent color:

**Grays:**
- `gray-50`: #f9fafb (Backgrounds)
- `gray-100`: #f3f4f6 (Subtle backgrounds)
- `gray-200`: #e5e7eb (Borders)
- `gray-300`: #d1d5db (Disabled states)
- `gray-400`: #9ca3af (Placeholder text)
- `gray-500`: #6b7280 (Secondary text)
- `gray-600`: #4b5563 (Body text)
- `gray-700`: #374151 (Emphasized text)
- `gray-800`: #1f2937 (Headings)
- `gray-900`: #111827 (Primary text/Black)

**Accent Color (Blue):**
- **Primary**: #2563eb (Blue-600) - Only for primary buttons and focus states
- **Hover**: #1d4ed8 (Blue-700)
- **Light**: #dbeafe (Blue-100) - Focus outline

### Semantic Colors (Indicators Only)
Use **tiny dots** (8px × 8px) for status indicators:

- **Critical**: Red dot (#ef4444)
- **High**: Yellow dot (#f59e0b)
- **Low**: Gray dot (#6b7280)

**DO NOT** use large colored boxes or backgrounds for status. Only small indicators.

## Spacing: 8pt Grid System

All spacing and padding must use multiples of 8px:

- `1`: 8px
- `2`: 16px
- `3`: 24px
- `4`: 32px
- `5`: 40px
- `6`: 48px
- `8`: 64px
- `10`: 80px
- `12`: 96px

**Examples:**
- Button padding: `8px 16px` (1 × 2)
- Card padding: `24px` (3)
- Section margin: `32px` (4)
- Header height: `56px` (7)

## Layout

### Header (Minimal)
- **Height**: 56px (7 × 8px)
- **Padding**: 0 16px (0 2 × 8px)
- **Content**: [Logo] [Navigation Links] [User Menu]
- **No Sidebar**: Sidebars are "dashboard" bloat

### Navigation
- **Primary**: Command Palette (Cmd+K)
- **Secondary**: Header links (Dashboard, Archive, Add App)
- **Tertiary**: User menu dropdown

### Content Area
- **Max Width**: 1400px
- **Padding**: 24px (3 × 8px)
- **Centered**: Auto margins

## Components

### Buttons

**Primary Button:**
- Background: Accent blue (#2563eb)
- Text: White
- Padding: 8px 16px
- Border radius: 4px
- Font weight: 500
- Font size: 14px

**Secondary Button:**
- Background: Transparent
- Text: Gray-900
- Border: 1px solid gray-200
- Padding: 8px 16px
- Border radius: 4px

### Status Indicators

**Critical:**
```html
<span class="indicator-critical"></span>
```

**High:**
```html
<span class="indicator-high"></span>
```

**Low:**
```html
<span class="indicator-low"></span>
```

### Focus States
- **Outline**: 2px solid accent blue
- **Offset**: 2px
- **Only visible**: On keyboard focus (`:focus-visible`)

## Examples

### Bad (Before)
```html
<!-- Large colored box -->
<div class="bg-red-500 text-white p-4">
  Critical Bug
</div>
```

### Good (After)
```html
<!-- Small indicator + monochromatic text -->
<div class="flex items-center gap-2">
  <span class="indicator-critical"></span>
  <span>Critical Bug</span>
</div>
```

## Implementation

### CSS Variables
All design tokens are defined in `src/app.css`:

```css
:root {
  --spacing-1: 8px;
  --spacing-2: 16px;
  /* ... */
  --accent-blue: #2563eb;
  --indicator-critical: #ef4444;
  /* ... */
}
```

### Tailwind Config
Extended in `tailwind.config.js`:

```js
spacing: {
  '1': '8px',
  '2': '16px',
  // ...
}
```

## Migration Checklist

- [x] Typography: Inter font installed
- [x] Color System: Monochromatic palette defined
- [x] Accent Color: Blue for primary buttons only
- [x] Semantic Indicators: Small dots for status
- [x] 8pt Grid: Spacing system implemented
- [x] Minimal Header: Replaced sidebar
- [x] Focus States: Accent blue outline
- [ ] Update all components to use semantic indicators
- [ ] Remove large colored boxes
- [ ] Ensure all spacing uses 8pt grid

