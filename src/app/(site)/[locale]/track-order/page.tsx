import { useTranslations } from 'next-intl';
import { OrderStatusTracker } from '@/components/ui/OrderStatusTracker';
import { Section } from '@/components/ui/Section';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function TrackOrderPage({ params: { locale } }: { params: { locale: string } }) {
    const t = useTranslations();

    // Mock order data
    const mockOrder = {
        id: 'ORD-2024-001',
        currentStage: 2,
        estimatedDelivery: '2024-04-15',
        stages: [
            {
                id: 1,
                title: 'Order Placed',
                date: '2024-03-01',
                status: 'complete' as const,
            },
            {
                id: 2,
                title: 'In Production',
                date: '2024-03-05',
                status: 'current' as const,
                description: 'Production in progress at mill'
            },
            {
                id: 3,
                title: 'Quality Check',
                date: '2024-03-20',
                status: 'pending' as const,
            },
            {
                id: 4,
                title: 'Shipped',
                date: '2024-03-25',
                status: 'pending' as const,
            },
            {
                id: 5,
                title: 'Delivered',
                date: '2024-04-15',
                status: 'pending' as const,
            }
        ]
    };

    return (
        <>
            <Section variant="dark" className="py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="flex justify-center mb-8">
                        <Breadcrumbs
                            items={[
                                { label: 'Home', href: `/${locale}` },
                                { label: 'Track Order', href: `/${locale}/track-order` },
                            ]}
                        />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 text-gradient">
                        Track Your Order
                    </h1>
                    <p className="text-xl text-text-secondary">
                        Real-time updates on your shipment status
                    </p>
                </div>
            </Section>

            <Section variant="default">
                <div className="max-w-4xl mx-auto">
                    <OrderStatusTracker
                        currentStage={mockOrder.currentStage}
                        estimatedDelivery={mockOrder.estimatedDelivery}
                        stages={mockOrder.stages}
                    />
                </div>
            </Section>
        </>
    );
}
