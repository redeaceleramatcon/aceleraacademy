"use client";

import { BotaoRemover } from "@/components/motion/BotaoRemover";
import { remover } from "./actions";

export function RemoverButton({ vinculoId }: { vinculoId: string }) {
  return <BotaoRemover acao={remover.bind(null, vinculoId)} />;
}
