"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type SignUpState } from "./actions";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 transition-colors focus:border-brand-blue-light/60 focus:outline-none";

const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-subtle";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState<SignUpState, FormData>(signUp, {});

  if (state.aviso) {
    return (
      <div className="mt-8">
        <p className="rounded-lg border border-brand-blue-light/30 bg-brand-blue-light/10 px-4 py-3 text-sm text-brand-blue-light">
          {state.aviso}
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-brand-blue-light/60 hover:bg-brand-blue-light/10"
        >
          Ir para a entrada
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <div>
        <label htmlFor="full_name" className={labelClass}>
          Nome completo
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          placeholder="Como você quer ser chamado"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="cnpj" className={labelClass}>
          CNPJ da loja
        </label>
        <input
          id="cnpj"
          name="cnpj"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          required
          placeholder="Somente números"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="o e-mail cadastrado como responsável no ADM"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Mínimo de 8 caracteres"
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
        {pending ? "Validando cadastro..." : "Criar conta"}
      </button>
    </form>
  );
}
