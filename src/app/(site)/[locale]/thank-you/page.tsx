import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { LeadThankYouTracker } from '@/components/tracking/LeadThankYouTracker';
import { type Locale } from '@/i18n';
import { getLocalizedPath } from '@/routing';

export async function generateMetadata({
    params: { locale },
}: {
    params: { locale: string };
}): Promise<Metadata> {
    const t = await getTranslations({ locale });
    return {
        title: t('thankYou.title'),
        // Conversion confirmation page — keep out of the index.
        robots: { index: false, follow: true },
    };
}

export default function ThankYouPage({ params: { locale } }: { params: { locale: string } }) {
    const currentLocale = locale as Locale;
    const t = useTranslations();

    return (
        <Section variant="dark" className="py-24 lg:py-32 text-center">
            {/* Backup/diagnostic event only — never re-fires generate_lead. */}
            <LeadThankYouTracker pageLanguage={currentLocale} />
            <div className="max-w-2xl mx-auto">
                <CheckCircle2 className="h-16 w-16 mx-auto mb-8 text-brand-primary animate-scale-in" aria-hidden="true" />
                <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 text-text-primary animate-fade-up">
                    {t('thankYou.title')}
                </h1>
                <p className="text-lg text-text-secondary mb-10 animate-fade-up [animation-delay:150ms]">
                    {t('thankYou.subtitle')}
                </p>
                <Link href={getLocalizedPath(currentLocale, '/')}>
                    <Button variant="primary" size="lg">
                        {t('thankYou.backHome')}
                    </Button>
                </Link>
            </div>
        </Section>
    );
}
