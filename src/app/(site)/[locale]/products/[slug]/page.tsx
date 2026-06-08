import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowDown, Check, Factory } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { getProductBySlug } from '@/content/products';
import { type Locale } from '@/i18n';
import { getCanonicalProductSlug, getLocalizedPath, getLocalizedProductPath } from '@/routing';

export default function ProductPage({ params: { locale, slug } }: { params: { locale: string; slug: string } }) {
    const currentLocale = locale as Locale;
    const canonicalSlug = getCanonicalProductSlug(currentLocale, slug);
    const product = getProductBySlug(canonicalSlug);
    const t = useTranslations();

    if (!product) {
        notFound();
    }

    const heroImage = product.heroImage;
    const galleryImages = product.images?.map((image) => ({
        src: image.src,
        alt: t(image.altKey),
        caption: image.captionKey ? t(image.captionKey) : undefined,
    })) ?? [];
    const originKey = (origin: string) => origin.toLowerCase().replace(/[^a-z0-9]+/g, '');

    return (
        <>
            {/* Hero Section */}
            <Section variant="dark" className="py-20 lg:py-32">
                <div className={heroImage ? "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-12 lg:gap-16 items-center" : "max-w-4xl"}>
                    <div>
                        <div className="mb-8">
                            <Breadcrumbs
                                items={[
                                    { label: t('nav.home'), href: getLocalizedPath(currentLocale, '/') },
                                    { label: t('products.title'), href: getLocalizedPath(currentLocale, '/products') },
                                    { label: t(`${product.i18nKey}.name`), href: getLocalizedProductPath(currentLocale, product.slug) },
                                ]}
                            />
                        </div>
                        <div className="text-brand-primary font-mono text-sm uppercase tracking-wider mb-4">
                            {t(`products.categories.${product.category}`)}
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 text-text-primary">
                            {t(`${product.i18nKey}.name`)}
                        </h1>
                        <p className="text-xl lg:text-2xl text-text-secondary mb-10 leading-relaxed max-w-3xl">
                            {t(`${product.i18nKey}.description`)}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href={getLocalizedPath(currentLocale, '/contact', undefined, { product: product.slug })}>
                                <Button variant="primary" size="lg">
                                    {t('common.getQuote')}
                                </Button>
                            </Link>
                            <Link href="#specs">
                                <Button variant="secondary" size="lg">
                                    {t('products.detail.specsAnchor')}
                                    <ArrowDown className="ml-2 h-5 w-5" aria-hidden="true" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                    {heroImage && (
                        <div className="relative mx-auto w-full max-w-[420px] overflow-hidden border border-border-primary bg-white shadow-2xl">
                            <img
                                src={heroImage.src}
                                alt={t(heroImage.altKey)}
                                className="aspect-[3/4] h-full w-full object-contain"
                            />
                        </div>
                    )}
                </div>
            </Section>

            {/* Specifications Section */}
            <Section variant="default" id="specs">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    <div>
                        <h2 className="text-3xl font-bold mb-8 text-text-primary">{t('products.detail.technicalSpecs')}</h2>
                        <Card className="p-0 overflow-hidden">
                            <div className="divide-y divide-border-secondary">
                                {product.specTable.map((spec, index) => (
                                    <div key={index} className="flex justify-between p-4 hover:bg-background-tertiary transition-colors">
                                        <span className="text-text-secondary">{t(spec.labelKey)}</span>
                                        <span className="font-mono text-text-primary font-semibold text-right">
                                            {spec.valueKey ? t(spec.valueKey) : spec.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <div className="mt-8">
                            <h3 className="text-xl font-bold mb-4 text-text-primary">{t('products.detail.origins')}</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.origins.map((origin) => (
                                    <span key={origin} className="px-3 py-1 bg-background-secondary border border-border-primary rounded-full text-sm text-text-secondary">
                                        {t(`origins.${originKey(origin)}`)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-12">
                        {/* Applications */}
                        <div>
                            <h2 className="text-3xl font-bold mb-8 text-text-primary">{t('products.detail.applications')}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {product.applications.map((app) => (
                                    <div key={app} className="flex items-center gap-3 p-4 bg-background-secondary border border-border-secondary rounded-sm">
                                        <Check className="h-4 w-4 shrink-0 text-brand-primary" aria-hidden="true" />
                                        <span className="text-text-primary">{t(app)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Industries */}
                        <div>
                            <h2 className="text-3xl font-bold mb-8 text-text-primary">{t('products.detail.typicalIndustries')}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {product.typicalIndustries.map((ind) => (
                                    <div key={ind} className="flex items-center gap-3 p-4 bg-background-secondary border border-border-secondary rounded-sm">
                                        <Factory className="h-4 w-4 shrink-0 text-brand-primary" aria-hidden="true" />
                                        <span className="text-text-primary">{t(ind)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {galleryImages.length > 0 && (
                <Section variant="darker">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-text-primary">
                            {t('products.gallery.title')}
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            {t('products.gallery.subtitle')}
                        </p>
                    </div>
                    <ImageGallery images={galleryImages} columns={3} />
                </Section>
            )}

            {/* CTA Section */}
            <Section variant="darker" className="text-center">
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-text-primary">
                    {t('products.detail.ctaTitle', { product: t(`${product.i18nKey}.name`) })}
                </h2>
                <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
                    {t('products.detail.ctaSubtitle')}
                </p>
                <Link href={getLocalizedPath(currentLocale, '/contact', undefined, { product: product.slug })}>
                    <Button variant="primary" size="lg">
                        {t('products.detail.ctaButton', { product: t(`${product.i18nKey}.name`) })}
                    </Button>
                </Link>
            </Section>
        </>
    );
}
