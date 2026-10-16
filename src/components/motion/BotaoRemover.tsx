"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "@/components/motion/toast";
import { Spinner } from "@/components/ui/Spinner";

function Confirmar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-1.5 rounded-md bg-brand-orange px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-brand-orange-light disabled:opacity-70"
    >
      {pending ? <Spinner className="h-3 w-3" /> : null}
      {pending ? "Removendo..." : "Confirmar"}
    </button>
  );
}

/**
 * Remoção em dois passos: o 1º clique só pede confirmação (e se arrepende sozinho em 5 s), o 2º executa.
 * Evita tirar o acesso de alguém sem querer. `acao` é a server action já ligada ao id.
 */
export function BotaoRemover({ acao, rotulo = "Remover" }: { acao: () => Promise<void>; rotulo?: string }) {
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    if (!confirmando) return;
    const t = setTimeout(() => setConfirmando(false), 5000);
    return () => clearTimeout(t);
  }, [confirmando]);

  return (
    <form
      action={async () => {
        await acao();
        toast("Acesso removido.", "info");
      }}
      className="flex items-center"
    >
      <AnimatePresence mode="wait" initial={false}>
        {confirmando ? (
          <motion.span
            key="confirmar"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.16 }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="text-xs text-muted transition-colors hover:text-foreground"
            >
              Cancelar
            </button>
            <Confirmar />
          </motion.span>
        ) : (
          <motion.button
            key="remover"
            type="button"
            onClick={() => setConfirmando(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="text-xs font-semibold text-brand-orange-light transition-colors hover:text-brand-orange"
          >
            {rotulo}
          </motion.button>
        )}
      </AnimatePresence>
    </form>
  );
}
