"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "@/components/motion/toast";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import { renovarMiniaturas } from "./actions";

/**
 * "Buscar de novo no YouTube": útil quando você trocou a capa lá e o site ainda mostra a antiga.
 * Sem `contentId` renova todos os vídeos de uma vez.
 */
export function BotaoRenovar({
  contentId = null,
  rotulo,
  className,
}: {
  contentId?: string | null;
  rotulo: string;
  className?: string;
}) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();

  function renovar() {
    iniciar(async () => {
      const r = await renovarMiniaturas(contentId);
      if (r.error) toast(r.error, "erro");
      else toast(r.aviso ?? "Pronto.", "sucesso");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={renovar}
      disabled={pendente}
      className={cn("inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60", className)}
    >
      {pendente && <Spinner className="h-3 w-3" />}
      {pendente ? "Buscando..." : rotulo}
    </button>
  );
}
