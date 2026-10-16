"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

/** Bloco que abre e fecha com altura animada (usado nos módulos dos cursos). */
export function AccordionItem({
  header,
  children,
  defaultOpen = false,
}: {
  header: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [aberto, setAberto] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-start justify-between gap-4 px-5 pb-4 pt-5 text-left"
      >
        <div className="min-w-0 flex-1">{header}</div>
        <motion.span
          aria-hidden
          animate={{ rotate: aberto ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/5 text-white/70 ring-1 ring-white/10"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {aberto && (
          <motion.div
            key="conteudo"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
