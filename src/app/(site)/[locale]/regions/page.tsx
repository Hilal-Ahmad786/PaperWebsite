import { useTranslations } from 'next-intl';
import { Building2, Globe, MapPin, Route, Ship, type LucideIcon } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { HeroIconFrame, IconFrame, type IconTone } from '@/components/ui/IconFrame';
import { type Locale } from '@/i18n';
import { getLocalizedPath } from '@/routing';

export default function RegionsPage({ params: { locale } }: { params: { locale: string } }) {
    const currentLocale = locale as Locale;
    const t = useTranslations('regions');
    const tNav = useTranslations('nav');

    const regions: Array<{
        icon: LucideIcon;
        tone: IconTone;
        name: string;
        description: string;
        stats: string;
    }> = [
        {
            icon: MapPin,
            tone: 'amber',
            name: t('items.middleEast.name'),
            description: t('items.middleEast.description'),
            stats: t('items.middleEast.stats')
        },
        {
            icon: Building2,
            tone: 'sky',
            name: t('items.europe.name'),
            description: t('items.europe.description'),
            stats: t('items.europe.stats')
        },
        {
            icon: Ship,
            tone: 'emerald',
            name: t('items.asia.name'),
            description: t('items.asia.description'),
            stats: t('items.asia.stats')
        },
        {
            icon: Route,
            tone: 'teal',
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
                                { label: tNav('home'), href: getLocalizedPath(currentLocale, '/') },
                                { label: t('title'), href: getLocalizedPath(currentLocale, '/regions') },
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
                <HeroIconFrame icon={Globe} tone="sky" />
            </Section>

            <Section variant="default">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {regions.map((region, index) => (
                        <Card key={index} hover className="group relative overflow-hidden p-8">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <div className="mb-6 flex items-center gap-4">
                                <IconFrame icon={region.icon} tone={region.tone} size="lg" />
                                <div>
                                    <h3 className="text-2xl font-bold text-text-primary mb-2">
                                        {region.name}
                                    </h3>
                                    <p className="text-brand-primary font-bold">{region.stats}</p>
                                </div>
                            </div>
                            <p className="text-text-secondary leading-relaxed">
                                {region.description}
                            </p>
                        </Card>
                    ))}
                </div>
            </Section>

            <Section variant="darker" className="text-center">
                <h2 className="text-3xl font-bold mb-6">{t('cta.title')}</h2>
                <Link href={getLocalizedPath(currentLocale, '/contact')}>
                    <Button variant="primary" size="lg">
                        {t('cta.button')}
                    </Button>
                </Link>
            </Section>
        </>
    );
}
