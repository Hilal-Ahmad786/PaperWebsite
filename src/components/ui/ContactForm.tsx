'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { products } from '@/content/products';

export function ContactForm() {
    const t = useTranslations('contact.form');
    const searchParams = useSearchParams();
    const initialProduct = searchParams.get('product') || '';
    const initialOffer = searchParams.get('offer') || '';

    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus('submitting');

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to send');

            setStatus('success');
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
                    Send Another Message
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
                                {p.slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                            </option>
                        ))}
                        <option value="other">Other</option>
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
                        placeholder="e.g. 100"
                        className="w-full bg-background-secondary border border-border-primary text-text-primary px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                    />
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
