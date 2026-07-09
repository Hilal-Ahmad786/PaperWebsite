'use client';

import { useId } from 'react';
import { useFormState } from 'react-dom';
import { AlertCircle } from 'lucide-react';
import { login, type LoginResult } from '@/lib/auth/actions';
import { SubmitButton } from './form-controls';
import { inputClass, labelClass } from './bits';

export function LoginForm() {
  const uid = useId();
  const [state, action] = useFormState<LoginResult | null, FormData>(login, null);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}
      <div>
        <label htmlFor={`${uid}-email`} className={labelClass}>
          Email
        </label>
        <input id={`${uid}-email`} name="email" type="email" autoComplete="email" required className={inputClass} />
      </div>
      <div>
        <label htmlFor={`${uid}-password`} className={labelClass}>
          Password
        </label>
        <input
          id={`${uid}-password`}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>
      <SubmitButton className="w-full">Sign in</SubmitButton>
    </form>
  );
}
