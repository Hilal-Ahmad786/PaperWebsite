'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ADMIN_LOCALE_COOKIE, type AdminLocale } from './index';

/** Set the admin UI language (persisted in a cookie for one year). */
export async function setAdminLocale(locale: AdminLocale): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_LOCALE_COOKIE, locale === 'tr' ? 'tr' : 'en', {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  revalidatePath('/admin', 'layout');
}
