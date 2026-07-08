import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { staticAlternates } from '@/lib/seo';
import { OrderStatusTracker } from '@/components/ui/OrderStatusTracker';
import { Section } from '@/components/ui/Section';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { type Locale } from '@/i18n';
import { getLocalizedPath } from '@/routing';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return {
    title: t('tracker.title'),
    description: t('tracker.subtitle'),
    alternates: staticAlternates(locale as Locale, '/track-order'),
  };
}

export default function TrackOrderPage({ params: { locale } }: { params: { locale: string } }) {
    const currentLocale = locale as Locale;
    const t = useTranslations();

    // Mock order data
    const mockOrder = {
        id: 'ORD-2024-001',
        currentStage: 2,
        estimatedDelivery: '2024-04-15',
        stages: [
            {
                id: 1,
                title: t('tracker.stages.placed'),
                date: '2024-03-01',
                status: 'complete' as const,
            },
            {
                id: 2,
                title: t('tracker.stages.production'),
                date: '2024-03-05',
                status: 'current' as const,
                description: t('tracker.descriptions.production')
            },
            {
                id: 3,
                title: t('tracker.stages.quality'),
                date: '2024-03-20',
                status: 'pending' as const,
            },
            {
                id: 4,
                title: t('tracker.stages.shipped'),
                date: '2024-03-25',
                status: 'pending' as const,
            },
            {
                id: 5,
                title: t('tracker.stages.delivered'),
                date: '2024-04-15',
                status: 'pending' as const,
            }
        ]
    };

    return (
        <>
            <Section variant="dark" className="py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="flex justify-center mb-8">
                        <Breadcrumbs
                            items={[
                                { label: t('nav.home'), href: getLocalizedPath(currentLocale, '/') },
                                { label: t('tracker.title'), href: getLocalizedPath(currentLocale, '/track-order') },
                            ]}
                        />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 text-gradient">
                        {t('tracker.title')}
                    </h1>
                    <p className="text-xl text-text-secondary">
                        {t('tracker.subtitle')}
                    </p>
                </div>
            </Section>

            <Section variant="default">
                <div className="max-w-4xl mx-auto">
                    <OrderStatusTracker
                        currentStage={mockOrder.currentStage}
                        estimatedDelivery={mockOrder.estimatedDelivery}
                        stages={mockOrder.stages}
                    />
                </div>
            </Section>
        </>
    );
}
