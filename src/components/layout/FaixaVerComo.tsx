"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { definirVerComo } from "@/app/ver-como/actions";

/** Aviso fixo enquanto admin/editor está vendo o site como colaborador, com saída em um clique. */
export function FaixaVerComo() {
  const router = useRouter();
  const [pending, iniciar] = useTransition();
  return (
    <div className="fixed bottom-4 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between gap-3 rounded-full border border-brand-orange/50 bg-[#10172e]/95 px-4 py-2 text-xs text-white shadow-lg backdrop-blur">
      <span>
        Você está vendo o site como <strong>colaborador</strong>
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => iniciar(async () => { await definirVerComo("lojista"); router.refresh(); })}
        className="shrink-0 rounded-full bg-brand-orange px-3 py-1 font-semibold text-white disabled:opacity-60"
      >
        Voltar ao normal
      </button>
    </div>
  );
}
