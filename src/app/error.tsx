"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/Container";

/**
 * Falha ao carregar dados (Supabase fora do ar, rede, consulta inválida).
 * `retry` refaz a busca sem recarregar a página inteira.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center pt-24 sm:pt-28">
      <Container className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange-light">
          Erro de carregamento
        </p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Não foi possível carregar os conteúdos
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          A conexão com a plataforma falhou. Tente novamente em instantes.
        </p>
        <button
          onClick={() => retry()}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-orange px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 transition-all hover:bg-brand-orange-light hover:shadow-brand-orange/30"
        >
          Tentar novamente
        </button>
      </Container>
    </main>
  );
}
