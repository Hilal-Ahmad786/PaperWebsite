import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { staticAlternates } from '@/lib/seo';
import Link from 'next/link';
import {
  ArrowRight,
  Boxes,
  Container,
  Cylinder,
  Factory,
  FileCheck2,
  Handshake,
  Languages,
  Network,
  Package,
  PackageCheck,
  PanelsTopLeft,
  TimerReset,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { products } from '@/content/products';
import { HomeProductFinder } from '@/components/home/HomeProductFinder';
import { IconFrame, type IconTone } from '@/components/ui/IconFrame';
import { HeroVisual } from '@/components/ui/HeroVisual';
import { type Locale } from '@/i18n';
import { getLocalizedPath, getLocalizedProductPath } from '@/routing';

const productIconMap: Record<string, { icon: LucideIcon; tone: IconTone }> = {
  'duplex-board': { icon: PanelsTopLeft, tone: 'sky' },
  'testliner-fluting': { icon: Container, tone: 'emerald' },
  'kraftliner-white-top': { icon: Factory, tone: 'amber' },
  'triplex-board': { icon: Boxes, tone: 'teal' },
  'paper-cones-tubes': { icon: Cylinder, tone: 'rose' },
};

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return {
    alternates: staticAlternates(locale as Locale, '/'),
  };
}

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const currentLocale = locale as Locale;
  const t = useTranslations();
  const whyUsItems: Array<{
    icon: LucideIcon;
    title: string;
    desc: string;
    tone: IconTone;
  }> = [
    {
      icon: Languages,
      title: t('home.whyUs.multilingual'),
      desc: t('home.whyUs.multilingualDesc'),
      tone: 'emerald',
    },
    {
      icon: Handshake,
      title: t('home.whyUs.boutique'),
      desc: t('home.whyUs.boutiqueDesc'),
      tone: 'lime',
    },
    {
      icon: Network,
      title: t('home.whyUs.network'),
      desc: t('home.whyUs.networkDesc'),
      tone: 'sky',
    },
    {
      icon: PackageCheck,
      title: t('home.whyUs.flexible'),
      desc: t('home.whyUs.flexibleDesc'),
      tone: 'amber',
    },
    {
      icon: FileCheck2,
      title: t('home.whyUs.documentation'),
      desc: t('home.whyUs.documentationDesc'),
      tone: 'teal',
    },
    {
      icon: TimerReset,
      title: t('home.whyUs.fastResponse'),
      desc: t('home.whyUs.fastResponseDesc'),
      tone: 'rose',
    },
  ];


  return (

    <>
      {/* Hero Section */}
      <Section variant="dark" className="relative overflow-hidden pt-10 lg:pt-16">
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(71, 85, 105, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(71, 85, 105, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-primary/20 blur-3xl animate-glow-pulse" />
        <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-brand-secondary/10 blur-3xl animate-float-slow" />

        {/* Border Top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent" />

        {/* Animated business visual (desktop) */}
        <HeroVisual />

        <div className="relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-up">
              <span className="text-gradient">
                {t('home.hero.title')}
              </span>
              <br />
              <span className="text-brand-primary">
                {t('home.hero.titleHighlight')}
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-text-secondary mb-10 max-w-3xl leading-relaxed animate-fade-up [animation-delay:150ms]">
              {t('home.hero.subtitle')}
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-up [animation-delay:300ms]">
              <Link href={getLocalizedPath(currentLocale, '/contact')}>
                <Button variant="primary" size="lg">
                  {t('home.hero.cta1')}
                </Button>
              </Link>
              <Link href={getLocalizedPath(currentLocale, '/products')}>
                <Button variant="secondary" size="lg">
                  {t('home.hero.cta2')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Stats Band (under the hero) */}
      <Section variant="dark" className="!py-12 border-t border-border-primary/60">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { value: '500+', label: t('home.stats.suppliers') },
            { value: '23', label: t('home.stats.countries') },
            { value: '50K+', label: t('home.stats.volume') },
            { value: '24/7', label: t('home.stats.uptime') },
          ].map((stat, index) => (
            <Card key={index} hover className="text-center">
              <div className="text-4xl lg:text-5xl font-extrabold text-brand-primary font-mono mb-2">
                {stat.value}
              </div>
              <div className="text-xs uppercase tracking-wider text-text-tertiary font-semibold">
                {stat.label}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Product Finder Section */}
      <Section variant="default" className="py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
            {t('home.productFinder.title')}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t('home.productFinder.subtitle')}
          </p>
        </div>
        <HomeProductFinder products={products} />
      </Section>

      {/* Products Section */}
      <Section variant="default">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-text-primary mb-4">
            {t('home.products.title')}
          </h2>
          <p className="text-lg text-text-secondary">
            {t('home.products.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 3).map((product) => {
            const productIcon = productIconMap[product.slug] ?? { icon: Package, tone: 'emerald' as IconTone };

            return (
              <Link key={product.slug} href={getLocalizedProductPath(currentLocale, product.slug)}>
                <Card hover className="group h-full">
                  <div className="mb-6 flex items-center gap-4">
                    <IconFrame icon={productIcon.icon} tone={productIcon.tone} size="lg" />
                    <div className="h-px flex-1 bg-gradient-to-r from-brand-primary/45 to-transparent" />
                  </div>

                  <h3 className="text-2xl font-bold text-text-primary mb-3">
                    {t(`${product.i18nKey}.name`)}
                  </h3>

                  <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                    {t(`${product.i18nKey}.short`)}
                  </p>

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-4 font-mono text-xs">
                    {product.specTable.slice(0, 3).map((spec, index) => (
                      <div key={index}>
                        <div className="text-text-tertiary mb-1">
                          {t(spec.labelKey)}
                        </div>
                        <div className="text-brand-primary font-semibold">
                          {spec.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link href={getLocalizedPath(currentLocale, '/products')}>
            <Button variant="secondary" size="lg">
              {t('common.viewProducts')}
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </Section>

      {/* Why Us Section */}
      <Section variant="default">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-text-primary mb-4">
            {t('home.whyUs.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {whyUsItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <Card
                key={index}
                hover
                className="group relative overflow-hidden text-left"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="mb-6 flex items-center gap-4">
                  <IconFrame icon={Icon} tone={item.tone} />
                  <div className="h-px flex-1 bg-gradient-to-r from-brand-primary/45 to-transparent" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-text-primary">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {item.desc}
                </p>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* CTA Section */}
      <Section variant="darker" className="text-center">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-text-primary mb-6">
          {t('home.finalCta.title')}
        </h2>
        <p className="text-lg text-text-secondary mb-10 max-w-2xl mx-auto">
          {t('home.finalCta.subtitle')}
        </p>
        <Link href={getLocalizedPath(currentLocale, '/contact')}>
          <Button variant="primary" size="lg">
            {t('common.getQuote')}
            <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
          </Button>
        </Link>
      </Section>
    </>
  );
}
