import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Ponto único de leitura da sessão no servidor.
 *
 * Usa o cliente de `supabase/server.ts` (o mesmo que lê e renova os cookies) e
 * `React.cache`, de modo que várias chamadas no mesmo render — Header e página,
 * por exemplo — resultem em uma única verificação.
 *
 * Sempre `getUser()`, nunca `getSession()`: só o primeiro valida o token junto
 * ao Supabase, em vez de confiar no cookie recebido do navegador.
 */
export interface SessionProfile {
  id: string;
  email: string;
  /** Nome vindo de profiles.full_name. Nulo quando o associado ainda não tem. */
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string | null;
}

export const getSessionUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getSessionProfile = cache(async (): Promise<SessionProfile | null> => {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();
  // O RLS de profiles já restringe a linha ao próprio usuário; o filtro
  // explícito deixa a intenção visível.
  const { data } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: data?.full_name ?? null,
    avatarUrl: data?.avatar_url ?? null,
    createdAt: user.created_at ?? null,
  };
});

/** Rótulo neutro quando o associado ainda não tem nome cadastrado. */
export function displayName(profile: { fullName: string | null; email: string }) {
  return profile.fullName?.trim() || "Associado Acelera Matcon";
}
