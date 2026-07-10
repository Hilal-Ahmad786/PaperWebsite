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
            <Section variant="dark" className="relative overflow-hidden py-20">
                <div className="text-center max-w-4xl mx-auto relative z-10">
                    <div className="flex justify-center mb-8 animate-fade-in">
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
                    <p className="text-xl text-text-secondary animate-fade-up [animation-delay:150ms]">
                        {t('subtitle')}
                    </p>
                </div>
                <HeroIconFrame icon={Mail} className="lg:hidden xl:block" />
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

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="p-8 lg:p-12">
                            <ContactForm />
                        </Card>
                    </div>
                </div>
            </Section>
        </>
    );
}
