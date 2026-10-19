"use client";

import { useActionState } from "react";
import { CapaUploader } from "@/components/admin/CapaUploader";
import { FormFeedback } from "@/components/motion/FormFeedback";
import { Spinner } from "@/components/ui/Spinner";
import { BotaoRenovar } from "./BotaoRenovar";
import type { ConteudoParaCapa } from "@/lib/conteudo";
import { trocarCapa, type TrocarCapaState } from "./actions";

const rotuloStatus: Record<ConteudoParaCapa["status"], { texto: string; cor: string }> = {
  published: { texto: "Publicado", cor: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30" },
  draft: { texto: "Rascunho", cor: "bg-yellow-500/15 text-yellow-200 ring-yellow-400/30" },
  archived: { texto: "Arquivado", cor: "bg-white/10 text-muted ring-white/15" },
};

/** Uma linha da lista: mostra a capa de hoje e deixa trocar por uma imagem nova. */
export function LinhaCapa({ item }: { item: ConteudoParaCapa }) {
  const [state, formAction, pending] = useActionState<TrocarCapaState, FormData>(trocarCapa.bind(null, item.id), {});
  const status = rotuloStatus[item.status];
  // a capa recém-enviada aparece na hora; a do banco é a de antes
  const capa = state.capaUrl ?? item.capaAtual;
  const propria = !!state.capaUrl || item.temCapaPropria;

  return (
    <div className="rounded-2xl border border-white/10 bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="min-w-0 truncate text-sm font-semibold text-foreground">{item.titulo}</p>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${status.cor}`}>
          {status.texto}
        </span>
        {item.categoria && <span className="text-xs text-subtle">{item.categoria}</span>}
        <span className="ml-auto flex items-center gap-3 text-[11px] text-subtle">
          {propria ? (
            "Capa própria"
          ) : (
            <>
              Miniatura do YouTube
              <BotaoRenovar
                contentId={item.id}
                rotulo="Atualizar do YouTube"
                className="rounded-md border border-white/15 px-2 py-1 text-[11px] font-semibold text-white transition-colors hover:border-brand-blue-light/60 hover:bg-brand-blue-light/10"
              />
            </>
          )}
        </span>
      </div>

      <form action={formAction} className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <CapaUploader capaAtual={capa} compacto textoVazio="Sem imagem" />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <>
              <Spinner /> Enviando...
            </>
          ) : (
            "Salvar capa"
          )}
        </button>
        <FormFeedback error={state.error} aviso={state.aviso} className="basis-full" />
      </form>
    </div>
  );
}
