import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { staticAlternates } from '@/lib/seo';
import { ChartNoAxesCombined, Leaf, Newspaper, Truck, type LucideIcon } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { HeroIconFrame, IconFrame, type IconTone } from '@/components/ui/IconFrame';
import { type Locale } from '@/i18n';
import { getLocalizedPath } from '@/routing';
import { getPublishedInsights } from '@/lib/public-data';

// Published CMS insights are read from the DB per request (short revalidate),
// appended after the curated static cards; static-only when no DB rows exist.
export const revalidate = 60;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return {
    title: t('insights.title'),
    description: t('insights.subtitle'),
    alternates: staticAlternates(locale as Locale, '/insights'),
  };
}

export default async function InsightsPage({ params: { locale } }: { params: { locale: string } }) {
    const currentLocale = locale as Locale;
    const t = await getTranslations({ locale, namespace: 'insights' });
    const tNav = await getTranslations({ locale, namespace: 'nav' });
    const dbInsights = await getPublishedInsights(locale);
    const formatDate = (date: string) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(date));

    const insights: Array<{
        icon: LucideIcon;
        tone: IconTone;
        title: string;
        date: string;
        summary: string;
        category: string;
    }> = [
        {
            icon: ChartNoAxesCombined,
            tone: 'sky',
            title: t('items.trends.title'),
            date: formatDate('2024-12-01'),
            summary: t('items.trends.summary'),
            category: t('items.trends.category')
        },
        {
            icon: Leaf,
            tone: 'lime',
            title: t('items.packaging.title'),
            date: formatDate('2024-11-28'),
            summary: t('items.packaging.summary'),
            category: t('items.packaging.category')
        },
        {
            icon: Truck,
            tone: 'amber',
            title: t('items.logistics.title'),
            date: formatDate('2024-11-15'),
            summary: t('items.logistics.summary'),
            category: t('items.logistics.category')
        }
    ];

    return (
        <>
            <Section variant="dark" className="relative overflow-hidden">
                <div className="max-w-4xl relative z-10">
                    <div className="mb-8">
                        <Breadcrumbs
                            items={[
                                { label: tNav('home'), href: getLocalizedPath(currentLocale, '/') },
                                { label: t('title'), href: getLocalizedPath(currentLocale, '/insights') },
                            ]}
                        />
                    </div>
                    <h1 className="text-5xl font-extrabold mb-6">
                        <span className="text-gradient">{t('title')}</span>
                    </h1>
                    <p className="text-xl text-text-secondary max-w-2xl">
                        {t('subtitle')}
                    </p>
                </div>
                <HeroIconFrame icon={Newspaper} tone="sky" />
            </Section>

            <Section variant="default">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {insights.map((item, index) => (
                        <Card key={index} hover className="group relative flex h-full flex-col overflow-hidden">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <div className="mb-6 flex items-center gap-4">
                                <IconFrame icon={item.icon} tone={item.tone} size="md" />
                                <div className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                                    {item.category}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-3">
                                {item.title}
                            </h3>
                            <p className="text-text-secondary mb-6 flex-grow">
                                {item.summary}
                            </p>
                            <div className="text-sm text-text-tertiary">
                                {item.date}
                            </div>
                        </Card>
                    ))}

                    {dbInsights.map((item) => (
                        <Card key={item.slug} hover className="group relative flex h-full flex-col overflow-hidden">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <div className="mb-6 flex items-center gap-4">
                                <IconFrame icon={Newspaper} tone="sky" size="md" />
                                <div className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                                    {item.tags[0] ?? t('title')}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-3">
                                {item.title}
                            </h3>
                            <p className="text-text-secondary mb-6 flex-grow">
                                {item.excerpt}
                            </p>
                            {item.publishedAt && (
                                <div className="text-sm text-text-tertiary">
                                    {formatDate(item.publishedAt)}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </Section>
        </>
    );
}
