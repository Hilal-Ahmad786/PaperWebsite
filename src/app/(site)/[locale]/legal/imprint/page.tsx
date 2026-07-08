import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Section } from '@/components/ui/Section';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { type Locale } from '@/i18n';
import { getLocalizedPath } from '@/routing';
import { staticAlternates } from '@/lib/seo';

const FIELDS = [
    'company',
    'legalForm',
    'address',
    'representative',
    'register',
    'court',
    'vatId',
    'email',
    'phone',
] as const;

export async function generateMetadata({
    params: { locale },
}: {
    params: { locale: string };
}): Promise<Metadata> {
    const t = await getTranslations({ locale });
    return {
        title: t('legal.imprint.title'),
        description: t('legal.imprint.disclosure'),
        alternates: staticAlternates(locale as Locale, '/legal/imprint'),
    };
}

export default function ImprintPage({ params: { locale } }: { params: { locale: string } }) {
    const currentLocale = locale as Locale;
    const t = useTranslations();

    return (
        <>
            <Section variant="dark" className="py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <Breadcrumbs
                            items={[
                                { label: t('nav.home'), href: getLocalizedPath(currentLocale, '/') },
                                { label: t('legal.imprint.title'), href: getLocalizedPath(currentLocale, '/legal/imprint') },
                            ]}
                        />
                    </div>
                    <h1 className="text-5xl font-extrabold mb-6 text-gradient">
                        {t('legal.imprint.title')}
                    </h1>
                    <p className="text-xl text-text-secondary">
                        {t('legal.imprint.disclosure')}
                    </p>
                </div>
            </Section>

            <Section variant="default">
                <div className="max-w-4xl mx-auto">
                    <dl className="divide-y divide-border-secondary border border-border-primary">
                        {FIELDS.map((field) => (
                            <div key={field} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-4">
                                <dt className="text-text-secondary font-medium">
                                    {t(`legal.imprint.fields.${field}.label`)}
                                </dt>
                                <dd className="sm:col-span-2 text-text-primary whitespace-pre-line">
                                    {t(`legal.imprint.fields.${field}.value`)}
                                </dd>
                            </div>
                        ))}
                    </dl>

                    <div className="mt-10 space-y-6 text-text-secondary">
                        <div>
                            <h2 className="text-xl font-bold mb-2 text-text-primary">
                                {t('legal.imprint.liability.title')}
                            </h2>
                            <p>{t('legal.imprint.liability.body')}</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-2 text-text-primary">
                                {t('legal.imprint.dispute.title')}
                            </h2>
                            <p>{t('legal.imprint.dispute.body')}</p>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
}
