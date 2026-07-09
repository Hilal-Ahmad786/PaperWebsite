'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Inbox,
  FileText,
  Package,
  Tag,
  TrendingUp,
  Image as ImageIcon,
  Languages,
  Search,
  Settings,
  ScrollText,
  BarChart3,
  ShieldCheck,
  ShieldAlert,
  MousePointerClick,
  Menu,
  X,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/auth/actions';
import { setAdminLocale } from '@/lib/admin/i18n/actions';
import type { AdminLocale } from '@/lib/admin/i18n';

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  leads: Inbox,
  content: FileText,
  products: Package,
  offers: Tag,
  market: TrendingUp,
  media: ImageIcon,
  translations: Languages,
  seo: Search,
  analytics: BarChart3,
  clicks: MousePointerClick,
  clickprotection: ShieldAlert,
  users: Users,
  roles: ShieldCheck,
  settings: Settings,
  audit: ScrollText,
};

export interface NavItem {
  key: string;
  label: string;
  href: string;
}

export function AdminShell({
  nav,
  userName,
  userEmail,
  roleLabel,
  locale,
  adminLabel,
  logoutLabel,
  children,
}: {
  nav: NavItem[];
  userName: string;
  userEmail: string;
  roleLabel: string;
  locale: AdminLocale;
  adminLabel: string;
  logoutLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-[13px] font-bold text-white">
          PM
        </span>
        <span className="text-[15px] font-bold text-white">Paper Market</span>
        <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/70">
          {adminLabel}
        </span>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {nav.map((item) => {
          const Icon = ICONS[item.key] ?? LayoutDashboard;
          const active = isActive(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-slate-900 lg:block">{Sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-slate-900">{Sidebar}</aside>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-[60] grid h-10 w-10 place-items-center rounded-md bg-white text-slate-700"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-md text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="ml-auto flex items-center gap-3">
            {/* Language toggle (EN / TR) */}
            <div className="flex overflow-hidden rounded-md border border-slate-300 text-xs font-semibold">
              {(['en', 'tr'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setAdminLocale(l)}
                  className={cn(
                    'px-2.5 py-1.5 uppercase transition-colors',
                    locale === l ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="hidden flex-col items-end leading-tight sm:flex">
              <span className="text-sm font-semibold text-slate-900">{userName}</span>
              <span className="text-xs text-slate-500">
                {userEmail} · {roleLabel}
              </span>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">{logoutLabel}</span>
              </button>
            </form>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
