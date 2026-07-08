import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { staticAlternates } from '@/lib/seo';
import { Earth, Leaf, Recycle, ShieldCheck, type LucideIcon } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
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
    title: t('sustainability.title'),
    description: t('sustainability.subtitle'),
    alternates: staticAlternates(locale as Locale, '/sustainability'),
  };
}

export default function SustainabilityPage({ params: { locale } }: { params: { locale: string } }) {
    const currentLocale = locale as Locale;
    const t = useTranslations('sustainability');
    const tNav = useTranslations('nav');
    const items: Array<{
        icon: LucideIcon;
        tone: IconTone;
        title: string;
        description: string;
    }> = [
        {
            icon: Recycle,
            tone: 'emerald',
            title: t('items.recycled.title'),
            description: t('items.recycled.description'),
        },
        {
            icon: Earth,
            tone: 'sky',
            title: t('items.impact.title'),
            description: t('items.impact.description'),
        },
        {
            icon: ShieldCheck,
            tone: 'lime',
            title: t('items.partnerships.title'),
            description: t('items.partnerships.description'),
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
                                { label: t('title'), href: getLocalizedPath(currentLocale, '/sustainability') },
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
                <HeroIconFrame icon={Leaf} tone="lime" />
            </Section>

            <Section variant="default">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {items.map((item) => (
                        <Card key={item.title} hover className="group relative overflow-hidden p-8 text-left">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <div className="mb-6 flex items-center gap-4">
                                <IconFrame icon={item.icon} tone={item.tone} size="lg" />
                                <div className="h-px flex-1 bg-gradient-to-r from-brand-primary/45 to-transparent" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                            <p className="text-text-secondary leading-relaxed">{item.description}</p>
                        </Card>
                    ))}
                </div>
            </Section>
        </>
    );
}
