import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de leitura pública: sem cookies e sem sessão.
 *
 * Usa apenas a chave publicável, então tudo que ele enxerga passa pelas
 * políticas de RLS do papel `anon` — catálogo publicado e nada além disso.
 * Por não depender de cookies, as páginas que o usam continuam podendo ser
 * pré-renderizadas (ao contrário do cliente de `server.ts`, que lê a sessão).
 *
 * Para dados do usuário (progresso, perfil), use `server.ts`.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
  );
}

export const supabasePublic = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
