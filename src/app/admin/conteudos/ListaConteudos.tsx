"use client";

import { useMemo, useState } from "react";
import { LinhaCapa } from "./LinhaCapa";
import type { ConteudoParaCapa } from "@/lib/conteudo";

type Visual = "todos" | "lojista" | "colaborador" | "ambos";

const FILTROS_VISUAL: { valor: Visual; texto: string }[] = [
  { valor: "todos", texto: "Qualquer visualização" },
  { valor: "lojista", texto: "Só lojistas" },
  { valor: "colaborador", texto: "Treinamento da equipe" },
  { valor: "ambos", texto: "Todos" },
];

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** A lista de vídeos com busca e filtros (categoria e visualização), para achar rápido o que se quer ajustar. */
export function ListaConteudos({ itens }: { itens: ConteudoParaCapa[] }) {
  const [categoria, setCategoria] = useState<string>("todas");
  const [visual, setVisual] = useState<Visual>("todos");
  const [busca, setBusca] = useState("");

  const categorias = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const c of itens) {
      const nome = c.categoria ?? "Sem categoria";
      mapa.set(nome, (mapa.get(nome) ?? 0) + 1);
    }
    return Array.from(mapa.entries()).sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
  }, [itens]);

  const visiveis = itens.filter((c) => {
    if (categoria !== "todas" && (c.categoria ?? "Sem categoria") !== categoria) return false;
    if (visual !== "todos" && c.audience !== visual) return false;
    if (busca.trim() && !norm(c.titulo).includes(norm(busca.trim()))) return false;
    return true;
  });

  const chip = (ativo: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
      ativo ? "border-brand-orange bg-brand-orange text-white" : "border-white/15 bg-white/5 text-white hover:bg-white/10"
    }`;

  return (
    <>
      <div className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-surface p-4">
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar vídeo pelo título"
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-subtle"
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setCategoria("todas")} className={chip(categoria === "todas")}>
            Todas as categorias ({itens.length})
          </button>
          {categorias.map(([nome, total]) => (
            <button key={nome} type="button" onClick={() => setCategoria(nome)} className={chip(categoria === nome)}>
              {nome} ({total})
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTROS_VISUAL.map((f) => (
            <button key={f.valor} type="button" onClick={() => setVisual(f.valor)} className={chip(visual === f.valor)}>
              {f.texto}
            </button>
          ))}
        </div>
        <p className="text-xs text-subtle">
          Mostrando {visiveis.length} de {itens.length} vídeos.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {visiveis.map((c) => (
          <LinhaCapa key={c.id} item={c} />
        ))}
        {visiveis.length === 0 && <p className="text-sm text-muted">Nenhum vídeo com esses filtros.</p>}
      </div>
    </>
  );
}
