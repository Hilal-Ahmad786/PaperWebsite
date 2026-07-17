# Tracking & Conversions

How Paper Market World tracks visits, CTA engagement and leads — and how those
signals map to GA4 and Google Ads later. This is a **GTM-centric** setup: the
codebase never hardcodes GA4, Google Ads, conversion IDs/labels, remarketing
tags or `gtag` snippets. It only loads GTM, loads the consent banner, and pushes
clean semantic events into `window.dataLayer`. Everything else is configured
inside the GTM container.

---

## 1. Architecture overview

Two independent systems run in parallel:

1. **GTM / dataLayer (client → Google).** Semantic events are pushed to
   `window.dataLayer` by typed helpers in `src/lib/analytics.ts`. GTM reads them
   and fires GA4 + Google Ads tags. Gated by Consent Mode v2.
2. **First-party tracking (client → own Postgres).** Fire-and-forget beacons to
   `/api/track/*` power the admin **Analytics** and **Button Clicks** reports and
   the **click-fraud protection**. This works even if a visitor rejects cookies
   or blocks GTM. It is **not** affected by the dataLayer helpers.

Orchestration lives in `src/app/(site)/[locale]/layout.tsx`.

```
<head>
  ConsentModeDefault      (beforeInteractive)  → consent = denied by default
</head>
<body>
  GoogleTagManagerNoScript                     → <noscript> fallback
  UsercentricsCmp         (afterInteractive)   → banner; flips consent on choice
  GoogleTagManager        (afterInteractive)   → loads the container
  ...
  SiteTracking                                 → first-party page_view + fraud tracker
</body>
```

---

## 2. Consent Mode loading order

`src/components/analytics/ConsentMode.tsx` runs **before everything else**
(`strategy="beforeInteractive"`, in `<head>`). It sets Google Consent Mode v2
defaults to **denied** for all ad/analytics storage, grants only
`security_storage`, and sets `wait_for_update: 500`, `url_passthrough`,
`ads_data_redaction`.

`src/components/analytics/UsercentricsCmp.tsx` (gated by
`NEXT_PUBLIC_USERCENTRICS_SETTINGS_ID`) shows the certified banner. When the user
accepts/rejects, Usercentrics emits `gtag('consent','update', …)` to flip the
signals. Until then, Google tags run in cookieless modeling mode in the EEA.

Order guarantee: **ConsentMode → Usercentrics → GTM**. Never reorder these.

---

## 3. GTM's role

`src/components/analytics/GoogleTagManager.tsx` loads the container from
`NEXT_PUBLIC_GTM_ID` (renders nothing until set). All of the following are built
**inside GTM**, not in code:

- GA4 configuration tag + GA4 event tags
- Google Ads conversion tags (primary + secondary)
- Google Ads remarketing / dynamic remarketing
- Conversion Linker
- Enhanced conversions (later, via GTM user-provided data — **not** implemented
  in code and **not** via normal event params)

Because consent defaults load first, every GTM tag inherits Consent Mode gating
automatically.

---

## 4. DataLayer event list

All pushed by helpers in `src/lib/analytics.ts`. Every push is auto-enriched
with `timestamp`, `page_path`, `page_url`, `page_language` (browser-derived).

| Event                 | Helper                    | Role                          | Fired from |
|-----------------------|---------------------------|-------------------------------|------------|
| `generate_lead`       | `trackContactSubmit()`    | **Primary conversion**        | `ContactForm.tsx`, after a successful `/api/contact` response |
| `contact_click`       | `trackContactClick()`     | **Secondary conversion**      | `TrackedContactLink.tsx`, `ChatWidget.tsx` |
| `spec_upload`         | `trackSpecUpload()`       | High-intent secondary         | Form file input (helper ready; wire when an upload field is added) |
| `quote_cta_click`     | `trackQuoteCtaClick()`    | Diagnostic / remarketing      | `QuoteCtaLink.tsx` (home hero, product hero + bottom CTAs) |
| `form_start`          | `trackFormStart()`        | Diagnostic                    | `ContactForm.tsx`, once on first interaction |
| `lead_thank_you_view` | `trackLeadThankYouView()` | Backup / diagnostic           | `LeadThankYouTracker.tsx` on `/thank-you` |

**No double counting:** `generate_lead` fires once, on successful submit. The
`/thank-you` page fires only `lead_thank_you_view` — never `generate_lead`
again.

---

## 5. Event parameters

Only safe, non-sensitive parameters are pushed. **Never** pushed to dataLayer:
email, phone, name, message text, company details, raw file name/content, IP,
device fingerprint, raw user ID.

Common safe params: `event`, `form_name`, `lead_type`, `product_category`,
`product_selected`, `page_language`, `country_selected`, `quantity_range`,
`contact_method`, `click_location`, `cta_location`, `page_path`, `page_url`,
`file_type`, `upload_context`, `business_context`, `timestamp`,
`source_component`.

### Example payloads

`generate_lead` (primary):

```json
{
  "event": "generate_lead",
  "form_name": "quote_form",
  "lead_type": "quote_request",
  "product_category": "paper_cones_tubes",
  "product_selected": "paper-cones-tubes",
  "page_language": "de",
  "quantity_range": "500 units",
  "business_context": "b2b",
  "source_component": "contact_form",
  "page_path": "/de/contact",
  "page_url": "https://www.papermarketworld.com/de/contact",
  "timestamp": "2026-07-17T10:00:00.000Z"
}
```

`contact_click` (secondary):

```json
{
  "event": "contact_click",
  "contact_method": "whatsapp",
  "click_location": "floating_widget",
  "source_component": "chat_widget",
  "page_language": "en",
  "page_path": "/en/products/paper-cones-tubes"
}
```

`quote_cta_click` (diagnostic):

```json
{
  "event": "quote_cta_click",
  "cta_location": "product_hero",
  "product_category": "paper_cones_tubes",
  "source_component": "quote_cta_link",
  "page_path": "/en/products/paper-cones-tubes"
}
```

`form_start` (diagnostic):

```json
{ "event": "form_start", "form_name": "quote_form", "product_category": "paper_cones_tubes", "source_component": "contact_form" }
```

`spec_upload` (high-intent secondary — extension only, never the file name):

```json
{ "event": "spec_upload", "form_name": "quote_form", "file_type": "pdf", "source_component": "contact_form" }
```

`lead_thank_you_view` (backup):

```json
{ "event": "lead_thank_you_view", "form_name": "quote_form", "lead_type": "quote_request", "source_component": "thank_you_page" }
```

---

## 6–8. Conversion mapping (configure later in GTM / Google Ads)

### Primary conversion

- **`generate_lead`** → Google Ads: **`PMW | Quote Form Submit`**
  - Category: *Submit lead form*
  - Count: *One*
  - Include in "Account default" goals: **yes**

### Secondary conversions

- `contact_click` where `contact_method = whatsapp` → **`PMW | WhatsApp Click`**
- `contact_click` where `contact_method = phone` → **`PMW | Phone Click`**
- `contact_click` where `contact_method = email` → **`PMW | Email Click`**
- `spec_upload` → **`PMW | Specification Upload`**

### GA4-only diagnostics (do **not** import as Google Ads conversions)

- `quote_cta_click`
- `form_start`
- `lead_thank_you_view`

### Future offline conversion

- **`PMW | Qualified Lead`** — imported later from CRM/admin after sales review.
  Not implemented now.

> ⚠️ **Do not make both `generate_lead` and `lead_thank_you_view` primary Google
> Ads conversions.** They describe the same submission, so counting both
> double-counts every lead. Use `generate_lead` as primary and keep
> `lead_thank_you_view` as a GA4 diagnostic to detect discrepancies.

A submitted quote form is worth far more than a WhatsApp/phone/email click.
Weight bids accordingly: `generate_lead` primary, contact clicks secondary,
CTA/form-start diagnostics only.

---

## 9. How first-party tracking relates to GTM

The first-party system is **independent** of GTM and Google:

- `beaconTrack()` (`src/lib/tracking/beacon.ts`) → `POST /api/track/click` for CTA
  clicks + form submits. Also dispatches a `cp:conversion` window event to mark
  the visit converted.
- `SiteTracking.tsx` → first-party `page_view` on route change + mounts the
  click-fraud tracker.
- `click-protection-tracker.tsx` → captures `gclid`/`gbraid`/`wbraid`, UTMs, a
  device fingerprint and engagement metrics → `/api/track/visit`,
  `/api/track/engagement`.
- `/api/track` and `/api/track/click` write to `analyticsEvents`, storing a
  **salted HMAC hash of the IP** (peppered with `CRON_SECRET`), never the raw IP.
- `/api/cron/click-protection` runs the fraud scoring (guarded by `CRON_SECRET`).

Alignment: the new dataLayer events also emit matching first-party beacons where
useful, so the admin **Button Clicks** report stays in sync:

| dataLayer event   | first-party beacon (`analyticsEvents.type`) |
|-------------------|---------------------------------------------|
| `generate_lead`   | `form_submit` |
| `contact_click`   | `whatsapp_click` / `phone_click` / `email_click` |
| `quote_cta_click` | `quote_click` |
| `form_start`      | `form_start` |
| `spec_upload`     | `spec_upload` |

Admin surfaces: **Analytics** (`/admin/analytics`) and **Button Clicks**
(`/admin/clicks`). New event types have labels in
`src/lib/admin/i18n/dict/clicks.ts` (en + tr) and are in the clicks page
`KNOWN_TYPES` set.

> Note: the beacon carries a session id + hashed IP server-side (for fraud
> scoring), but **none** of that reaches the dataLayer — the two systems keep
> separate identifiers.

---

## 10. Testing checklist (GTM Preview + Tag Assistant)

Set `NEXT_PUBLIC_GTM_ID` locally (and optionally
`NEXT_PUBLIC_USERCENTRICS_SETTINGS_ID`), then run `npm run dev`.

**dataLayer / GTM Preview**

- [ ] Open GTM Preview (Tag Assistant) and connect to the site.
- [ ] `generate_lead` fires **once** after a successful quote-form submit (not on
      validation error, not on the thank-you page).
- [ ] `form_start` fires **once** per form on first interaction, not per keystroke.
- [ ] `contact_click` fires with the correct `contact_method` for WhatsApp / phone
      / email links (footer + floating widget).
- [ ] `quote_cta_click` fires on commercial quote CTAs only (home hero, product
      hero, product bottom CTA) — not on ordinary nav links.
- [ ] `lead_thank_you_view` fires on `/thank-you`; `generate_lead` does **not**.
- [ ] `spec_upload` — helper exists; verify once a file input is wired.
- [ ] No payload contains email, phone, name, message, company, file name, IP or
      fingerprint. Inspect `window.dataLayer` in the console.

**Consent Mode v2**

- [ ] Before accepting the banner, consent defaults are `denied` (Tag Assistant →
      Consent tab). Tags run in modeling mode.
- [ ] After Accept, `ad_storage` / `analytics_storage` flip to `granted`.
- [ ] After Reject, they stay `denied`.

**First-party (admin)**

- [ ] With `DATABASE_URL` set, submit the form / click CTAs, then check
      `/admin/clicks` — counts increment and new types show friendly labels.
- [ ] `/admin/analytics` shows page views + form submits.

**Resilience**

- [ ] With `NEXT_PUBLIC_GTM_ID` unset: no GTM loads, no console errors, site works.
- [ ] With `NEXT_PUBLIC_USERCENTRICS_SETTINGS_ID` unset: no banner, no errors.
- [ ] `npm run type-check`, `npm run lint`, `npm run build` all pass.

---

## Environment variables

See `.env.example`. Tracking-relevant:

- `NEXT_PUBLIC_GTM_ID` — GTM container (e.g. `GTM-XXXXXXX`). Optional; no GTM
  until set.
- `NEXT_PUBLIC_USERCENTRICS_SETTINGS_ID` — consent banner. Optional; no banner
  until set.
- `CRON_SECRET` — first-party IP hashing pepper + cron auth.
- `IPINFO_TOKEN`, `CLICK_PROTECTION_INTERNAL_IPS` — optional click-protection
  tuning.

---

## Privacy notes

- No personal data in the dataLayer — ever. Enhanced conversions, when added,
  must go through GTM's user-provided-data mechanism (a separate,
  privacy-reviewed implementation), never through normal GA4 event params.
- First-party storage keeps only a **hashed** IP and a session id, server-side.
