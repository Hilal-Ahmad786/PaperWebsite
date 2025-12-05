import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getProductBySlug } from '@/content/products';

export default function ProductPage({ params: { locale, slug } }: { params: { locale: string; slug: string } }) {
    const product = getProductBySlug(slug);
    const t = useTranslations();

    if (!product) {
        notFound();
    }

    return (
        <>
            {/* Hero Section */}
            <Section variant="dark" className="py-20 lg:py-32">
                <div className="max-w-4xl">
                    <div className="text-brand-primary font-mono text-sm uppercase tracking-wider mb-4">
                        {product.category}
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 text-text-primary">
                        {t(`${product.i18nKey}.name`)}
                    </h1>
                    <p className="text-xl lg:text-2xl text-text-secondary mb-10 leading-relaxed max-w-3xl">
                        {t(`${product.i18nKey}.description`)}
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link href={`/${locale}/contact?product=${product.slug}`}>
                            <Button variant="primary" size="lg">
                                {t('common.getQuote')}
                            </Button>
                        </Link>
                        <Link href="#specs">
                            <Button variant="secondary" size="lg">
                                {t('specs.grades')} ↓
                            </Button>
                        </Link>
                    </div>
                </div>
            </Section>

            {/* Specifications Section */}
            <Section variant="default" id="specs">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    <div>
                        <h2 className="text-3xl font-bold mb-8 text-text-primary">Technical Specifications</h2>
                        <Card className="p-0 overflow-hidden">
                            <div className="divide-y divide-border-secondary">
                                {product.specTable.map((spec, index) => (
                                    <div key={index} className="flex justify-between p-4 hover:bg-background-tertiary transition-colors">
                                        <span className="text-text-secondary">{t(spec.labelKey)}</span>
                                        <span className="font-mono text-text-primary font-semibold text-right">{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <div className="mt-8">
                            <h3 className="text-xl font-bold mb-4 text-text-primary">Origins</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.origins.map((origin) => (
                                    <span key={origin} className="px-3 py-1 bg-background-secondary border border-border-primary rounded-full text-sm text-text-secondary">
                                        {origin}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-12">
                        {/* Applications */}
                        <div>
                            <h2 className="text-3xl font-bold mb-8 text-text-primary">Applications</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {product.applications.map((app) => (
                                    <div key={app} className="flex items-center gap-3 p-4 bg-background-secondary border border-border-secondary rounded-sm">
                                        <span className="text-brand-primary">✓</span>
                                        <span className="text-text-primary">{t(app)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Industries */}
                        <div>
                            <h2 className="text-3xl font-bold mb-8 text-text-primary">Typical Industries</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {product.typicalIndustries.map((ind) => (
                                    <div key={ind} className="flex items-center gap-3 p-4 bg-background-secondary border border-border-secondary rounded-sm">
                                        <span className="text-brand-primary">🏭</span>
                                        <span className="text-text-primary">{t(ind)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* CTA Section */}
            <Section variant="darker" className="text-center">
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-text-primary">
                    Need {t(`${product.i18nKey}.name`)}?
                </h2>
                <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
                    We can source this grade from multiple origins to match your specific requirements and budget.
                </p>
                <Link href={`/${locale}/contact?product=${product.slug}`}>
                    <Button variant="primary" size="lg">
                        Request a Quote for {t(`${product.i18nKey}.name`)}
                    </Button>
                </Link>
            </Section>
        </>
    );
}
