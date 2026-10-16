"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "@/components/motion/toast";

/** Copia o link da página (para mandar o conteúdo a um colega). O ícone vira um ✓ por 2 s. */
export function CopyLinkButton() {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      toast("Link copiado! É só colar e enviar.", "sucesso", 3000);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast("Não consegui copiar. Copie o endereço pela barra do navegador.", "erro");
    }
  }

  return (
    <motion.button
      type="button"
      onClick={copiar}
      whileTap={{ scale: 0.96 }}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-brand-blue-light/60 hover:bg-brand-blue-light/10"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copiado ? "ok" : "copiar"}
          initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.18 }}
          className="flex h-4 w-4 items-center justify-center"
        >
          {copiado ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </motion.span>
      </AnimatePresence>
      {copiado ? "Copiado!" : "Copiar link"}
    </motion.button>
  );
}
