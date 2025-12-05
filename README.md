# Paper Market World - Industrial Premium

A Next.js 14 multilingual B2B paper trading platform with Industrial Premium dark theme design.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

The default locale is English. Access other locales via:
- English: `/en`
- Turkish: `/tr`
- German: `/de`
- Arabic: `/ar`

## 📁 Project Structure

```
paper-market-world/
├── src/
│   ├── app/
│   │   ├── [locale]/           # Locale-specific pages
│   │   │   ├── layout.tsx      # Locale layout with header/footer
│   │   │   ├── page.tsx        # Home page
│   │   │   ├── products/       # Products pages
│   │   │   ├── services/       # Services page
│   │   │   ├── regions/        # Regions pages
│   │   │   ├── about/          # About page
│   │   │   ├── sustainability/ # Sustainability page
│   │   │   ├── insights/       # Blog/insights pages
│   │   │   ├── stock-offers/   # Stock offers page
│   │   │   ├── contact/        # Contact/RFQ page
│   │   │   └── legal/          # Legal pages
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── layout/             # Layout components (Header, Footer, etc.)
│   │   └── ui/                 # Reusable UI components
│   ├── content/                # Data files (products, offers, regions)
│   ├── lib/                    # Utility functions
│   ├── types/                  # TypeScript type definitions
│   └── i18n.ts                 # i18n configuration
├── messages/                   # Translation files (en.json, tr.json, etc.)
├── middleware.ts               # Locale routing middleware
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

## 🎨 Design System

### Colors (Industrial Premium Dark Theme)

```typescript
Background:
- Primary: #0A0E14 (darkest)
- Secondary: #0F172A (dark)
- Tertiary: #1E293B (lighter dark)

Brand:
- Primary: #22C55E (green)
- Secondary: #16A34A (darker green)
- Tertiary: #15803D (darkest green)

Text:
- Primary: #E4E7EB (lightest)
- Secondary: #94A3B8 (medium)
- Tertiary: #64748B (darker)

Border:
- Primary: rgba(71, 85, 105, 0.2)
- Secondary: rgba(71, 85, 105, 0.1)
```

### Typography

- **Sans Serif**: Inter (body text, headings)
- **Monospace**: JetBrains Mono (data, specs, market ticker)

### Key Components

- `Button`: Primary, secondary, and ghost variants
- `Section`: Consistent page section wrapper
- `Card`: Hover-enabled cards for products/offers
- `MarketTicker`: Scrolling market data ticker (unique feature)
- `Header`: Navigation with language switcher
- `Footer`: Multi-column footer with links

## 🌐 Internationalization

The site supports 4 languages:
- **English (en)** - Default
- **Turkish (tr)**
- **German (de)**
- **Arabic (ar)** - RTL support included

### Adding a New Language

1. Add locale to `src/i18n.ts`:
```typescript
export const locales = ['en', 'tr', 'de', 'ar', 'es'] as const;
```

2. Create translation file `messages/es.json`

3. Update middleware matcher in `middleware.ts`

### Translation File Structure

```json
{
  "nav": { "products": "Products", ... },
  "common": { "getQuote": "Request Quote", ... },
  "home": { ... },
  "products": { ... },
  "contact": { ... },
  "footer": { ... }
}
```

## 📦 Content Management

### Adding a New Product

Edit `src/content/products.ts`:

```typescript
{
  slug: 'new-product',
  i18nKey: 'products.newProduct',
  category: 'board',
  specTable: [
    { labelKey: 'specs.gsmRange', value: '200-300 gsm' },
  ],
  applications: ['products.newProduct.apps.app1'],
  origins: ['Turkey', 'EU'],
  typicalIndustries: ['products.newProduct.industries.ind1'],
}
```

Then add translations to `messages/en.json`:

```json
{
  "products": {
    "newProduct": {
      "name": "New Product",
      "short": "Short description",
      "description": "Full description",
      "apps": { "app1": "Application 1" },
      "industries": { "ind1": "Industry 1" }
    }
  }
}
```

### Adding a Stock Offer

Edit `src/content/offers.ts`:

```typescript
{
  id: 'SO-2024-XXX',
  productSlug: 'duplex-board',
  gradeName: 'GC2 Duplex',
  gsmRange: '250 gsm',
  originCountry: 'Turkey',
  quantityTons: 100,
  port: 'Istanbul',
  availability: 'Ready',
  type: 'prime',
  updatedAt: '2024-12-01T00:00:00Z',
}
```

### Updating Market Ticker

Edit `src/content/market-indices.ts`:

```typescript
{
  label: 'NBSK PULP',
  value: '$1,200',
  change: '▲ 2.3%',
  isUp: true,
}
```

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```env
# Site URL
NEXT_PUBLIC_SITE_URL=https://papermarketworld.com

# Email service (for contact form)
SENDGRID_API_KEY=your_key_here
CONTACT_EMAIL=info@papermarketworld.com

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Tailwind CSS

The theme is configured in `tailwind.config.ts`. All colors, fonts, and animations are defined there.

## 📄 Pages Implemented

### ✅ Completed
- [x] Home page with hero, stats, products, offers
- [x] Header with navigation and language switcher
- [x] Footer with links
- [x] Market Ticker (unique feature)
- [x] Locale routing and RTL support

### 🚧 To Be Created
- [ ] Products overview page (`/products`)
- [ ] Product detail pages (`/products/[slug]`)
- [ ] Services page
- [ ] Regions pages (overview + 3 detail pages)
- [ ] About page
- [ ] Sustainability page
- [ ] Insights/blog pages
- [ ] Stock & Offers page with filters
- [ ] Contact/RFQ page with form
- [ ] Legal pages (Privacy, Terms, Imprint)

## 🎯 Next Steps

### Phase 2: Complete Core Pages
1. Create products pages
2. Create contact form with API route
3. Create stock offers page with filtering
4. Create static pages (About, Sustainability, Services)

### Phase 3: Advanced Features
1. Product Finder (interactive multi-step tool)
2. Logistics Calculator
3. Sustainability Dashboard
4. Blog/MDX support for Insights

### Phase 4: Backend Integration
1. Connect to real MongoDB database
2. API routes for forms (contact, quote)
3. Admin panel for managing offers
4. Real-time market data API integration

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

Vercel will automatically:
- Install dependencies
- Build the project
- Deploy with HTTPS
- Handle locale routing

### Custom Server

```bash
npm run build
npm start
```

## 📚 Key Features

### 🌟 Unique Differentiators

1. **Market Ticker**: Live scrolling market data (no competitor has this)
2. **Industrial Premium Theme**: Dark, data-dense, professional
3. **True Multilingual**: 4 languages with RTL support
4. **B2B Optimized**: Quote-based, not checkout-based

### 🎨 Design Highlights

- Dark theme with green accents
- Monospace fonts for data
- Hover effects on cards
- Smooth animations
- Grid pattern backgrounds
- Gradient text effects

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **i18n**: next-intl
- **Fonts**: Inter, JetBrains Mono
- **Deployment**: Vercel

## 📖 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [next-intl](https://next-intl-docs.vercel.app/)

## 🤝 Contributing

This is a private project for Paper Market World. Internal team members:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For questions or issues, contact: info@papermarketworld.com

---

Built with ❤️ for Paper Market World
