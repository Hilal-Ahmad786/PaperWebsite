'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { stockOffers } from '@/content/offers';
import { products } from '@/content/products';

export default function StockOffersPage({ params: { locale } }: { params: { locale: string } }) {
    const t = useTranslations('stockOffers');

    const [filters, setFilters] = useState({
        product: '',
        origin: '',
        type: ''
    });

    // Get unique values for filters
    const origins = Array.from(new Set(stockOffers.map(o => o.originCountry)));
    const types = Array.from(new Set(stockOffers.map(o => o.type)));

    const filteredOffers = stockOffers.filter(offer => {
        if (filters.product && offer.productSlug !== filters.product) return false;
        if (filters.origin && offer.originCountry !== filters.origin) return false;
        if (filters.type && offer.type !== filters.type) return false;
        return true;
    });

    const clearFilters = () => setFilters({ product: '', origin: '', type: '' });

    return (
        <>
            <Section variant="dark" className="py-20">
                <div className="text-center max-w-4xl mx-auto">
                    <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 text-gradient">
                        {t('title')}
                    </h1>
                    <p className="text-xl text-text-secondary">
                        {t('subtitle')}
                    </p>
                </div>
            </Section>

            <Section variant="default">
                {/* Filters */}
                <div className="mb-12 p-6 bg-background-secondary border border-border-primary rounded-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                {t('filters.byProduct')}
                            </label>
                            <select
                                value={filters.product}
                                onChange={(e) => setFilters({ ...filters, product: e.target.value })}
                                className="w-full bg-background-primary border border-border-primary text-text-primary px-3 py-2 focus:outline-none focus:border-brand-primary"
                            >
                                <option value="">{t('filters.all')}</option>
                                {products.map(p => (
                                    <option key={p.slug} value={p.slug}>
                                        {p.slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                {t('filters.byOrigin')}
                            </label>
                            <select
                                value={filters.origin}
                                onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
                                className="w-full bg-background-primary border border-border-primary text-text-primary px-3 py-2 focus:outline-none focus:border-brand-primary"
                            >
                                <option value="">All Origins</option>
                                {origins.map(origin => (
                                    <option key={origin} value={origin}>{origin}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Type
                            </label>
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                className="w-full bg-background-primary border border-border-primary text-text-primary px-3 py-2 focus:outline-none focus:border-brand-primary"
                            >
                                <option value="">All Types</option>
                                {types.map(type => (
                                    <option key={type} value={type}>{type.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Offers Grid */}
                {filteredOffers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOffers.map((offer) => (
                            <Card key={offer.id} hover>
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="text-xs uppercase tracking-wider text-text-tertiary mb-1">
                                            {offer.type}
                                        </div>
                                        <h3 className="text-xl font-bold text-text-primary">
                                            {offer.gradeName}
                                        </h3>
                                    </div>
                                    <div className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-xs font-bold">
                                        {offer.quantityTons}T
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm mb-6">
                                    <div className="flex justify-between border-b border-border-secondary pb-2">
                                        <span className="text-text-tertiary">{t('table.gsm')}</span>
                                        <span className="text-text-primary font-mono">{offer.gsmRange}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border-secondary pb-2">
                                        <span className="text-text-tertiary">{t('table.origin')}</span>
                                        <span className="text-text-primary">{offer.originCountry}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border-secondary pb-2">
                                        <span className="text-text-tertiary">{t('table.port')}</span>
                                        <span className="text-text-primary">{offer.port}</span>
                                    </div>
                                    <div className="flex justify-between pb-2">
                                        <span className="text-text-tertiary">{t('table.availability')}</span>
                                        <span className="text-brand-primary font-semibold">{offer.availability}</span>
                                    </div>
                                </div>

                                <Link href={`/${locale}/contact?offer=${offer.id}`}>
                                    <Button variant="primary" className="w-full">
                                        {t('requestOffer')}
                                    </Button>
                                </Link>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-text-secondary">
                        No offers found matching your filters.
                        <br />
                        <button
                            onClick={clearFilters}
                            className="text-brand-primary underline mt-2 hover:text-brand-secondary"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </Section>
        </>
    );
}
