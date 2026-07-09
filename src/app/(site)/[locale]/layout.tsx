import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n';
import '../../globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MarketTicker } from '@/components/layout/MarketTicker';
import { ChatWidget } from '@/components/ui/ChatWidget';
import { ToastContainer } from '@/components/ui/Toast';
import { OrganizationJsonLd } from '@/components/seo/JsonLd';
import { ConsentModeDefault } from '@/components/analytics/ConsentMode';
import { SiteTracking } from '@/components/tracking/SiteTracking';
import { UsercentricsCmp } from '@/components/analytics/UsercentricsCmp';
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
} from '@/components/analytics/GoogleTagManager';
import { SITE_NAME, SITE_URL, ogLocale } from '@/lib/seo';
import { getDirection } from '@/lib/utils';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} | ${t('home.hero.title')}`,
      template: `%s | ${SITE_NAME}`,
    },
    description: t('home.hero.subtitle'),
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: ogLocale(locale as Locale),
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Fetch messages
  const messages = await getMessages();

  const direction = getDirection(locale);

  return (
    <html lang={locale} dir={direction} className={inter.className}>
      <head>
        <ConsentModeDefault />
        <OrganizationJsonLd />
      </head>
      <body className="bg-background-primary text-text-primary">
        <GoogleTagManagerNoScript />
        <UsercentricsCmp />
        <GoogleTagManager />
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale} />
          <MarketTicker />
          <main>{children}</main>
          <Footer locale={locale} />
          <ChatWidget />
          <ToastContainer />
          <SiteTracking />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
