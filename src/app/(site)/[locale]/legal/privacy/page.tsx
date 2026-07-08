import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { staticAlternates } from '@/lib/seo';
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
    title: t('legal.privacy.title'),
    alternates: staticAlternates(locale as Locale, '/legal/privacy'),
  };
}

export default function PrivacyPage({ params: { locale } }: { params: { locale: string } }) {
    const currentLocale = locale as Locale;
    const t = useTranslations();
    const sections = ['data', 'use', 'protection', 'rights', 'cookies', 'contact'];

    return (
        <>
            <Section variant="dark" className="py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <Breadcrumbs
                            items={[
                                { label: t('nav.home'), href: getLocalizedPath(currentLocale, '/') },
                                { label: t('legal.privacy.title'), href: getLocalizedPath(currentLocale, '/legal/privacy') },
                            ]}
                        />
                    </div>
                    <h1 className="text-5xl font-extrabold mb-6 text-gradient">
                        {t('legal.privacy.title')}
                    </h1>
                    <p className="text-xl text-text-secondary">
                        {t('legal.privacy.lastUpdated')}
                    </p>
                </div>
            </Section>

            <Section variant="default">
                <div className="max-w-4xl mx-auto prose prose-invert">
                    {sections.map((section, index) => (
                        <div key={section}>
                            <h2 className="text-2xl font-bold mb-4">
                                {index + 1}. {t(`legal.privacy.sections.${section}.title`)}
                            </h2>
                            <p className="text-text-secondary mb-6">
                                {t(`legal.privacy.sections.${section}.body`)}
                            </p>
                        </div>
                    ))}
                </div>
            </Section>
        </>
    );
}
