import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { staticAlternates } from '@/lib/seo';
import { BriefcaseBusiness, Handshake, Network, TimerReset, Users, type LucideIcon } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Accordion } from '@/components/ui/Accordion';
import { HeroIconFrame, IconFrame, type IconTone } from '@/components/ui/IconFrame';
import { type Locale } from '@/i18n';
import { getLocalizedPath } from '@/routing';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return {
    title: t('about.title'),
    description: t('about.subtitle'),
    alternates: staticAlternates(locale as Locale, '/about'),
  };
}

export default function AboutPage({ params: { locale } }: { params: { locale: string } }) {
    const currentLocale = locale as Locale;
    const t = useTranslations('about');
    const tNav = useTranslations('nav');
    const stats: Array<{
        icon: LucideIcon;
        tone: IconTone;
        value: string;
        label: string;
    }> = [
        {
            icon: BriefcaseBusiness,
            tone: 'emerald',
            value: '10+',
            label: t('stats.experience'),
        },
        {
            icon: Network,
            tone: 'sky',
            value: '50+',
            label: t('stats.partners'),
        },
        {
            icon: TimerReset,
            tone: 'rose',
            value: '24/7',
            label: t('stats.support'),
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
                                { label: t('title'), href: getLocalizedPath(currentLocale, '/about') },
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
                <HeroIconFrame icon={Users} tone="sky" />
            </Section>

            <Section variant="default">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-6">{t('mission.title')}</h2>
                        <p className="text-lg text-text-secondary mb-6 leading-relaxed">
                            {t('mission.description')}
                        </p>
                        <h2 className="text-3xl font-bold mb-6">{t('vision.title')}</h2>
                        <p className="text-lg text-text-secondary leading-relaxed">
                            {t('vision.description')}
                        </p>
                    </div>
                    <div className="relative flex h-[400px] w-full items-center justify-center">
                        <IconFrame icon={Handshake} tone="emerald" size="hero" className="rotate-2" iconClassName="stroke-[1.15]" />
                    </div>
                </div>
            </Section>

            <Section variant="darker">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">{t('whyChooseUs')}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="p-6 text-center">
                            <div className="mb-4 flex justify-center">
                                <IconFrame icon={stat.icon} tone={stat.tone} size="sm" />
                            </div>
                            <div className="text-4xl font-bold text-brand-primary mb-2">{stat.value}</div>
                            <div className="text-text-secondary">{stat.label}</div>
                        </Card>
                    ))}
                </div>
            </Section>

            {/* FAQ Section */}
            <Section variant="default">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">{t('faq.title')}</h2>
                        <p className="text-text-secondary">{t('faq.subtitle')}</p>
                    </div>
                    <Accordion
                        items={[
                            {
                                id: '1',
                                question: t('faq.items.moq.question'),
                                answer: t('faq.items.moq.answer')
                            },
                            {
                                id: '2',
                                question: t('faq.items.payment.question'),
                                answer: t('faq.items.payment.answer')
                            },
                            {
                                id: '3',
                                question: t('faq.items.logistics.question'),
                                answer: t('faq.items.logistics.answer')
                            },
                            {
                                id: '4',
                                question: t('faq.items.samples.question'),
                                answer: t('faq.items.samples.answer')
                            }
                        ]}
                    />
                </div>
            </Section>
        </>
    );
}
