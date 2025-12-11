import { useTranslations } from 'next-intl';
import { FluentEmoji } from '@lobehub/fluent-emoji';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function SustainabilityPage({ params: { locale } }: { params: { locale: string } }) {
    const t = useTranslations('sustainability');

    return (
        <>
            <Section variant="dark" className="relative overflow-hidden">
                <div className="max-w-4xl relative z-10">
                    <div className="mb-8">
                        <Breadcrumbs
                            items={[
                                { label: 'Home', href: `/${locale}` },
                                { label: t('title'), href: `/${locale}/sustainability` },
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
                    {/* Using globe as fallback for leaf */}
                    <FluentEmoji emoji="🌍" type="3d" size={400} />
                </div>
            </Section>

            <Section variant="default">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card hover className="p-8 text-center flex flex-col items-center">
                        <div className="mb-6 relative w-20 h-20 flex items-center justify-center">
                            <FluentEmoji emoji="🏭" type="3d" size={80} />
                        </div>
                        <h3 className="text-xl font-bold mb-4">{t('items.recycled.title')}</h3>
                        <p className="text-text-secondary">{t('items.recycled.description')}</p>
                    </Card>
                    <Card hover className="p-8 text-center flex flex-col items-center">
                        <div className="mb-6 relative w-20 h-20 flex items-center justify-center">
                            <FluentEmoji emoji="🌍" type="3d" size={80} />
                        </div>
                        <h3 className="text-xl font-bold mb-4">{t('items.impact.title')}</h3>
                        <p className="text-text-secondary">{t('items.impact.description')}</p>
                    </Card>
                    <Card hover className="p-8 text-center flex flex-col items-center">
                        <div className="mb-6 relative w-20 h-20 flex items-center justify-center">
                            <FluentEmoji emoji="🤝" type="3d" size={80} />
                        </div>
                        <h3 className="text-xl font-bold mb-4">{t('items.partnerships.title')}</h3>
                        <p className="text-text-secondary">{t('items.partnerships.description')}</p>
                    </Card>
                </div>
            </Section>
        </>
    );
}
