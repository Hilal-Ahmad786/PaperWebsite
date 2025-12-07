import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { FluentEmoji } from '@lobehub/fluent-emoji';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { products } from '@/content/products';
import { stockOffers } from '@/content/offers';

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations();


  return (

    <>
      {/* Hero Section */}
      <Section variant="dark" className="relative overflow-hidden">
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

        {/* Border Top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent" />

        <div className="relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
              <span className="text-gradient">
                {t('home.hero.title')}
              </span>
              <br />
              <span className="text-brand-primary">
                {t('home.hero.titleHighlight')}
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-text-secondary mb-10 max-w-3xl leading-relaxed">
              {t('home.hero.subtitle')}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href={`/${locale}/contact`}>
                <Button variant="primary" size="lg">
                  {t('home.hero.cta1')}
                </Button>
              </Link>
              <Link href={`/${locale}/products`}>
                <Button variant="secondary" size="lg">
                  {t('home.hero.cta2')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
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
        </div>
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
          {products.slice(0, 3).map((product) => (
            <Link key={product.slug} href={`/${locale}/products/${product.slug}`}>
              <Card hover className="h-full">
                {/* Product Icon */}
                <div className="w-20 h-20 relative mb-6 flex items-center justify-center">
                  <FluentEmoji emoji="📦" type="3d" size={80} />
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
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href={`/${locale}/products`}>
            <Button variant="secondary" size="lg">
              {t('common.viewProducts')} →
            </Button>
          </Link>
        </div>
      </Section>

      {/* Stock Offers Preview */}
      <Section variant="dark">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-text-primary mb-4">
            Current Stock & Offers
          </h2>
          <p className="text-lg text-text-secondary">
            Limited availability on these grades
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stockOffers.slice(0, 3).map((offer) => (
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

              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-text-tertiary">GSM:</span>
                  <span className="text-text-primary font-semibold font-mono">
                    {offer.gsmRange}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Origin:</span>
                  <span className="text-text-primary font-semibold">
                    {offer.originCountry}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Port:</span>
                  <span className="text-text-primary font-semibold">
                    {offer.port}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Status:</span>
                  <span className="text-brand-primary font-semibold">
                    {offer.availability}
                  </span>
                </div>
              </div>

              <Link href={`/${locale}/contact?offer=${offer.id}`}>
                <Button variant="secondary" className="w-full" size="sm">
                  Request This Offer
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href={`/${locale}/stock-offers`}>
            <Button variant="primary" size="lg">
              View All Offers →
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
          {[
            {
              emoji: '🌍',
              title: t('home.whyUs.multilingual'),
              desc: t('home.whyUs.multilingualDesc'),
            },
            {
              emoji: '🤝',
              title: t('home.whyUs.boutique'),
              desc: t('home.whyUs.boutiqueDesc'),
            },
            {
              emoji: '🏭',
              title: t('home.whyUs.network'),
              desc: t('home.whyUs.networkDesc'),
            },
            {
              emoji: '📦',
              title: t('home.whyUs.flexible'),
              desc: t('home.whyUs.flexibleDesc'),
            },
            {
              emoji: '📄',
              title: t('home.whyUs.documentation'),
              desc: t('home.whyUs.documentationDesc'),
            },
            {
              emoji: '⚡',
              title: t('home.whyUs.fastResponse'),
              desc: t('home.whyUs.fastResponseDesc'),
            },
          ].map((item, index) => (
            <Card key={index} className="text-center flex flex-col items-center">
              <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                <FluentEmoji emoji={item.emoji} type="3d" size={64} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-text-secondary">{item.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section variant="darker" className="text-center">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-text-primary mb-6">
          Ready to Source Your Next Container?
        </h2>
        <p className="text-lg text-text-secondary mb-10 max-w-2xl mx-auto">
          Send us your requirements. We'll respond with options, pricing, and lead times within 24 hours.
        </p>
        <Link href={`/${locale}/contact`}>
          <Button variant="primary" size="lg">
            {t('common.getQuote')} →
          </Button>
        </Link>
      </Section>
    </>
  );
}
