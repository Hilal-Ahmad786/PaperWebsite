'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Product } from '@/types';
import { Calculator, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuoteRequest {
    productSlug: string;
    gsm: string;
    quantity: number;
    port: string;
    incoterm: string;
}

interface QuoteCalculatorProps {
    products: Product[];
    onSubmit: (data: QuoteRequest) => void;
}

export function QuoteCalculator({ products, onSubmit }: QuoteCalculatorProps) {
    const t = useTranslations();
    const [loading, setLoading] = useState(false);
    const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

    const [formData, setFormData] = useState<QuoteRequest>({
        productSlug: '',
        gsm: '',
        quantity: 20, // Minimum container load
        port: '',
        incoterm: 'CIF'
    });

    // Mock calculation logic
    useEffect(() => {
        if (formData.productSlug && formData.quantity > 0) {
            // Base price simulation
            const basePrice = 850; // $850/ton average
            const quantityMultiplier = formData.quantity >= 100 ? 0.95 : 1;
            const total = basePrice * formData.quantity * quantityMultiplier;

            setEstimatedPrice(Math.round(total));
        } else {
            setEstimatedPrice(null);
        }
    }, [formData.productSlug, formData.quantity]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            onSubmit(formData);
        }, 1500);
    };

    const selectedProduct = products.find(p => p.slug === formData.productSlug);

    return (
        <Card className="bg-background-secondary border-border-primary p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <Calculator className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-text-primary">
                        {t('calculator.title')}
                    </h3>
                    <p className="text-sm text-text-secondary">
                        {t('calculator.subtitle')}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">
                            {t('calculator.product')}
                        </label>
                        <select
                            required
                            className="w-full bg-background-tertiary border border-border-primary rounded-md px-4 py-2.5 text-text-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                            value={formData.productSlug}
                            onChange={(e) => setFormData({ ...formData, productSlug: e.target.value, gsm: '' })}
                        >
                            <option value="">{t('calculator.selectProduct')}</option>
                            {products.map((product) => (
                                <option key={product.slug} value={product.slug}>
                                    {t(product.i18nKey + '.name')}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* GSM Range */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">
                            {t('calculator.gsm')}
                        </label>
                        <select
                            required
                            disabled={!selectedProduct}
                            className="w-full bg-background-tertiary border border-border-primary rounded-md px-4 py-2.5 text-text-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all disabled:opacity-50"
                            value={formData.gsm}
                            onChange={(e) => setFormData({ ...formData, gsm: e.target.value })}
                        >
                            <option value="">{t('calculator.selectGsm')}</option>
                            {selectedProduct?.specTable
                                .find(s => s.labelKey === 'specs.gsmRange')
                                ?.value.split(',')
                                .map((gsm) => (
                                    <option key={gsm} value={gsm.trim()}>
                                        {gsm.trim()}
                                    </option>
                                )) || (
                                    <option value="standard">Standard Range</option>
                                )}
                        </select>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">
                            {t('calculator.quantity')}
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                required
                                min="20"
                                className="w-full bg-background-tertiary border border-border-primary rounded-md px-4 py-2.5 text-text-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all font-mono"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-tertiary">
                                {t('stockOffers.tons')}
                            </span>
                        </div>
                    </div>

                    {/* Port */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">
                            {t('calculator.port')}
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Istanbul, Hamburg"
                            className="w-full bg-background-tertiary border border-border-primary rounded-md px-4 py-2.5 text-text-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                            value={formData.port}
                            onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                        />
                    </div>
                </div>

                {/* Estimate Display */}
                <div className="bg-background-tertiary rounded-lg p-6 border border-border-primary/50">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm text-text-secondary">
                            {t('calculator.estimatedTotal')}
                        </span>
                        <span className="text-2xl font-bold text-brand-primary font-mono">
                            {estimatedPrice ? `$${estimatedPrice.toLocaleString()}` : '---'}
                        </span>
                    </div>
                    <div className="text-xs text-text-tertiary flex justify-between">
                        <span>{t('calculator.basePrice')}</span>
                        <span>{estimatedPrice ? 'Included' : '-'}</span>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-4 h-auto text-lg shadow-lg shadow-brand-primary/20"
                >
                    {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <span className="flex items-center gap-2">
                            {t('calculator.submit')}
                            <ArrowRight className="w-5 h-5" />
                        </span>
                    )}
                </Button>
            </form>
        </Card>
    );
}
