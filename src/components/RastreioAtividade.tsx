"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { registrarEvento } from "@/lib/eventos";

const INTERVALO_HEARTBEAT_MS = 30_000;

/**
 * Monta uma vez no layout raiz. Grava um page_view a cada troca de rota e um
 * heartbeat a cada 30s enquanto a aba está visível — é o que sustenta o
 * "tempo de uso" no relatório (calculado na leitura, agrupando eventos
 * próximos no tempo, não como uma sessão gravada aqui).
 */
export function RastreioAtividade() {
  const pathname = usePathname();

  useEffect(() => {
    registrarEvento("page_view", { pagina: pathname });
  }, [pathname]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      if (document.visibilityState === "visible") {
        registrarEvento("heartbeat", { pagina: window.location.pathname });
      }
    }, INTERVALO_HEARTBEAT_MS);
    return () => clearInterval(intervalo);
  }, []);

  return null;
}
