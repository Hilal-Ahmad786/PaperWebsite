'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, Loader2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { inputClass } from '@/components/admin/bits';

export type MediaUploaderLabels = {
  upload: string;
  uploading: string;
  chooseFile: string;
  uploadFailed: string;
  /** Template containing a {status} placeholder. */
  uploadFailedStatus: string;
};

export function MediaUploader({ labels }: { labels: MediaUploaderLabels }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError(labels.chooseFile);
      return;
    }

    const body = new FormData();
    body.set('file', file);

    setUploading(true);
    try {
      const res = await fetch('/api/admin/media/upload', { method: 'POST', body });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? labels.uploadFailedStatus.replace('{status}', String(res.status)));
        return;
      }
      if (inputRef.current) inputRef.current.value = '';
      router.refresh();
    } catch {
      setError(labels.uploadFailed);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          disabled={uploading}
          className={cn(
            inputClass,
            'h-auto flex-1 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-emerald-700'
          )}
        />
        <button
          type="submit"
          disabled={uploading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? labels.uploading : labels.upload}
        </button>
      </form>
      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}

export type CopyUrlLabels = { copyUrl: string; copied: string };

export function CopyUrlButton({ url, labels }: { url: string; labels: CopyUrlLabels }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable — ignore.
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
    >
      {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
      {copied ? labels.copied : labels.copyUrl}
    </button>
  );
}
