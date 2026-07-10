import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowDown, ArrowRight, Check, Factory, Layers, Leaf, Recycle } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { ProductJsonLd } from '@/components/seo/JsonLd';
import { getProductBySlug } from '@/content/products';
import { type Locale } from '@/i18n';
import { getCanonicalProductSlug, getLocalizedPath, getLocalizedProductPath } from '@/routing';
import { SITE_NAME, SITE_URL, ogLocale, productAlternates } from '@/lib/seo';

export async function generateMetadata({
    params: { locale, slug },
}: {
    params: { locale: string; slug: string };
}): Promise<Metadata> {
    const currentLocale = locale as Locale;
    const canonicalSlug = getCanonicalProductSlug(currentLocale, slug);
    const product = getProductBySlug(canonicalSlug);
    if (!product) return {};

    const t = await getTranslations({ locale: currentLocale });
    const name = t(`${product.i18nKey}.name`);
    const title = t.has(`${product.i18nKey}.metaTitle`)
        ? t(`${product.i18nKey}.metaTitle`)
        : `${name} | ${SITE_NAME}`;
    const description = t.has(`${product.i18nKey}.metaDescription`)
        ? t(`${product.i18nKey}.metaDescription`)
        : t(`${product.i18nKey}.short`);
    const alternates = productAlternates(currentLocale, canonicalSlug);
    const image = product.heroImage?.src;

    return {
        title: { absolute: title },
        description,
        alternates,
        openGraph: {
            type: 'website',
            siteName: SITE_NAME,
            title,
            description,
            url: alternates.canonical as string,
            locale: ogLocale(currentLocale),
            images: image ? [`${SITE_URL}${image}`] : undefined,
        },
    };
}

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
            <ProductJsonLd
                name={t(`${product.i18nKey}.name`)}
                description={t(`${product.i18nKey}.description`)}
                image={heroImage?.src ?? (product.images?.[0]?.src ?? '')}
                url={`${SITE_URL}${getLocalizedProductPath(currentLocale, product.slug)}`}
                category={t(`products.categories.${product.category}`)}
            />
            {/* Hero Section */}
            <Section variant="dark" className="relative overflow-hidden pt-12 lg:pt-16 pb-20 lg:pb-28">
                {/* Ambient animated glow */}
                <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-primary/15 blur-3xl animate-glow-pulse" />
                <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-secondary/10 blur-3xl animate-float-slow" />
                <div className={heroImage ? "relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-12 lg:gap-16 items-center" : "relative z-10 max-w-4xl"}>
                    <div>
                        <div className="mb-8 animate-fade-in">
                            <Breadcrumbs
                                items={[
                                    { label: t('nav.home'), href: getLocalizedPath(currentLocale, '/') },
                                    { label: t('products.title'), href: getLocalizedPath(currentLocale, '/products') },
                                    { label: t(`${product.i18nKey}.name`), href: getLocalizedProductPath(currentLocale, product.slug) },
                                ]}
                            />
                        </div>
                        <div className="text-brand-primary font-mono text-sm uppercase tracking-wider mb-4 animate-fade-up">
                            {t(`products.categories.${product.category}`)}
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 text-text-primary animate-fade-up [animation-delay:100ms]">
                            {t(`${product.i18nKey}.name`)}
                        </h1>
                        <p className="text-xl lg:text-2xl text-text-secondary mb-10 leading-relaxed max-w-3xl animate-fade-up [animation-delay:200ms]">
                            {product.subtitleKey ? t(product.subtitleKey) : t(`${product.i18nKey}.description`)}
                        </p>
                        <div className="flex flex-wrap gap-4 animate-fade-up [animation-delay:300ms]">
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
                        <div className="relative mx-auto w-full max-w-[420px] overflow-hidden border border-border-primary bg-white shadow-2xl animate-scale-in [animation-delay:200ms]">
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
                        <h2 className="text-3xl font-bold mb-8 text-text-primary">{t(product.specsHeadingKey ?? 'products.detail.technicalSpecs')}</h2>
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
                            <h2 className="text-3xl font-bold mb-8 text-text-primary">{t(product.applicationsHeadingKey ?? 'products.detail.applications')}</h2>
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

            {/* Hülsentypen für die Textilindustrie */}
            {product.huelseTypes && product.huelseTypes.length > 0 && (
                <Section variant="darker">
                    <div className="max-w-3xl mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-text-primary">
                            {t('products.paperConesTubes.headings.types')}
                        </h2>
                        <p className="text-text-secondary text-lg">
                            {t('products.paperConesTubes.types.intro')}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {product.huelseTypes.map((type) => (
                            <Card key={type.nameKey} className="p-6 h-full">
                                <div className="flex items-center gap-3 mb-3">
                                    <Layers className="h-5 w-5 shrink-0 text-brand-primary" aria-hidden="true" />
                                    <h3 className="text-lg font-bold text-text-primary">{t(type.nameKey)}</h3>
                                </div>
                                <p className="text-text-secondary leading-relaxed">{t(type.descKey)}</p>
                            </Card>
                        ))}
                    </div>
                </Section>
            )}

            {/* Papierhülsen vs. Kunststoffhülsen */}
            {product.comparison && (
                <Section variant="default">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-text-primary">
                                {t('products.paperConesTubes.headings.comparison')}
                            </h2>
                            <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                                {t(product.comparison.introKey)}
                            </p>
                            <ul className="space-y-4">
                                {product.comparison.pointKeys.map((pointKey) => (
                                    <li key={pointKey} className="flex items-start gap-3">
                                        <Check className="h-5 w-5 shrink-0 mt-0.5 text-brand-primary" aria-hidden="true" />
                                        <span className="text-text-primary">{t(pointKey)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Card className="p-8 h-full">
                            <div className="flex items-center gap-3 mb-4">
                                <Recycle className="h-6 w-6 shrink-0 text-brand-primary" aria-hidden="true" />
                                <h4 className="text-xl font-bold text-text-primary">
                                    {t(product.comparison.sustainabilityHeadingKey)}
                                </h4>
                            </div>
                            <p className="text-text-secondary leading-relaxed mb-6">
                                {t(product.comparison.sustainabilityBodyKey)}
                            </p>
                            <Link
                                href={getLocalizedPath(currentLocale, '/sustainability')}
                                className="inline-flex items-center gap-2 text-brand-primary font-semibold hover:gap-3 transition-all"
                            >
                                <Leaf className="h-4 w-4" aria-hidden="true" />
                                {t(product.comparison.sustainabilityLinkLabelKey)}
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                        </Card>
                    </div>
                </Section>
            )}

            {/* Bedruckte & individuelle Hülsen nach Maß */}
            {product.customSectionKey && (
                <Section variant="darker">
                    <div className="max-w-3xl">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-text-primary">
                            {t('products.paperConesTubes.headings.custom')}
                        </h2>
                        <p className="text-text-secondary text-lg leading-relaxed">
                            {t(product.customSectionKey)}
                        </p>
                    </div>
                </Section>
            )}

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
                {product.b2bNoteKey && (
                    <p className="mt-6 text-sm text-text-tertiary">{t(product.b2bNoteKey)}</p>
                )}
            </Section>
        </>
    );
}
