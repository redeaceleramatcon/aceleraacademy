"use client";

import { useActionState } from "react";
import { convidarMembroInterno, type ConvidarInternoState } from "./actions";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 transition-colors focus:border-brand-blue-light/60 focus:outline-none";

const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-subtle";

export function ConvidarInternoForm() {
  const [state, formAction, pending] = useActionState<ConvidarInternoState, FormData>(
    convidarMembroInterno,
    {},
  );

  return (
    <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
      <div className="min-w-[10rem] flex-1">
        <label className={labelClass} htmlFor="interno-nome">
          Nome
        </label>
        <input id="interno-nome" name="nome" type="text" placeholder="Nome da pessoa" className={inputClass} />
      </div>

      <div className="min-w-[12rem] flex-1">
        <label className={labelClass} htmlFor="interno-email">
          E-mail
        </label>
        <input
          id="interno-email"
          name="email"
          type="email"
          required
          placeholder="email@aceleramatcon.com.br"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Convidando..." : "Convidar"}
      </button>

      {state.error && (
        <p role="alert" className="basis-full text-xs text-brand-orange-light">
          {state.error}
        </p>
      )}
      {state.aviso && <p className="basis-full text-xs text-brand-blue-light">{state.aviso}</p>}
    </form>
  );
}
