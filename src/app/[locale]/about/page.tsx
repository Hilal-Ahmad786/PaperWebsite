import { useTranslations } from 'next-intl';
import { FluentEmoji } from '@lobehub/fluent-emoji';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function AboutPage({ params: { locale } }: { params: { locale: string } }) {
    const t = useTranslations('about');

    return (
        <>
            <Section variant="dark" className="relative overflow-hidden">
                <div className="max-w-4xl relative z-10">
                    <h1 className="text-5xl font-extrabold mb-6">
                        <span className="text-gradient">{t('title')}</span>
                    </h1>
                    <p className="text-xl text-text-secondary max-w-2xl">
                        {t('subtitle')}
                    </p>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                    <FluentEmoji emoji="👥" type="3d" size={400} />
                </div>
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
                    <div className="relative h-[400px] w-full flex items-center justify-center">
                        <FluentEmoji
                            emoji="🤝"
                            type="3d"
                            size={300}
                        />
                    </div>
                </div>
            </Section>

            <Section variant="darker">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">Why Choose Us?</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="p-6 text-center">
                        <div className="text-4xl font-bold text-brand-primary mb-2">10+</div>
                        <div className="text-text-secondary">Years Experience</div>
                    </Card>
                    <Card className="p-6 text-center">
                        <div className="text-4xl font-bold text-brand-primary mb-2">50+</div>
                        <div className="text-text-secondary">Global Partners</div>
                    </Card>
                    <Card className="p-6 text-center">
                        <div className="text-4xl font-bold text-brand-primary mb-2">24/7</div>
                        <div className="text-text-secondary">Support</div>
                    </Card>
                </div>
            </Section>
        </>
    );
}
