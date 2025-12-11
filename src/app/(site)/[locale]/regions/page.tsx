import { useTranslations } from 'next-intl';
import { FluentEmoji } from '@lobehub/fluent-emoji';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function RegionsPage({ params: { locale } }: { params: { locale: string } }) {
    const t = useTranslations('regions');

    const regions = [
        {
            name: t('items.middleEast.name'),
            description: t('items.middleEast.description'),
            stats: t('items.middleEast.stats')
        },
        {
            name: t('items.europe.name'),
            description: t('items.europe.description'),
            stats: t('items.europe.stats')
        },
        {
            name: t('items.asia.name'),
            description: t('items.asia.description'),
            stats: t('items.asia.stats')
        },
        {
            name: t('items.africa.name'),
            description: t('items.africa.description'),
            stats: t('items.africa.stats')
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
                                { label: t('title'), href: `/${locale}/regions` },
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
                    <FluentEmoji emoji="🌍" type="3d" size={400} />
                </div>
            </Section>

            <Section variant="default">
                <div className="grid grid-cols-1 md://grid-cols-2 gap-8">
                    {regions.map((region, index) => (
                        <Card key={index} hover className="p-8">
                            <h3 className="text-2xl font-bold text-text-primary mb-2">
                                {region.name}
                            </h3>
                            <p className="text-brand-primary font-bold mb-4">{region.stats}</p>
                            <p className="text-text-secondary leading-relaxed">
                                {region.description}
                            </p>
                        </Card>
                    ))}
                </div>
            </Section>

            <Section variant="darker" className="text-center">
                <h2 className="text-3xl font-bold mb-6">{t('cta.title')}</h2>
                <Link href={`/${locale}/contact`}>
                    <Button variant="primary" size="lg">
                        {t('cta.button')}
                    </Button>
                </Link>
            </Section>
        </>
    );
}
