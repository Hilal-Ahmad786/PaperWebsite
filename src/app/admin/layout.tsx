import type { Metadata } from 'next';
import '../globals.css';

// All admin routes are non-indexable and outside the localized site tree.
export const metadata: Metadata = {
  title: 'Admin · Paper Market World',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="!bg-slate-50 !text-slate-900 antialiased">{children}</body>
    </html>
  );
}
