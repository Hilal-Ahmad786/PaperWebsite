import { useTranslations } from 'next-intl';
import { FluentEmoji } from '@lobehub/fluent-emoji';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function InsightsPage({ params: { locale } }: { params: { locale: string } }) {
    const t = useTranslations('insights');

    const insights = [
        {
            title: t('items.trends.title'),
            date: 'Dec 1, 2024',
            summary: t('items.trends.summary'),
            category: t('items.trends.category')
        },
        {
            title: t('items.packaging.title'),
            date: 'Nov 28, 2024',
            summary: t('items.packaging.summary'),
            category: t('items.packaging.category')
        },
        {
            title: t('items.logistics.title'),
            date: 'Nov 15, 2024',
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
                                { label: 'Home', href: `/${locale}` },
                                { label: t('title'), href: `/${locale}/insights` },
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
                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                    {/* Using lightning as fallback for lightbulb/trends */}
                    <FluentEmoji emoji="⚡" type="3d" size={400} />
                </div>
            </Section>

            <Section variant="default">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {insights.map((item, index) => (
                        <Card key={index} hover className="flex flex-col h-full">
                            <div className="mb-4 text-xs font-bold text-brand-primary uppercase tracking-wider">
                                {item.category}
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
                </div>
            </Section>
        </>
    );
}
