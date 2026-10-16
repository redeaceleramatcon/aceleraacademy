"use client";

import { BotaoRemover } from "@/components/motion/BotaoRemover";
import { removerMembroInterno } from "./actions";

export function RemoverInternoButton({ vinculoId }: { vinculoId: string }) {
  return <BotaoRemover acao={removerMembroInterno.bind(null, vinculoId)} />;
}
