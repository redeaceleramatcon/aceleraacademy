"use client";

import { useActionState } from "react";
import { trocarSenha, type TrocarSenhaState } from "./actions";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 transition-colors focus:border-brand-blue-light/60 focus:outline-none";

const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-subtle";

export function TrocarSenhaForm() {
  const [state, formAction, pending] = useActionState<TrocarSenhaState, FormData>(trocarSenha, {});

  return (
    <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
      <div className="min-w-[10rem] flex-1">
        <label className={labelClass} htmlFor="nova_senha">
          Nova senha
        </label>
        <input
          id="nova_senha"
          name="nova_senha"
          type="password"
          required
          minLength={8}
          placeholder="Mínimo de 8 caracteres"
          className={inputClass}
        />
      </div>

      <div className="min-w-[10rem] flex-1">
        <label className={labelClass} htmlFor="confirmar_senha">
          Confirmar nova senha
        </label>
        <input
          id="confirmar_senha"
          name="confirmar_senha"
          type="password"
          required
          minLength={8}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-brand-blue-light/60 hover:bg-brand-blue-light/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Trocar senha"}
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
