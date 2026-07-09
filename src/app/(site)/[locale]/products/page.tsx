import { getProductOverrides } from '@/lib/public-data';
import { ProductsView } from './products-view';

// Product catalog overrides (hide/reorder/localized copy) are managed in the
// admin panel; render per request with a short revalidate and fall back to the
// static catalog when no overrides exist.
export const revalidate = 60;

export default async function ProductsPage({ params: { locale } }: { params: { locale: string } }) {
    const overrides = await getProductOverrides(locale);
    return <ProductsView locale={locale} overrides={overrides} />;
}
