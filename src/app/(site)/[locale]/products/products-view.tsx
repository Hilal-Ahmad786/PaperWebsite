'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Boxes, Container, Cylinder, Factory, Package, PanelsTopLeft, type LucideIcon } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProductComparison } from '@/components/ui/ProductComparison';
import { products } from '@/content/products';
import { ProductCategory } from '@/types';
import { IconFrame, type IconTone } from '@/components/ui/IconFrame';
import { type Locale } from '@/i18n';
import { getLocalizedPath, getLocalizedProductPath } from '@/routing';
import type { ProductOverrideView } from '@/lib/public-data';

const productIconMap: Record<string, { icon: LucideIcon; tone: IconTone }> = {
    'duplex-board': { icon: PanelsTopLeft, tone: 'sky' },
    'testliner-fluting': { icon: Container, tone: 'emerald' },
    'kraftliner-white-top': { icon: Factory, tone: 'amber' },
    'triplex-board': { icon: Boxes, tone: 'teal' },
    'paper-cones-tubes': { icon: Cylinder, tone: 'rose' },
};

export function ProductsView({
    locale,
    overrides,
}: {
    locale: string;
    overrides: Record<string, ProductOverrideView>;
}) {
    const currentLocale = locale as Locale;
    const t = useTranslations();
    const [activeCategory, setActiveCategory] = useState<'all' | ProductCategory>('all');
    const originKey = (origin: string) => origin.toLowerCase().replace(/[^a-z0-9]+/g, '');

    // Apply admin overrides: hide hidden products, then reorder by sortOrder
    // (stable sort keeps the original order for equal/absent values).
    const visibleProducts = products
        .filter((p) => !overrides[p.slug]?.isHidden)
        .slice()
        .sort((a, b) => (overrides[a.slug]?.sortOrder ?? 0) - (overrides[b.slug]?.sortOrder ?? 0));

    const productName = (slug: string, i18nKey: string) => overrides[slug]?.name || t(`${i18nKey}.name`);
    const productShort = (slug: string, i18nKey: string) => overrides[slug]?.summary || t(`${i18nKey}.short`);

    const filteredProducts = activeCategory === 'all'
        ? visibleProducts
        : visibleProducts.filter(p => p.category === activeCategory);

    const categoryFilters: Array<{ id: 'all' | ProductCategory; label: string }> = [
        { id: 'all', label: t('stockOffers.filters.all') },
        { id: 'board', label: t('products.categories.board') },
        { id: 'containerboard', label: t('products.categories.containerboard') },
        { id: 'converted', label: t('products.categories.converted') },
    ];

    return (
        <>
            <Section variant="dark" className="py-20">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="flex justify-center mb-8 animate-fade-in">
                        <Breadcrumbs
                            items={[
                                { label: t('nav.home'), href: getLocalizedPath(currentLocale, '/') },
                                { label: t('products.title'), href: getLocalizedPath(currentLocale, '/products') },
                            ]}
                        />
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 text-gradient animate-fade-up">
                        {t('products.title')}
                    </h1>
                    <p className="text-xl text-text-secondary animate-fade-up [animation-delay:150ms]">
                        {t('products.subtitle')}
                    </p>
                </div>
            </Section>

            <Section variant="default">
                {/* Filter Buttons */}
                <div className="flex justify-center gap-4 mb-16 flex-wrap">
                    {categoryFilters.map((category) => (
                        <Button
                            key={category.id}
                            variant={activeCategory === category.id ? 'primary' : 'secondary'}
                            onClick={() => setActiveCategory(category.id)}
                        >
                            {category.label}
                        </Button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map((product) => {
                        const primarySpec = product.specTable.find(s => s.labelKey === 'specs.gsmRange') ?? product.specTable[0];
                        const productIcon = productIconMap[product.slug] ?? { icon: Package, tone: 'emerald' as IconTone };

                        return (
                            <Link key={product.slug} href={getLocalizedProductPath(currentLocale, product.slug)}>
                                <Card hover className="group h-full flex flex-col overflow-hidden">
                                    {product.heroImage ? (
                                        <div className="relative -mx-8 -mt-8 mb-6 aspect-[4/3] overflow-hidden bg-background-tertiary">
                                            <img
                                                src={product.heroImage.src}
                                                alt={t(product.heroImage.altKey)}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                    ) : (
                                        <div className="mb-6 flex items-center gap-4">
                                            <IconFrame icon={productIcon.icon} tone={productIcon.tone} size="lg" />
                                            <div className="h-px flex-1 bg-gradient-to-r from-brand-primary/45 to-transparent" />
                                        </div>
                                    )}

                                    <div className="mb-auto">
                                        <div className="text-xs uppercase tracking-wider text-brand-primary font-bold mb-2">
                                            {t(`products.categories.${product.category}`)}
                                        </div>
                                        <h3 className="text-2xl font-bold text-text-primary mb-3">
                                            {productName(product.slug, product.i18nKey)}
                                        </h3>
                                        <p className="text-text-secondary mb-6 leading-relaxed">
                                            {productShort(product.slug, product.i18nKey)}
                                        </p>
                                    </div>

                                    <div className="space-y-4 mt-6 pt-6 border-t border-border-secondary">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <div className="text-text-tertiary text-xs mb-1">
                                                    {primarySpec ? t(primarySpec.labelKey) : t('comparison.label.features')}
                                                </div>
                                                <div className="font-mono text-text-primary">
                                                    {primarySpec ? (primarySpec.valueKey ? t(primarySpec.valueKey) : primarySpec.value) : ''}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-text-tertiary text-xs mb-1">{t('specs.origin')}</div>
                                                <div className="font-mono text-text-primary">
                                                    {product.origins.slice(0, 2).map(origin => t(`origins.${originKey(origin)}`)).join(', ')}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-brand-primary text-sm font-bold flex items-center group-hover:translate-x-2 transition-transform">
                                            {t('common.learnMore')}
                                            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>


                {/* Product Comparison */}
                <div className="mt-24">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-text-primary mb-4">
                            {t('comparison.label.features')}
                        </h2>
                        <p className="text-text-secondary">
                            {t('products.subtitle')}
                        </p>
                    </div>
                    <ProductComparison products={visibleProducts} />
                </div>
            </Section >
        </>
    );
}
