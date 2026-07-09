import Link from 'next/link';
import { notFound } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import { requirePermission, can } from '@/lib/auth/guard';
import { getAdminT } from '@/lib/admin/i18n';
import { requireDb } from '@/db';
import { leads, leadNotes, users } from '@/db/schema';
import { PageTitle, Card, Flash, Badge, Field } from '@/components/admin/bits';
import { SubmitButton, DeleteButton } from '@/components/admin/form-controls';
import { updateLead, addLeadNote, deleteLead } from '@/lib/admin/lead-actions';
import { inputClass, labelClass } from '@/components/admin/bits';

export const dynamic = 'force-dynamic';

const STAGES = ['new', 'contacted', 'qualifying', 'quoted', 'negotiation', 'won', 'lost'];
const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await requirePermission('leads.read');
  const { t } = await getAdminT();
  const { id } = await params;
  const sp = await searchParams;
  const db = requireDb();

  const [lead] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!lead) notFound();

  const notes = await db
    .select({
      id: leadNotes.id,
      body: leadNotes.body,
      createdAt: leadNotes.createdAt,
      author: users.name,
    })
    .from(leadNotes)
    .leftJoin(users, eq(leadNotes.authorUserId, users.id))
    .where(eq(leadNotes.leadId, id))
    .orderBy(desc(leadNotes.createdAt));

  const editable = can(user, 'leads.write');

  const detail: [string, string | null | undefined][] = [
    [t('common.email'), lead.email],
    [t('leads.field.phone'), lead.phone],
    [t('leads.col.company'), lead.company],
    [t('leads.field.country'), lead.country],
    [t('leads.field.vatId'), lead.vatId],
    [t('leads.col.product'), lead.product],
    [t('leads.field.quantity'), lead.quantity],
    [t('leads.field.locale'), lead.locale],
    [t('leads.field.source'), lead.source],
  ];

  return (
    <>
      <Link href="/admin/leads" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> {t('leads.backToInquiries')}
      </Link>
      <PageTitle
        title={lead.name}
        subtitle={t('leads.receivedAt', { date: lead.createdAt.toLocaleString() })}
        action={<Badge value={lead.stage} />}
      />
      <Flash ok={sp.ok} error={sp.error} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">{t('common.details')}</h2>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {detail.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-medium text-slate-400">{k}</dt>
                  <dd className="text-sm text-slate-800">{v || '—'}</dd>
                </div>
              ))}
            </dl>
            {lead.message && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <dt className="text-xs font-medium text-slate-400">{t('leads.field.message')}</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{lead.message}</dd>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {t('leads.notesActivity')}
            </h2>
            {editable && (
              <form action={addLeadNote} className="mb-5 flex gap-2">
                <input type="hidden" name="id" value={lead.id} />
                <input name="body" placeholder={t('leads.addNotePlaceholder')} className={inputClass} required />
                <SubmitButton>{t('common.add')}</SubmitButton>
              </form>
            )}
            {notes.length === 0 ? (
              <p className="text-sm text-slate-400">{t('leads.noNotes')}</p>
            ) : (
              <ul className="space-y-3">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="whitespace-pre-wrap text-sm text-slate-800">{n.body}</p>
                    <p className="mt-1.5 text-xs text-slate-400">
                      {n.author ?? t('leads.unknownAuthor')} · {n.createdAt.toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">{t('common.manage')}</h2>
            {editable ? (
              <form action={updateLead} className="space-y-4">
                <input type="hidden" name="id" value={lead.id} />
                <div>
                  <label className={labelClass} htmlFor="stage">
                    {t('leads.col.stage')}
                  </label>
                  <select id="stage" name="stage" defaultValue={lead.stage} className={inputClass}>
                    {STAGES.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {t(`leads.stage.${s}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor="priority">
                    {t('leads.col.priority')}
                  </label>
                  <select id="priority" name="priority" defaultValue={lead.priority} className={inputClass}>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p} className="capitalize">
                        {t(`leads.priority.${p}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <SubmitButton className="w-full">{t('common.saveChanges')}</SubmitButton>
              </form>
            ) : (
              <p className="text-sm text-slate-400">{t('common.readOnly')}</p>
            )}
          </Card>

          {can(user, 'leads.delete') && (
            <Card className="p-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{t('common.dangerZone')}</h2>
              <p className="mb-4 text-sm text-slate-500">{t('leads.dangerDesc')}</p>
              <DeleteButton
                action={async () => {
                  'use server';
                  const fd = new FormData();
                  fd.set('id', lead.id);
                  await deleteLead(fd);
                }}
                confirm={t('leads.deleteConfirm')}
                label={t('common.delete')}
              />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
