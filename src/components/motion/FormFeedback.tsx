"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { toast } from "@/components/motion/toast";
import { cn } from "@/lib/utils";

/**
 * Mensagem de erro/aviso de formulário: o erro entra balançando (shake), o aviso entra suave
 * e também aparece como toast no canto da tela (para não passar despercebido).
 */
export function FormFeedback({
  error,
  aviso,
  className,
  toastDoAviso = true,
}: {
  error?: string;
  aviso?: string;
  className?: string;
  toastDoAviso?: boolean;
}) {
  useEffect(() => {
    if (aviso && toastDoAviso) toast(aviso, "sucesso");
  }, [aviso, toastDoAviso]);

  return (
    <AnimatePresence mode="popLayout">
      {error && (
        <motion.p
          key={`e-${error}`}
          role="alert"
          initial={{ opacity: 0, y: -8, x: 0 }}
          animate={{ opacity: 1, y: 0, x: [0, -8, 8, -5, 5, 0] }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.45 }}
          className={cn(
            "rounded-lg border border-brand-orange/30 bg-brand-orange/10 px-4 py-3 text-sm text-brand-orange-light",
            className,
          )}
        >
          {error}
        </motion.p>
      )}
      {aviso && (
        <motion.p
          key={`a-${aviso}`}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className={cn(
            "rounded-lg border border-brand-blue-light/30 bg-brand-blue-light/10 px-4 py-3 text-sm text-brand-blue-light",
            className,
          )}
        >
          {aviso}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
