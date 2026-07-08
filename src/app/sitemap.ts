import type { MetadataRoute } from 'next';
import { locales } from '@/i18n';
import {
  pathnames,
  getLocalizedPath,
  getLocalizedProductPath,
  type AppPathname,
} from '@/routing';
import { products } from '@/content/products';
import { SITE_URL } from '@/lib/seo';

// Routes intentionally kept out of the sitemap (thank-you page is noindex).
const EXCLUDED: AppPathname[] = ['/thank-you'];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const routes = Object.keys(pathnames) as AppPathname[];

  for (const locale of locales) {
    for (const route of routes) {
      if (route.includes('[') || EXCLUDED.includes(route)) continue;
      entries.push({
        url: `${SITE_URL}${getLocalizedPath(locale, route)}`,
        changeFrequency: 'weekly',
        priority: route === '/' ? 1 : 0.7,
      });
    }
    for (const product of products) {
      entries.push({
        url: `${SITE_URL}${getLocalizedProductPath(locale, product.slug)}`,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return entries;
}
