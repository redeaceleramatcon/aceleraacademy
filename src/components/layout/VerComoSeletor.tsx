"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { definirVerComo } from "@/app/ver-como/actions";

/** Admin/editor escolhe como quer ver o site: como lojista (normal) ou como colaborador. */
export function VerComoSeletor({ atual }: { atual: "lojista" | "colaborador" }) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [pending, iniciar] = useTransition();

  const trocar = (modo: "lojista" | "colaborador") => {
    if (modo === atual) return;
    setErro(null);
    iniciar(async () => {
      const r = await definirVerComo(modo);
      if (r.error) setErro(r.error);
      else router.refresh();
    });
  };

  const base = "px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60";
  const ativo = "bg-brand-orange text-white";
  const inativo = "bg-white/5 text-white hover:bg-white/10";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-muted">Ver o site como</span>
      <div className="flex overflow-hidden rounded-lg border border-white/15" role="group" aria-label="Ver o site como">
        <button type="button" disabled={pending} onClick={() => trocar("lojista")} className={`${base} ${atual === "lojista" ? ativo : inativo}`} aria-pressed={atual === "lojista"}>
          Lojista
        </button>
        <button type="button" disabled={pending} onClick={() => trocar("colaborador")} className={`${base} ${atual === "colaborador" ? ativo : inativo}`} aria-pressed={atual === "colaborador"}>
          Colaborador
        </button>
      </div>
      {erro && <span className="text-xs text-red-300">{erro}</span>}
    </div>
  );
}
