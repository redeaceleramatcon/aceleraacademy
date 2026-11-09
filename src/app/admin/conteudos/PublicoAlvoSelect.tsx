"use client";

import { useState, useTransition } from "react";
import { trocarPublicoAlvo } from "./actions";

type Opcao = "ambos" | "colaborador" | "lojista";

const OPCOES: { valor: Opcao; texto: string }[] = [
  { valor: "ambos", texto: "Todos (lojistas e colaboradores)" },
  { valor: "colaborador", texto: "Treinamento da equipe (lojista também vê)" },
  { valor: "lojista", texto: "Só lojistas (escondido dos colaboradores)" },
];

/** Escolhe para quem um conteúdo é; salva na hora ao trocar. */
export function PublicoAlvoSelect({ contentId, inicial }: { contentId: string; inicial: Opcao }) {
  const [valor, setValor] = useState<Opcao>(inicial);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, iniciar] = useTransition();

  return (
    <label className="flex flex-wrap items-center gap-2 text-xs text-muted">
      Visualização
      <select
        value={valor}
        disabled={pending}
        onChange={(e) => {
          const novo = e.target.value as Opcao;
          setValor(novo);
          setMsg(null);
          iniciar(async () => {
            const r = await trocarPublicoAlvo(contentId, novo);
            setMsg(r.error ?? r.aviso ?? null);
          });
        }}
        className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs font-semibold text-white"
      >
        {OPCOES.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
      {msg && <span className={msg === "Salvo." ? "text-emerald-300" : "text-red-300"}>{msg}</span>}
    </label>
  );
}
