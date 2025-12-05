# Industrial Premium Design - Customization Guide

## 🎨 Design Overview

The **Industrial Premium** theme is characterized by:
- **Dark background** (creates premium, tech-forward impression)
- **Bright green accents** (#22C55E) for CTAs and highlights
- **Monospace data displays** (gives "terminal" or "dashboard" feel)
- **Market ticker** (unique scrolling data at top)
- **High contrast** (excellent readability)
- **Grid patterns** (subtle technical backgrounds)

---

## 🎯 Key Visual Elements

### 1. Market Ticker (Signature Feature)
**Location**: Below header, above all pages
**Purpose**: Shows live/recent market data
**Impact**: Makes site feel like a "trading terminal"

```typescript
// Located in: src/components/layout/MarketTicker.tsx
// Data source: src/content/market-indices.ts

// To update values:
{
  label: 'NBSK PULP',
  value: '$1,200',        // ← Change this
  change: '▲ 2.3%',       // ← Change this
  isUp: true,             // ← true for ▲, false for ▼
}
```

### 2. Color Palette

#### Primary Colors
```css
/* Background Colors (Dark) */
--bg-primary: #0A0E14;    /* Darkest - main background */
--bg-secondary: #0F172A;  /* Medium - cards, sections */
--bg-tertiary: #1E293B;   /* Lightest dark - hover states */

/* Brand Colors (Green) */
--brand-primary: #22C55E;   /* Main green - CTAs, highlights */
--brand-secondary: #16A34A; /* Darker green - hover states */
--brand-tertiary: #15803D;  /* Darkest green - active states */

/* Text Colors (Light) */
--text-primary: #E4E7EB;    /* Lightest - headings, important */
--text-secondary: #94A3B8;  /* Medium - body text */
--text-tertiary: #64748B;   /* Darker - labels, captions */
```

#### How to Change Colors
**File**: `tailwind.config.ts`

To switch to a blue theme instead of green:
```typescript
brand: {
  primary: '#3B82F6',   // Blue instead of green
  secondary: '#2563EB',
  tertiary: '#1D4ED8',
}
```

To make it lighter (not recommended, breaks "Industrial" feel):
```typescript
background: {
  primary: '#FFFFFF',   // White background
  secondary: '#F9FAFB', // Light grey
  tertiary: '#F3F4F6',
}
```

### 3. Typography

**Sans Serif (Inter)**: Used for most text
- Headings: Font weights 700-900 (bold to black)
- Body: Font weight 400-500 (regular to medium)

**Monospace (JetBrains Mono)**: Used for data/specs
- Market ticker
- Product specifications
- Stats numbers

#### Changing Fonts
**File**: `src/app/[locale]/layout.tsx`

```typescript
// Replace Inter with another font:
import { Roboto } from 'next/font/google';

const roboto = Roboto({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900']
});
```

Then update `tailwind.config.ts`:
```typescript
fontFamily: {
  sans: ['Roboto', 'system-ui', 'sans-serif'],
}
```

---

## 🔧 Common Customizations

### Make it Lighter (Not Recommended)

If client insists on a light theme:

**1. Update Tailwind Config** (`tailwind.config.ts`):
```typescript
background: {
  primary: '#FFFFFF',
  secondary: '#F9FAFB',
  tertiary: '#F3F4F6',
},
text: {
  primary: '#1F2937',
  secondary: '#4B5563',
  tertiary: '#6B7280',
},
```

**2. Update Market Ticker** (`src/components/layout/MarketTicker.tsx`):
```typescript
<div className="bg-gray-100 border-b border-gray-300">
  // Light background instead of dark
</div>
```

**3. Test Everything**: Dark → light requires extensive testing.

### Change Green to Company Color

If PMW has a specific brand color:

**File**: `tailwind.config.ts`
```typescript
brand: {
  primary: '#YOUR_COLOR',   // e.g., '#FF6B35' for orange
  secondary: '#DARKER',
  tertiary: '#DARKEST',
}
```

**Recommendation**: Stick with green (sustainability) unless strong brand reason to change.

### Remove Market Ticker

If you decide the ticker is too much:

**File**: `src/app/[locale]/layout.tsx`

Remove this line:
```typescript
<MarketTicker />  // ← Delete this
```

**Warning**: This is the *signature feature* that differentiates from competitors. Only remove if absolutely necessary.

---

## 📐 Layout Customization

### Hero Section Height

**File**: `src/app/[locale]/page.tsx`

Current:
```typescript
<Section variant="dark" className="relative overflow-hidden">
  {/* Default padding: py-20 lg:py-32 */}
</Section>
```

To make hero taller:
```typescript
<Section variant="dark" className="relative overflow-hidden py-32 lg:py-48">
  {/* Increased from default */}
</Section>
```

### Stats Grid Layout

Current: 4 columns on desktop
```typescript
<div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
```

To make 3 columns:
```typescript
<div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
```

### Card Hover Effects

Current: Cards lift on hover
```typescript
<Card hover className="...">
```

To disable:
```typescript
<Card className="...">  {/* Remove 'hover' prop */}
```

---

## 🎭 Animation Customization

### Market Ticker Speed

**File**: `tailwind.config.ts`

Current: 30 seconds for full scroll
```typescript
animation: {
  'ticker-scroll': 'ticker-scroll 30s linear infinite',
}
```

To make faster (20s):
```typescript
animation: {
  'ticker-scroll': 'ticker-scroll 20s linear infinite',
}
```

### Button Hover Animation

**File**: `src/components/ui/Button.tsx`

Current: Lifts 2px on hover
```typescript
hover:-translate-y-0.5
```

To lift more (4px):
```typescript
hover:-translate-y-1
```

To remove lift:
```typescript
/* Remove the translate class */
```

---

## 🖼 Content Customization

### Change Hero Text

**File**: `messages/en.json`

```json
{
  "home": {
    "hero": {
      "title": "Global Paper Trading",           // ← Change
      "titleHighlight": "Engineered for Scale",  // ← Change
      "subtitle": "Your custom text here...",    // ← Change
    }
  }
}
```

Changes apply to all pages using these translation keys.

### Update Stats

**File**: `src/app/[locale]/page.tsx`

```typescript
{ value: '500+', label: t('home.stats.suppliers') },  // ← Change value
{ value: '23', label: t('home.stats.countries') },
```

### Change Product Icons

Current: Using emoji (📦, 📄, 🌟)

**File**: `src/app/[locale]/page.tsx`

Replace with real icons:
```typescript
import { Package, FileText, Star } from 'lucide-react';

// Then use:
<div className="w-12 h-12 bg-brand-primary/10 ...">
  <Package className="w-6 h-6 text-brand-primary" />
</div>
```

---

## 🎨 Component Variants

### Button Variants

```typescript
<Button variant="primary">   {/* Green, filled */}
<Button variant="secondary"> {/* Outlined */}
<Button variant="ghost">     {/* Text only */}
```

### Section Variants

```typescript
<Section variant="default">  {/* Background primary */}
<Section variant="dark">     {/* Background secondary */}
<Section variant="darker">   {/* Background tertiary */}
```

### Card Styling

```typescript
<Card hover>          {/* With hover effect */}
<Card border>         {/* With border (default) */}
<Card hover={false}>  {/* Static */}
```

---

## 📱 Mobile Responsiveness

All components are responsive by default.

Breakpoints (Tailwind):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

Example:
```typescript
className="text-2xl lg:text-5xl"
// Mobile: 2xl (1.5rem)
// Desktop: 5xl (3rem)
```

To test mobile:
1. Run `npm run dev`
2. Open Chrome DevTools (F12)
3. Click "Toggle device toolbar" (Ctrl+Shift+M)
4. Test different screen sizes

---

## 🚀 Performance Tips

### Image Optimization

Always use Next.js Image component:
```typescript
import Image from 'next/image';

<Image 
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority  // For above-fold images
/>
```

### Font Loading

Already optimized with `next/font/google`:
```typescript
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
```

---

## 🎯 Best Practices

### DO ✅
- Keep dark theme (it's the differentiator)
- Use monospace fonts for data
- Maintain high contrast for accessibility
- Test RTL layout for Arabic
- Keep market ticker (signature feature)

### DON'T ❌
- Don't lighten the theme too much (loses "Industrial" feel)
- Don't remove hover effects (they signal interactivity)
- Don't use more than 2 accent colors
- Don't slow down animations (feels sluggish)
- Don't mix too many font families

---

## 📊 Before/After Comparisons

### Current (Industrial Premium)
- Dark, data-dense, Bloomberg-like
- Green accents, high contrast
- Market ticker at top
- Monospace for specs

### If You Lighten It
- Light backgrounds
- Would lose "Industrial Premium" positioning
- Would look like competitors
- ❌ NOT RECOMMENDED

### If You Remove Ticker
- Cleaner header area
- Lose signature feature
- More generic appearance
- ⚠️ CONSIDER CAREFULLY

---

## 🔍 Testing Checklist

After any customization:
- [ ] Test all breakpoints (mobile, tablet, desktop)
- [ ] Test RTL layout (Arabic)
- [ ] Check color contrast (WCAG AA minimum)
- [ ] Verify all hover states work
- [ ] Run Lighthouse audit (target 90+)
- [ ] Test language switcher
- [ ] Check all links work
- [ ] Verify forms (if implemented)

---

## 💡 Quick Reference

**Change colors**: `tailwind.config.ts`
**Change text**: `messages/*.json`
**Change layout**: Component files in `src/app/[locale]/`
**Change components**: `src/components/ui/`
**Update data**: `src/content/*.ts`

**Need help?** Check README.md for full documentation.
