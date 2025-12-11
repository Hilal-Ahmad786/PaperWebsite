'use client';

import { useRouter } from 'next/navigation';
import { ProductFinder } from '@/components/ui/ProductFinder';
import { Product } from '@/types';

export function HomeProductFinder({ products }: { products: Product[] }) {
    const router = useRouter();

    const handleComplete = (selectedProducts: Product[]) => {
        if (selectedProducts.length > 0) {
            // Navigate to the first matched product
            // In a real app, we might pass the selection to the products page via query params
            const firstMatch = selectedProducts[0];
            // Assuming locale is in the URL, but useRouter doesn't give locale directly in client component easily without useParams
            // But we can just use relative path if we are careful, or pass locale as prop
            // Let's just redirect to the product page
            // We need to know the current locale.
            // We can pass locale as prop.
        }
    };

    return (
        <ProductFinder
            products={products}
            onComplete={(matches) => {
                if (matches.length > 0) {
                    // Just scroll to products or do nothing for now, 
                    // or maybe redirect to the specific product page.
                    // Let's redirect to the first match.
                    window.location.href = window.location.pathname.replace(/\/$/, '') + '/products/' + matches[0].slug;
                }
            }}
        />
    );
}
