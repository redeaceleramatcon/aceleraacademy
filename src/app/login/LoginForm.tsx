"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "./actions";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 transition-colors focus:border-brand-blue-light/60 focus:outline-none";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />

      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-wide text-subtle">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="voce@empresa.com.br"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs uppercase tracking-wide text-subtle"
        >
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className={inputClass}
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-brand-orange/30 bg-brand-orange/10 px-4 py-3 text-sm text-brand-orange-light"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-orange px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 transition-all hover:bg-brand-orange-light hover:shadow-brand-orange/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
