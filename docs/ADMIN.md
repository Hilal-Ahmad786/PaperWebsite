# Admin Panel

A complete, self-hosted admin panel for Paper Market World, adapted from the
HilalAuto/NewAuto admin architecture. Lives entirely under `/admin` and is
**not** part of the localized public site (no locale prefix, `noindex`).

## Stack

- **Auth**: cookie sessions (httpOnly, sha256 token hash in DB) + scrypt password
  hashing + role-based access control (RBAC). No third-party auth service.
- **Data**: Drizzle ORM on **Neon Postgres** (`@neondatabase/serverless`).
  Credential-ready: with no `DATABASE_URL` the app still builds/runs and the
  public site is unaffected — the panel just shows a "not configured" notice.
- **Media**: Vercel Blob (`@vercel/blob`).
- **UI**: Next.js App Router server components + server actions, Tailwind (light
  theme, emerald accent), `lucide-react` icons.

## First-time setup

```bash
# 1. Create a free Neon Postgres DB → copy the pooled connection string
cp .env.example .env.local          # then fill in DATABASE_URL

# 2. Create the tables
npm run db:push                     # or: npm run db:generate && npm run db:migrate

# 3. Seed roles, permissions and the first super-admin
npm run db:seed                     # prints the login email + default password

# 4. Run
npm run dev                         # visit http://localhost:3000/admin
```

Set `ADMIN_EMAIL` / `ADMIN_PASSWORD` before seeding to choose your own
credentials; otherwise a default is created and printed (change it after first
login). For media uploads, also set `BLOB_READ_WRITE_TOKEN`.

## Database scripts

| Script | Purpose |
| --- | --- |
| `npm run db:push` | Push the schema straight to the DB (fastest for dev) |
| `npm run db:generate` | Generate SQL migration files into `drizzle/` |
| `npm run db:migrate` | Apply generated migrations |
| `npm run db:studio` | Open Drizzle Studio (visual DB browser) |
| `npm run db:seed` | Seed roles/permissions + super-admin |

## Modules

| Route | Module | Permission |
| --- | --- | --- |
| `/admin` | Dashboard (KPIs, latest inquiries) | `dashboard.view` |
| `/admin/leads` | Inquiries CRM (list, detail, notes, stage, CSV export) | `leads.*` |
| `/admin/content` | Insights / CMS (localized, draft→publish) | `content.*` |
| `/admin/products` | Product catalog overrides | `products.*` |
| `/admin/offers` | Stock offers | `offers.*` |
| `/admin/market` | Market indices | `market.*` |
| `/admin/media` | Media library (Vercel Blob) | `media.*` |
| `/admin/translations` | Translation coverage viewer | `translations.read` |
| `/admin/seo` | Global SEO / GA4 / GTM settings | `seo.*` |
| `/admin/analytics` | First-party analytics | `analytics.view` |
| `/admin/users` | Users | `users.manage` |
| `/admin/roles` | Roles & permissions reference | `users.manage` |
| `/admin/settings` | Brand & contact settings | `settings.manage` |
| `/admin/audit` | Audit log | `audit.read` |

## Roles

`super_admin` (all), `editor` (content/products/offers/market/media/seo),
`sales` (inquiries + dashboard), `viewer` (read-only). Defined in
`src/lib/auth/rbac.ts` and seeded into the DB.

## How data flows to the public site

- **Inquiries**: the public contact form (`/api/contact`) stores each submission
  in the `leads` table, so it appears under `/admin/leads`.
- **Analytics**: the public `/api/track` endpoint records page views / events
  into `analytics_events` for the analytics dashboard.
- **Content/products/offers/market**: stored in the DB; wiring the public pages
  to read these rows (instead of the static `src/content/*` files) is the
  natural next step — the schema and admin CRUD are in place.

## Security notes

- All `/admin` routes are `noindex` and excluded from the i18n middleware.
- Every page calls `requirePermission(...)`; permission checks are server-side.
- Failed logins are rate-limited (5 attempts → 15-minute lock).
- Sessions are httpOnly cookies; tokens are stored hashed.
- Every mutation is written to the append-only `audit_logs` table.
