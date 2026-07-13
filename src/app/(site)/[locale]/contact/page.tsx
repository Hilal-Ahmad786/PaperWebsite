import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { staticAlternates } from '@/lib/seo';
import { Mail } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { ContactForm } from '@/components/ui/ContactForm';
import { Card } from '@/components/ui/Card';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { HeroIconFrame } from '@/components/ui/IconFrame';
import { type Locale } from '@/i18n';
import { getLocalizedPath } from '@/routing';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return {
    title: t('contact.title'),
    description: t('contact.subtitle'),
    alternates: staticAlternates(locale as Locale, '/contact'),
  };
}

export default function ContactPage({ params: { locale } }: { params: { locale: string } }) {
    const currentLocale = locale as Locale;
    const t = useTranslations('contact');
    const tNav = useTranslations('nav');

    return (
        <>
            <Section variant="dark" className="relative overflow-hidden">
                <div className="max-w-4xl relative z-10">
                    <div className="mb-8 animate-fade-in">
                        <Breadcrumbs
                            items={[
                                { label: tNav('home'), href: getLocalizedPath(currentLocale, '/') },
                                { label: t('title'), href: getLocalizedPath(currentLocale, '/contact') },
                            ]}
                        />
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 text-gradient animate-fade-up">
                        {t('title')}
                    </h1>
                    <p className="text-xl text-text-secondary max-w-2xl animate-fade-up [animation-delay:150ms]">
                        {t('subtitle')}
                    </p>
                </div>
                <HeroIconFrame icon={Mail} tone="sky" />
            </Section>

            <Section variant="default">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <Card>
                            <h3 className="text-xl font-bold text-text-primary mb-4">{t('info.headquarters.title')}</h3>
                            <div className="space-y-2 text-text-secondary">
                                <p>{t('info.headquarters.address.line1')}</p>
                                <p>{t('info.headquarters.address.line2')}</p>
                                <p>{t('info.headquarters.address.line3')}</p>
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-xl font-bold text-text-primary mb-4">{t('info.regional.title')}</h3>
                            <div className="space-y-2 text-text-secondary">
                                <p>{t('info.regional.address.line1')}</p>
                                <p>{t('info.regional.address.line2')}</p>
                                <p>{t('info.regional.address.line3')}</p>
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-xl font-bold text-text-primary mb-4">{t('info.direct.title')}</h3>
                            <div className="space-y-2 text-text-secondary">
                                <p>{t('info.direct.email')}: papermarketworld@gmail.com</p>
                                <p>{t('info.direct.phone')}: +43 660 249 21 86</p>
                                <p>{t('info.direct.phoneTr')}: +90 534 774 97 44</p>
                                <p>WhatsApp: +43 660 249 21 86</p>
                            </div>
                        </Card>
                    </div>

                    {/* Contact Form — visually elevated so it clearly leads the page */}
                    <div className="lg:col-span-2">
                        <div className="relative">
                            {/* Ambient brand glow behind the card */}
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -inset-2 bg-brand-primary/10 blur-3xl"
                            />
                            <div className="relative border border-brand-primary/40 bg-background-secondary shadow-2xl shadow-black/50">
                                {/* Brand accent bar */}
                                <div className="h-1.5 w-full bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-tertiary" />
                                <div className="p-8 lg:p-12">
                                    <div className="mb-8">
                                        <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">
                                            {t('form.heading')}
                                        </h2>
                                        <p className="mt-2 text-text-secondary">{t('form.helper')}</p>
                                    </div>
                                    <ContactForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}
