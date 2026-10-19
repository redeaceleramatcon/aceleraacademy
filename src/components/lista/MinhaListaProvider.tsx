"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { alternarMinhaLista } from "@/app/minha-lista/actions";
import { toast } from "@/components/motion/toast";
import { cn } from "@/lib/utils";

interface Ctx {
  logado: boolean;
  tem: (uuid: string) => boolean;
  alternar: (uuid: string, titulo: string) => Promise<void>;
}

const MinhaListaContext = createContext<Ctx>({ logado: false, tem: () => false, alternar: async () => {} });

/**
 * Estado compartilhado da "Minha lista" da página (cards, painel de detalhes e botão do conteúdo mostram
 * sempre o mesmo "+" / "✓"). A mudança aparece na hora (otimista) e volta atrás se o servidor recusar.
 */
export function MinhaListaProvider({
  inicial,
  logado,
  children,
}: {
  inicial: string[];
  logado: boolean;
  children: ReactNode;
}) {
  const [ids, setIds] = useState<Set<string>>(() => new Set(inicial));

  const alternar = useCallback(
    async (uuid: string, titulo: string) => {
      if (!logado) {
        toast("Entre na sua conta para salvar conteúdos na Minha lista.", "info");
        return;
      }
      const tinha = ids.has(uuid);
      const aplicar = (adicionar: boolean) =>
        setIds((atual) => {
          const novo = new Set(atual);
          if (adicionar) novo.add(uuid);
          else novo.delete(uuid);
          return novo;
        });

      aplicar(!tinha); // otimista
      const r = await alternarMinhaLista(uuid);
      if ("erro" in r) {
        aplicar(tinha); // volta atrás
        toast(r.erro, "erro");
        return;
      }
      toast(r.noLista ? `“${titulo}” foi para a sua lista.` : `“${titulo}” saiu da sua lista.`, r.noLista ? "sucesso" : "info");
    },
    [ids, logado],
  );

  const valor = useMemo<Ctx>(() => ({ logado, tem: (u) => ids.has(u), alternar }), [ids, logado, alternar]);
  return <MinhaListaContext.Provider value={valor}>{children}</MinhaListaContext.Provider>;
}

export function useMinhaLista() {
  return useContext(MinhaListaContext);
}

/** Botão "Minha lista" (com "+" que vira "✓"), usado no painel de detalhes e na página do conteúdo. */
export function BotaoMinhaLista({
  uuid,
  titulo,
  className,
}: {
  uuid: string;
  titulo: string;
  className?: string;
}) {
  const { tem, alternar, logado } = useMinhaLista();
  const naLista = tem(uuid);

  return (
    <motion.button
      type="button"
      onClick={() => alternar(uuid, titulo)}
      whileTap={{ scale: 0.95 }}
      aria-pressed={naLista}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors",
        naLista
          ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
          : "border-white/25 bg-white/5 text-white hover:border-brand-blue-light/60 hover:bg-brand-blue-light/10",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={naLista ? "ok" : "mais"}
          initial={{ scale: 0.4, rotate: -90, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="flex h-4 w-4 items-center justify-center text-base leading-none"
        >
          {naLista ? "✓" : "+"}
        </motion.span>
      </AnimatePresence>
      {naLista ? "Na minha lista" : "Minha lista"}
      {!logado && <span className="sr-only"> (entre para salvar)</span>}
    </motion.button>
  );
}
