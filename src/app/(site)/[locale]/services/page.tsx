import { useTranslations } from 'next-intl';
import { BadgeDollarSign, Factory, FileCheck2, PackageSearch, Ship, type LucideIcon } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { HeroIconFrame, IconFrame, type IconTone } from '@/components/ui/IconFrame';
import { type Locale } from '@/i18n';
import { getLocalizedPath } from '@/routing';

export default function ServicesPage({ params: { locale } }: { params: { locale: string } }) {
    const currentLocale = locale as Locale;
    const t = useTranslations('services');
    const tNav = useTranslations('nav');

    const services: Array<{
        icon: LucideIcon;
        tone: IconTone;
        title: string;
        description: string;
    }> = [
        {
            icon: PackageSearch,
            tone: 'emerald',
            title: t('items.sourcing.title'),
            description: t('items.sourcing.description'),
        },
        {
            icon: Ship,
            tone: 'sky',
            title: t('items.logistics.title'),
            description: t('items.logistics.description'),
        },
        {
            icon: BadgeDollarSign,
            tone: 'amber',
            title: t('items.financing.title'),
            description: t('items.financing.description'),
        },
        {
            icon: FileCheck2,
            tone: 'teal',
            title: t('items.documentation.title'),
            description: t('items.documentation.description'),
        },
    ];

    return (
        <>
            <Section variant="dark" className="relative overflow-hidden">
                <div className="max-w-4xl relative z-10">
                    <div className="mb-8">
                        <Breadcrumbs
                            items={[
                                { label: tNav('home'), href: getLocalizedPath(currentLocale, '/') },
                                { label: t('title'), href: getLocalizedPath(currentLocale, '/services') },
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
                <HeroIconFrame icon={Factory} tone="sky" />
            </Section>

            <Section variant="default">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {services.map((service, index) => (
                        <Card key={index} hover className="group relative flex flex-col items-start overflow-hidden p-8">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <div className="mb-6 flex w-full items-center gap-4">
                                <IconFrame icon={service.icon} tone={service.tone} size="lg" />
                                <div className="h-px flex-1 bg-gradient-to-r from-brand-primary/45 to-transparent" />
                            </div>
                            <h3 className="text-2xl font-bold text-text-primary mb-4">
                                {service.title}
                            </h3>
                            <p className="text-text-secondary leading-relaxed">
                                {service.description}
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
