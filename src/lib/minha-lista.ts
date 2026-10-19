import { createClient } from "@/lib/supabase/server";
import { LIST_SELECT, toContentItem, type ContentRow } from "@/lib/data/content";
import type { ContentItem } from "@/types/content";

/**
 * "Minha lista": conteúdos que a pessoa salvou. Lê com a sessão dela (RLS: só as próprias linhas) —
 * por isso não passa pelo cache do catálogo, que é público.
 */

/** Só os ids (para marcar o "+" / "✓" dos cards). */
export async function idsMinhaLista(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("academy_minha_lista").select("content_id").eq("user_id", userId);
  return (data ?? []).map((l) => l.content_id as string);
}

// Select tipado como string (mesmo motivo do catálogo: evita o estouro de tipos do supabase-js com embeds).
const SELECT: string = `content_id, criado_em, content ( ${LIST_SELECT} )`;

/** Os conteúdos salvos, do mais recente para o mais antigo (despublicados somem sozinhos: o RLS não devolve o conteúdo). */
export async function minhaLista(userId: string): Promise<ContentItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("academy_minha_lista")
    .select(SELECT)
    .eq("user_id", userId)
    .order("criado_em", { ascending: false });

  const linhas = (data ?? []) as unknown as { content: ContentRow | null }[];
  return linhas.filter((l) => l.content).map((l) => toContentItem(l.content!));
}
