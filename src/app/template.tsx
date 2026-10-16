"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Transição entre páginas: a nova página entra com fade. Só opacidade (sem translate/scale):
 * qualquer `transform` aqui viraria o "bloco de contenção" do cabeçalho fixo e ele deixaria de
 * grudar no topo da tela.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="flex flex-1 flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
