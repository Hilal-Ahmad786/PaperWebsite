import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function PrivacyPage({ params: { locale } }: { params: { locale: string } }) {
    const t = useTranslations('legal');

    return (
        <>
            <Section variant="dark" className="py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <Breadcrumbs
                            items={[
                                { label: 'Home', href: `/${locale}` },
                                { label: 'Legal', href: `/${locale}/legal` }, // Assuming there is a legal index or just a placeholder
                                { label: t('privacy.title'), href: `/${locale}/legal/privacy` },
                            ]}
                        />
                    </div>
                    <h1 className="text-5xl font-extrabold mb-6 text-gradient">
                        {t('privacy.title')}
                    </h1>
                    <p className="text-xl text-text-secondary">
                        Last updated: December 2024
                    </p>
                </div>
            </Section>

            <Section variant="default">
                <div className="max-w-4xl mx-auto prose prose-invert">
                    <h2 className="text-2xl font-bold mb-4">1. Data We Collect</h2>
                    <p className="text-text-secondary mb-6">
                        We collect information you provide directly, including name, email,
                        company details, and inquiry information when you contact us.
                    </p>

                    <h2 className="text-2xl font-bold mb-4">2. How We Use Data</h2>
                    <p className="text-text-secondary mb-6">
                        Your data is used solely to respond to your inquiries and provide
                        quotes. We do not sell or share your information with third parties.
                    </p>

                    <h2 className="text-2xl font-bold mb-4">3. Data Protection</h2>
                    <p className="text-text-secondary mb-6">
                        We implement industry-standard security measures to protect your data.
                    </p>

                    <h2 className="text-2xl font-bold mb-4">4. Your Rights</h2>
                    <p className="text-text-secondary mb-6">
                        You have the right to access, correct, or delete your personal data.
                        Contact us at privacy@papermarketworld.com
                    </p>

                    <h2 className="text-2xl font-bold mb-4">5. Cookies</h2>
                    <p className="text-text-secondary mb-6">
                        We use essential cookies for site functionality. No tracking cookies are used.
                    </p>

                    <h2 className="text-2xl font-bold mb-4">6. Contact</h2>
                    <p className="text-text-secondary">
                        For privacy questions: privacy@papermarketworld.com
                    </p>
                </div>
            </Section>
        </>
    );
}