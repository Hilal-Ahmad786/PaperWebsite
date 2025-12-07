import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import '../../globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MarketTicker } from '@/components/layout/MarketTicker';
import { getDirection } from '@/lib/utils';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
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
      <body className="bg-background-primary text-text-primary">
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale} />
          <MarketTicker />
          <main>{children}</main>
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
