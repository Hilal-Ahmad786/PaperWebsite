import { useTranslations } from 'next-intl';
import { FluentEmoji } from '@lobehub/fluent-emoji';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function ServicesPage({ params: { locale } }: { params: { locale: string } }) {
    const t = useTranslations('services');

    const services = [
        {
            emoji: '📦', // Fallback for truck
            title: t('items.sourcing.title'),
            description: t('items.sourcing.description'),
        },
        {
            emoji: '🏭',
            title: t('items.logistics.title'),
            description: t('items.logistics.description'),
        },
        {
            emoji: '🤝',
            title: t('items.financing.title'),
            description: t('items.financing.description'),
        },
        {
            emoji: '📄',
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
                                { label: 'Home', href: `/${locale}` },
                                { label: t('title'), href: `/${locale}/services` },
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
                    <FluentEmoji emoji="🏭" type="3d" size={400} />
                </div>
            </Section>

            <Section variant="default">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {services.map((service, index) => (
                        <Card key={index} hover className="flex flex-col items-start p-8">
                            <div className="mb-6 relative w-20 h-20 flex items-center justify-center">
                                <FluentEmoji
                                    emoji={service.emoji}
                                    type="3d"
                                    size={80}
                                />
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
                <Link href={`/${locale}/contact`}>
                    <Button variant="primary" size="lg">
                        {t('cta.button')}
                    </Button>
                </Link>
            </Section>
        </>
    );
}
