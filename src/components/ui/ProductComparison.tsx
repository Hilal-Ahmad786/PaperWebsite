'use client';

import { Product } from '@/types';
import { Card } from '@/components/ui/Card';
import { useTranslations } from 'next-intl';
import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductComparisonProps {
    products: Product[];
    onAddToCart?: (productSlug: string) => void;
}

export function ProductComparison({ products, onAddToCart }: ProductComparisonProps) {
    const t = useTranslations();

    const getPriceLevel = (slug: string) => {
        switch (slug) {
            case 'testliner-fluting':
                return '$';
            case 'duplex-board':
                return '$$';
            case 'kraftliner-white-top':
                return '$$$';
            case 'triplex-board':
                return '$$$';
            default:
                return '$$';
        }
    };

    const getSpecValue = (product: Product, key: string) => {
        const spec = product.specTable.find((s) => s.labelKey === key);
        return spec ? spec.value : '-';
    };

    return (
        <Card className="overflow-hidden p-0 bg-background-secondary border-border-primary">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="p-6 bg-background-tertiary sticky left-0 z-10 min-w-[150px] border-b border-border-primary">
                                <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">
                                    {t('comparison.label.features')}
                                </span>
                            </th>
                            {products.map((product) => (
                                <th
                                    key={product.slug}
                                    className="p-6 bg-background-tertiary min-w-[200px] border-b border-border-primary border-l border-border-primary/50"
                                >
                                    <div className="flex flex-col gap-2">
                                        <span className="text-lg font-bold text-text-primary">
                                            {t(product.i18nKey + '.name')}
                                        </span>
                                        {onAddToCart && (
                                            <button
                                                onClick={() => onAddToCart(product.slug)}
                                                className="text-xs flex items-center justify-center gap-1 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white py-1.5 px-3 rounded transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                                {t('comparison.addToQuote')}
                                            </button>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-primary">
                        {/* GSM Range */}
                        <tr className="hover:bg-white/5 transition-colors">
                            <td className="p-4 text-sm font-medium text-text-secondary sticky left-0 bg-background-secondary z-10">
                                {t('comparison.label.gsm')}
                            </td>
                            {products.map((product) => (
                                <td key={product.slug} className="p-4 text-sm text-text-primary border-l border-border-primary/50">
                                    {getSpecValue(product, 'specs.gsmRange')}
                                </td>
                            ))}
                        </tr>

                        {/* Grades */}
                        <tr className="hover:bg-white/5 transition-colors">
                            <td className="p-4 text-sm font-medium text-text-secondary sticky left-0 bg-background-secondary z-10">
                                {t('comparison.label.grades')}
                            </td>
                            {products.map((product) => (
                                <td key={product.slug} className="p-4 text-sm text-text-primary border-l border-border-primary/50">
                                    {getSpecValue(product, 'specs.grades')}
                                </td>
                            ))}
                        </tr>

                        {/* Origin */}
                        <tr className="hover:bg-white/5 transition-colors">
                            <td className="p-4 text-sm font-medium text-text-secondary sticky left-0 bg-background-secondary z-10">
                                {t('comparison.label.origin')}
                            </td>
                            {products.map((product) => (
                                <td key={product.slug} className="p-4 text-sm text-text-primary border-l border-border-primary/50">
                                    {product.origins.join(', ')}
                                </td>
                            ))}
                        </tr>

                        {/* Price Indicator */}
                        <tr className="hover:bg-white/5 transition-colors">
                            <td className="p-4 text-sm font-medium text-text-secondary sticky left-0 bg-background-secondary z-10">
                                {t('comparison.label.price')}
                            </td>
                            {products.map((product) => (
                                <td key={product.slug} className="p-4 text-sm text-brand-primary font-bold border-l border-border-primary/50">
                                    {getPriceLevel(product.slug)}
                                </td>
                            ))}
                        </tr>

                        {/* Applications */}
                        <tr className="hover:bg-white/5 transition-colors">
                            <td className="p-4 text-sm font-medium text-text-secondary sticky left-0 bg-background-secondary z-10 align-top">
                                {t('comparison.label.applications')}
                            </td>
                            {products.map((product) => (
                                <td key={product.slug} className="p-4 text-sm text-text-primary border-l border-border-primary/50 align-top">
                                    <ul className="space-y-1">
                                        {product.applications.slice(0, 3).map((app) => (
                                            <li key={app} className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                                                <span className="text-xs text-text-secondary">{t(app)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
