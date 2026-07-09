import { getStockOffers } from '@/lib/public-data';
import { StockOffersView } from './offers-view';

// Offers may be managed in the admin panel (DB), so render per request with a
// short revalidate; falls back to static content when no DB rows exist.
export const revalidate = 60;

export default async function StockOffersPage({ params: { locale } }: { params: { locale: string } }) {
    const offers = await getStockOffers();
    return <StockOffersView offers={offers} locale={locale} />;
}
