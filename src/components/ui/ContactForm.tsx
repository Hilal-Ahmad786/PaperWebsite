'use client';

import { useState, FormEvent } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { products } from '@/content/products';
import { type Locale } from '@/i18n';
import { getLocalizedPath } from '@/routing';
import { trackContactSubmit } from '@/lib/analytics';
import { beaconTrack } from '@/lib/tracking/beacon';
import { TurnstileWidget } from '@/components/ui/TurnstileWidget';

const HUELSE_TYPES = ['konus', 'garn', 'kreuzspul', 'faerbe', 'naehgarn', 'spezial'] as const;

export function ContactForm() {
    const t = useTranslations('contact.form');
    const tAll = useTranslations();
    const locale = useLocale() as Locale;
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialProduct = searchParams.get('product') || '';
    const initialOffer = searchParams.get('offer') || '';

    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

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

            // PRIMARY conversion event, then redirect to the thank-you page
            // for reliable conversion firing.
            trackContactSubmit({
                product: String(data.product || ''),
                huelseType: String(data.huelseType || ''),
                quantity: String(data.quantity || ''),
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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
                        {t('name')} *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full bg-background-secondary border border-border-primary text-text-primary px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                    />
                </div>
                <div>
                    <label htmlFor="company" className="block text-sm font-medium text-text-secondary mb-2">
                        {t('company')} *
                    </label>
                    <input
                        type="text"
                        id="company"
                        name="company"
                        required
                        className="w-full bg-background-secondary border border-border-primary text-text-primary px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                        {t('email')} *
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full bg-background-secondary border border-border-primary text-text-primary px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                    />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-text-secondary mb-2">
                        {t('phone')}
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="w-full bg-background-secondary border border-border-primary text-text-primary px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="product" className="block text-sm font-medium text-text-secondary mb-2">
                        {t('product')}
                    </label>
                    <select
                        id="product"
                        name="product"
                        defaultValue={initialProduct}
                        className="w-full bg-background-secondary border border-border-primary text-text-primary px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors appearance-none"
                    >
                        <option value="">{t('productPlaceholder')}</option>
                        {products.map((p) => (
                            <option key={p.slug} value={p.slug}>
                                {tAll(`${p.i18nKey}.name`)}
                            </option>
                        ))}
                        <option value="other">{t('other')}</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-text-secondary mb-2">
                        {t('quantity')}
                    </label>
                    <input
                        type="text"
                        id="quantity"
                        name="quantity"
                        placeholder={t('quantityPlaceholder')}
                        className="w-full bg-background-secondary border border-border-primary text-text-primary px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="vatId" className="block text-sm font-medium text-text-secondary mb-2">
                        {t('vatId')}
                    </label>
                    <input
                        type="text"
                        id="vatId"
                        name="vatId"
                        placeholder={t('vatIdPlaceholder')}
                        className="w-full bg-background-secondary border border-border-primary text-text-primary px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                    />
                </div>
                <div>
                    <label htmlFor="huelseType" className="block text-sm font-medium text-text-secondary mb-2">
                        {t('huelseType')}
                    </label>
                    <select
                        id="huelseType"
                        name="huelseType"
                        defaultValue=""
                        className="w-full bg-background-secondary border border-border-primary text-text-primary px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors appearance-none"
                    >
                        <option value="">{t('huelseTypePlaceholder')}</option>
                        {HUELSE_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {tAll(`products.paperConesTubes.huelseTypes.${type}.name`)}
                            </option>
                        ))}
                        <option value="other">{t('other')}</option>
                    </select>
                </div>
            </div>

            {initialOffer && (
                <input type="hidden" name="offerId" value={initialOffer} />
            )}

            <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-secondary mb-2">
                    {t('message')} *
                </label>
                <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="w-full bg-background-secondary border border-border-primary text-text-primary px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                ></textarea>
            </div>

            {/* Honeypot: hidden from real users; bots that fill it are dropped. */}
            <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="website">Leave this field empty</label>
                <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            {/* Bot protection (renders only when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set). */}
            <TurnstileWidget />

            {status === 'error' && (
                <div className="text-red-500 text-sm">{t('error')}</div>
            )}

            <Button
                variant="primary"
                size="lg"
                className="w-full md:w-auto"
                disabled={status === 'submitting'}
            >
                {status === 'submitting' ? t('submitting') : t('submit')}
            </Button>
        </form>
    );
}
