"use server";

import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ResultadoLista = { noLista: boolean } | { erro: string };

/**
 * Liga/desliga um conteúdo na "Minha lista" de quem está logado. Quem decide o dono da linha é a sessão
 * (nunca um parâmetro vindo do navegador); o RLS reforça isso no banco.
 */
export async function alternarMinhaLista(contentId: string): Promise<ResultadoLista> {
  const user = await getSessionUser();
  if (!user) return { erro: "Entre para salvar conteúdos na sua lista." };
  if (!/^[0-9a-f-]{36}$/i.test(contentId)) return { erro: "Conteúdo inválido." };

  const supabase = await createClient();
  const { data: existente } = await supabase
    .from("academy_minha_lista")
    .select("content_id")
    .eq("user_id", user.id)
    .eq("content_id", contentId)
    .maybeSingle();

  if (existente) {
    const { error } = await supabase
      .from("academy_minha_lista")
      .delete()
      .eq("user_id", user.id)
      .eq("content_id", contentId);
    if (error) return { erro: "Não foi possível remover agora. Tente de novo." };
    return { noLista: false };
  }

  const { error } = await supabase.from("academy_minha_lista").insert({ user_id: user.id, content_id: contentId });
  if (error) return { erro: "Não foi possível salvar agora. Tente de novo." };
  return { noLista: true };
}
