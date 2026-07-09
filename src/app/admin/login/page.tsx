import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { isDbConfigured } from '@/db';
import { LoginForm } from '@/components/admin/login-form';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect('/admin');

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500 text-lg font-bold text-white">
            PM
          </span>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Paper Market World</h1>
          <p className="text-sm text-slate-500">Admin panel</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {!isDbConfigured && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
              Database is not configured yet. Set <code>DATABASE_URL</code>, then run{' '}
              <code>npm run db:push</code> and <code>npm run db:seed</code>.
            </div>
          )}
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          Protected area · authorized personnel only
        </p>
      </div>
    </div>
  );
}
