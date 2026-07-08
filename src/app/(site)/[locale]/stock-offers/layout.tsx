import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { type Locale } from '@/i18n';
import { staticAlternates } from '@/lib/seo';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale });
  return {
    title: t('stockOffers.title'),
    description: t('stockOffers.subtitle'),
    alternates: staticAlternates(locale as Locale, '/stock-offers'),
  };
}

export default function StockOffersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
