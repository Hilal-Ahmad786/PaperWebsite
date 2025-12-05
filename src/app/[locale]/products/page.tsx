'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { products } from '@/content/products';
import { cn } from '@/lib/utils';

export default function ProductsPage({ params: { locale } }: { params: { locale: string } }) {
    const t = useTranslations();
    const [activeCategory, setActiveCategory] = useState<'all' | 'board' | 'containerboard'>('all');

    const filteredProducts = activeCategory === 'all'
        ? products
        : products.filter(p => p.category === activeCategory);

    return (
        <>
            <Section variant="dark" className="py-20">
                <div className="text-center max-w-4xl mx-auto">
                    <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 text-gradient">
                        {t('products.title')}
                    </h1>
                    <p className="text-xl text-text-secondary">
                        {t('products.subtitle')}
                    </p>
                </div>
            </Section>

            <Section variant="default">
                {/* Filter Buttons */}
                <div className="flex justify-center gap-4 mb-16 flex-wrap">
                    <Button
                        variant={activeCategory === 'all' ? 'primary' : 'secondary'}
                        onClick={() => setActiveCategory('all')}
                    >
                        {t('stockOffers.filters.all')}
                    </Button>
                    <Button
                        variant={activeCategory === 'board' ? 'primary' : 'secondary'}
                        onClick={() => setActiveCategory('board')}
                    >
                        Board
                    </Button>
                    <Button
                        variant={activeCategory === 'containerboard' ? 'primary' : 'secondary'}
                        onClick={() => setActiveCategory('containerboard')}
                    >
                        Containerboard
                    </Button>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map((product) => (
                        <Link key={product.slug} href={`/${locale}/products/${product.slug}`}>
                            <Card hover className="h-full flex flex-col">
                                <div className="w-16 h-16 bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-3xl mb-6 rounded-sm">
                                    📦
                                </div>

                                <div className="mb-auto">
                                    <div className="text-xs uppercase tracking-wider text-brand-primary font-bold mb-2">
                                        {product.category}
                                    </div>
                                    <h3 className="text-2xl font-bold text-text-primary mb-3">
                                        {t(`${product.i18nKey}.name`)}
                                    </h3>
                                    <p className="text-text-secondary mb-6 leading-relaxed">
                                        {t(`${product.i18nKey}.short`)}
                                    </p>
                                </div>

                                <div className="space-y-4 mt-6 pt-6 border-t border-border-secondary">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-text-tertiary text-xs mb-1">{t('specs.gsmRange')}</div>
                                            <div className="font-mono text-text-primary">
                                                {product.specTable.find(s => s.labelKey === 'specs.gsmRange')?.value}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-text-tertiary text-xs mb-1">{t('specs.origin')}</div>
                                            <div className="font-mono text-text-primary">
                                                {product.origins.slice(0, 2).join(', ')}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-brand-primary text-sm font-bold flex items-center group-hover:translate-x-2 transition-transform">
                                        {t('common.learnMore')} →
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </Section>
        </>
    );
}
