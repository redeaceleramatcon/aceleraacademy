import { createClient } from "@/lib/supabase/client";

export type TipoEvento =
  | "page_view"
  | "heartbeat"
  | "video_start"
  | "video_pause"
  | "video_complete"
  | "cta_click";

// Memoiza o usuário logado por carregamento de página — evita um round-trip de
// auth.getUser() a cada evento (heartbeat dispara a cada 30s).
let usuarioPromise: Promise<string | null> | null = null;

function usuarioAtual(): Promise<string | null> {
  if (!usuarioPromise) {
    usuarioPromise = createClient()
      .auth.getUser()
      .then(({ data }) => data.user?.id ?? null)
      .catch(() => null);
  }
  return usuarioPromise;
}

/**
 * Grava um evento-chave (não every-click) direto do navegador — RLS já
 * restringe a gravação à própria pessoa (ver migration analytics_eventos).
 * Falha em silêncio de propósito: rastreio nunca deve quebrar a navegação de
 * ninguém nem aparecer como erro pro usuário.
 */
export async function registrarEvento(
  tipo: TipoEvento,
  opts?: { pagina?: string; contentId?: string; detalhe?: Record<string, unknown> },
) {
  try {
    const userId = await usuarioAtual();
    if (!userId) return; // só rastreia quem está logado

    await createClient()
      .from("academy_eventos")
      .insert({
        user_id: userId,
        tipo,
        pagina: opts?.pagina,
        content_id: opts?.contentId,
        detalhe: opts?.detalhe,
      });
  } catch {
    // silencioso — ver comentário acima
  }
}
