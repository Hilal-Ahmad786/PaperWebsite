import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/Section';
import { ContactForm } from '@/components/ui/ContactForm';
import { Card } from '@/components/ui/Card';

export default function ContactPage() {
    const t = useTranslations('contact');

    return (
        <>
            <Section variant="dark" className="py-20">
                <div className="text-center max-w-4xl mx-auto">
                    <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 text-gradient">
                        {t('title')}
                    </h1>
                    <p className="text-xl text-text-secondary">
                        {t('subtitle')}
                    </p>
                </div>
            </Section>

            <Section variant="default">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <Card>
                            <h3 className="text-xl font-bold text-text-primary mb-4">Headquarters</h3>
                            <div className="space-y-2 text-text-secondary">
                                <p>Paper Market World GmbH</p>
                                <p>Kärntner Ring 5-7</p>
                                <p>1010 Vienna, Austria</p>
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-xl font-bold text-text-primary mb-4">Regional Office</h3>
                            <div className="space-y-2 text-text-secondary">
                                <p>PMW Turkey</p>
                                <p>Maslak Mah. Büyükdere Cad.</p>
                                <p>34398 Istanbul, Turkey</p>
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-xl font-bold text-text-primary mb-4">Direct Contact</h3>
                            <div className="space-y-2 text-text-secondary">
                                <p>Email: info@papermarketworld.com</p>
                                <p>Phone: +43 1 234 5678</p>
                                <p>WhatsApp: +90 555 123 4567</p>
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
