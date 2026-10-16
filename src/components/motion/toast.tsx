"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSyncExternalStore } from "react";

type Tipo = "sucesso" | "erro" | "info";
interface Item {
  id: number;
  texto: string;
  tipo: Tipo;
}

// Mini "store" fora do React: qualquer lugar (formulário, player, botão) chama toast(...) sem precisar de contexto.
let itens: Item[] = [];
let contador = 0;
const ouvintes = new Set<() => void>();
const emitir = () => ouvintes.forEach((l) => l());

export function toast(texto: string, tipo: Tipo = "sucesso", duracaoMs = 4500) {
  const id = ++contador;
  itens = [...itens, { id, texto, tipo }].slice(-4);
  emitir();
  setTimeout(() => {
    itens = itens.filter((i) => i.id !== id);
    emitir();
  }, duracaoMs);
}

const assinar = (l: () => void) => {
  ouvintes.add(l);
  return () => {
    ouvintes.delete(l);
  };
};

const estilo: Record<Tipo, string> = {
  sucesso: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
  erro: "border-brand-orange/40 bg-brand-orange/15 text-brand-orange-light",
  info: "border-brand-blue-light/40 bg-brand-blue-light/15 text-white",
};

const icone: Record<Tipo, string> = { sucesso: "✓", erro: "!", info: "i" };

const VAZIO: Item[] = [];

/** Pilha de avisos no canto inferior direito. Montado uma vez no layout. */
export function Toaster() {
  const lista = useSyncExternalStore(
    assinar,
    () => itens,
    () => VAZIO,
  );

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(92vw,360px)] flex-col gap-2"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {lista.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-elevated backdrop-blur-md ${estilo[t.tipo]}`}
          >
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-[11px] font-bold">
              {icone[t.tipo]}
            </span>
            <span className="leading-snug">{t.texto}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
