import Link from 'next/link';
import { requirePermission } from '@/lib/auth/guard';
import { isDbConfigured, db } from '@/db';
import { productOverrides } from '@/db/schema';
import { products } from '@/content/products';
import { pickLocalized } from '@/lib/admin/localized';
import { PageTitle, NotConfigured, DataTable, Th, Td, Badge, Flash } from '@/components/admin/bits';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requirePermission('products.read');
  const sp = await searchParams;

  if (!isDbConfigured || !db) {
    return (
      <>
        <PageTitle title="Products" subtitle="Catalog overrides for the static product list" />
        <NotConfigured message="Connect a database to override product copy, imagery, ordering and visibility." />
      </>
    );
  }

  const overrides = await db.select().from(productOverrides);
  const bySlug = new Map(overrides.map((o) => [o.slug, o]));

  return (
    <>
      <PageTitle title="Products" subtitle="Catalog overrides for the static product list" />
      <Flash ok={sp.ok} error={sp.error} />

      <DataTable
        head={
          <>
            <Th>Slug</Th>
            <Th>Name</Th>
            <Th>Category</Th>
            <Th>Hidden?</Th>
            <Th>Sort</Th>
          </>
        }
      >
        {products.map((p) => {
          const o = bySlug.get(p.slug);
          const name = o ? pickLocalized(o.name) : '';
          return (
            <tr key={p.slug} className="hover:bg-slate-50">
              <Td>
                <Link
                  href={`/admin/products/${p.slug}`}
                  className="font-medium text-slate-900 hover:text-emerald-600"
                >
                  {p.slug}
                </Link>
              </Td>
              <Td>{name || <span className="text-slate-400">{p.slug}</span>}</Td>
              <Td>{o?.category || p.category}</Td>
              <Td>{o?.isHidden ? <Badge value="hidden" /> : <span className="text-slate-400">—</span>}</Td>
              <Td>{o?.sortOrder ?? 0}</Td>
            </tr>
          );
        })}
      </DataTable>
    </>
  );
}
