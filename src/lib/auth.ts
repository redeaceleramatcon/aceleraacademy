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
export interface SessionVinculo {
  /** Nulo para vínculo interno (criado pelo admin, sem loja nenhuma por trás). */
  lojaCnpj: string | null;
  papel: "master" | "funcionario" | "interno";
}

export interface SessionProfile {
  id: string;
  email: string;
  /** Nome vindo de profiles.full_name. Nulo quando o associado ainda não tem. */
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string | null;
  /** Vínculos ativos (master ou funcionário) — vazio quando não tem nenhuma loja. */
  vinculos: SessionVinculo[];
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
  // O RLS de profiles e de academy_vinculos já restringe as linhas ao próprio
  // usuário; o filtro explícito deixa a intenção visível.
  const [{ data: profileData }, { data: vinculosData }] = await Promise.all([
    supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle(),
    supabase
      .from("academy_vinculos")
      .select("loja_cnpj, papel")
      .eq("user_id", user.id)
      .eq("status", "ativo"),
  ]);

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profileData?.full_name ?? null,
    avatarUrl: profileData?.avatar_url ?? null,
    createdAt: user.created_at ?? null,
    vinculos: (vinculosData ?? []).map((v) => ({
      lojaCnpj: v.loja_cnpj,
      papel: v.papel as SessionVinculo["papel"],
    })),
  };
});

/** Rótulo neutro quando o associado ainda não tem nome cadastrado. */
export function displayName(profile: { fullName: string | null; email: string }) {
  return profile.fullName?.trim() || "Associado Acelera Matcon";
}
