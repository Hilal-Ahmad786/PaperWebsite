'use client';

import { useRef, useState, FormEvent } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { products } from '@/content/products';
import { type Locale } from '@/i18n';
import { getLocalizedPath } from '@/routing';
import { productCategoryFromSlug, trackContactSubmit, trackFormStart } from '@/lib/analytics';
import { beaconTrack } from '@/lib/tracking/beacon';
import { TurnstileWidget } from '@/components/ui/TurnstileWidget';

const HUELSE_TYPES = ['konus', 'garn', 'kreuzspul', 'faerbe', 'naehgarn', 'spezial'] as const;

// Shared field styling. Inputs sit on the darkest surface (bg-background-primary)
// so they stand out as clear, tappable wells against the lighter form card, with
// a visible border and a green focus ring for strong contrast on the dark theme.
const fieldClass =
  'w-full bg-background-primary border border-white/10 text-text-primary placeholder:text-text-tertiary px-4 py-3.5 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/25 transition-colors';
const labelClass = 'block text-sm font-medium text-text-secondary mb-2';
const req = <span className="text-brand-primary">*</span>;

export function ContactForm() {
    const t = useTranslations('contact.form');
    const tAll = useTranslations();
    const locale = useLocale() as Locale;
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialProduct = searchParams.get('product') || '';
    const initialOffer = searchParams.get('offer') || '';

    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    // Guards the diagnostic `form_start` event so it fires exactly ONCE per form
    // session (one mount / page view) — never again on later focus, change,
    // input, submit, validation or rerender.
    const hasTrackedFormStart = useRef(false);

    /**
     * Fire the diagnostic `form_start` on the user's first interaction only.
     * Wired to a single capture handler (`onFocusCapture`) on the <form> — focus
     * always precedes any change/typing — and the ref makes every subsequent
     * call a no-op, so the event can never fire twice for the same form.
     */
    function handleFormStart() {
        if (hasTrackedFormStart.current) return;
        hasTrackedFormStart.current = true;
        trackFormStart({
            formName: 'quote_form',
            productCategory: productCategoryFromSlug(initialProduct || undefined),
            pageLanguage: locale,
            pagePath: typeof window !== 'undefined' ? window.location.pathname : undefined,
            sourceComponent: 'contact_form',
        });
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus('submitting');

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries()) as Record<string, string>;
        // Attach the current locale and the Turnstile token (if the widget rendered).
        data.locale = locale;
        data.turnstileToken = String(data['cf-turnstile-response'] ?? '');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to send');

            // NOTE: if a technical-drawing/spec file input is added to this form
            // later, call `trackSpecUpload({ fileType, productCategory, pageLanguage })`
            // from the file input's onChange — pass only the extension (e.g. 'pdf'),
            // never the raw file name or contents.

            // PRIMARY conversion event (fired only after a successful API
            // response), then redirect to the thank-you page. The thank-you page
            // only fires the backup `lead_thank_you_view` — never `generate_lead`
            // again — so submissions are not double counted.
            trackContactSubmit({
                productSelected: data.product || undefined,
                productCategory: productCategoryFromSlug(data.product || undefined),
                quantityRange: data.quantity || undefined,
                pageLanguage: locale,
                sourceComponent: 'contact_form',
            });
            // First-party conversion beacon (admin "Button clicks" + lead protection).
            beaconTrack('form_submit', { location: 'contact_form' });
            setStatus('success');
            router.push(getLocalizedPath(locale, '/thank-you'));
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    }

    if (status === 'success') {
        return (
            <div className="bg-green-500/10 border border-green-500/20 p-8 text-center rounded-sm">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-text-primary mb-2">{t('success')}</h3>
                <Button variant="secondary" onClick={() => setStatus('idle')} className="mt-4">
                    {t('sendAnother')}
                </Button>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            onFocusCapture={handleFormStart}
            className="space-y-6"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className={labelClass}>
                        {t('name')} {req}
                    </label>
                    <input type="text" id="name" name="name" required className={fieldClass} />
                </div>
                <div>
                    <label htmlFor="company" className={labelClass}>
                        {t('company')} {req}
                    </label>
                    <input type="text" id="company" name="company" required className={fieldClass} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="email" className={labelClass}>
                        {t('email')} {req}
                    </label>
                    <input type="email" id="email" name="email" required className={fieldClass} />
                </div>
                <div>
                    <label htmlFor="phone" className={labelClass}>
                        {t('phone')}
                    </label>
                    <input type="tel" id="phone" name="phone" className={fieldClass} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="product" className={labelClass}>
                        {t('product')}
                    </label>
                    <div className="relative">
                        <select
                            id="product"
                            name="product"
                            defaultValue={initialProduct}
                            className={`${fieldClass} appearance-none pr-11`}
                        >
                            <option value="">{t('productPlaceholder')}</option>
                            {products.map((p) => (
                                <option key={p.slug} value={p.slug}>
                                    {tAll(`${p.i18nKey}.name`)}
                                </option>
                            ))}
                            <option value="other">{t('other')}</option>
                        </select>
                        <ChevronDown
                            size={18}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="quantity" className={labelClass}>
                        {t('quantity')}
                    </label>
                    <input
                        type="text"
                        id="quantity"
                        name="quantity"
                        placeholder={t('quantityPlaceholder')}
                        className={fieldClass}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="vatId" className={labelClass}>
                        {t('vatId')}
                    </label>
                    <input
                        type="text"
                        id="vatId"
                        name="vatId"
                        placeholder={t('vatIdPlaceholder')}
                        className={fieldClass}
                    />
                </div>
                <div>
                    <label htmlFor="huelseType" className={labelClass}>
                        {t('huelseType')}
                    </label>
                    <div className="relative">
                        <select
                            id="huelseType"
                            name="huelseType"
                            defaultValue=""
                            className={`${fieldClass} appearance-none pr-11`}
                        >
                            <option value="">{t('huelseTypePlaceholder')}</option>
                            {HUELSE_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {tAll(`products.paperConesTubes.huelseTypes.${type}.name`)}
                                </option>
                            ))}
                            <option value="other">{t('other')}</option>
                        </select>
                        <ChevronDown
                            size={18}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary"
                        />
                    </div>
                </div>
            </div>

            {initialOffer && (
                <input type="hidden" name="offerId" value={initialOffer} />
            )}

            <div>
                <label htmlFor="message" className={labelClass}>
                    {t('message')} {req}
                </label>
                <textarea id="message" name="message" required rows={5} className={fieldClass}></textarea>
            </div>

            {/* Honeypot: hidden from real users; bots that fill it are dropped.
                Uses a neutral field name (not "website"/"email"/etc.) so browser
                autofill and password managers don't fill it and get real users
                mistaken for bots. */}
            <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="contact_hp">Leave this field empty</label>
                <input
                    type="text"
                    id="contact_hp"
                    name="contact_hp"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                />
            </div>

            {/* Bot protection (renders only when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set). */}
            <TurnstileWidget />

            {status === 'error' && (
                <div className="text-red-500 text-sm">{t('error')}</div>
            )}

            <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={status === 'submitting'}
            >
                {status === 'submitting' ? t('submitting') : t('submit')}
            </Button>
        </form>
    );
}
