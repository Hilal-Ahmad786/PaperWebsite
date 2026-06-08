'use client';

import { ProductFinder } from '@/components/ui/ProductFinder';
import { Product } from '@/types';
import { defaultLocale, locales, type Locale } from '@/i18n';
import { getLocalizedProductPath } from '@/routing';

function getCurrentLocale() {
    const locale = window.location.pathname.split('/')[1] as Locale;
    return locales.includes(locale) ? locale : defaultLocale;
}

export function HomeProductFinder({ products }: { products: Product[] }) {
    return (
        <ProductFinder
            products={products}
            onComplete={(matches) => {
                if (matches.length > 0) {
                    window.location.href = getLocalizedProductPath(getCurrentLocale(), matches[0].slug);
                }
            }}
        />
    );
}
