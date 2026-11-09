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

/**
 * Cliente de leitura COM a sessão do usuário (o token de acesso vai no cabeçalho, sem cookies).
 * Passa pelas políticas do papel `authenticated`: é o que faz o conteúdo "só do lojista" aparecer
 * para o lojista e ficar escondido do colaborador. O token entra na chave do cache do catálogo
 * (unstable_cache não pode ler cookies), então cada pessoa logada tem o próprio cache de 60 s.
 */
export function supabaseComToken(token: string) {
  return createClient(url!, key!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}
