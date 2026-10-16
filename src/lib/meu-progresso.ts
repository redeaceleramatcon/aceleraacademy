import { createClient } from "@/lib/supabase/server";

/**
 * Progresso do aluno logado, lido de content_progress (o player grava a cada 10 s).
 * O RLS já limita a leitura à própria linha; o filtro por user_id só deixa a intenção explícita.
 */

const FALLBACK_IMAGE = "/placeholder-conteudo.svg";

export interface ItemProgresso {
  contentId: string;
  slug: string;
  titulo: string;
  imagem: string;
  categoria: string | null;
  percent: number;
  posicaoSegundos: number;
  completo: boolean;
  ultimoAcesso: string;
}

export interface ResumoProgresso {
  emAndamento: ItemProgresso[];
  concluidos: ItemProgresso[];
  minutosAssistidos: number;
}

type LinhaProgresso = {
  content_id: string;
  progress_percent: number;
  position_seconds: number;
  completed_at: string | null;
  last_accessed_at: string | null;
  content: {
    slug: string;
    title: string;
    thumbnail_url: string | null;
    categories: { name: string } | null;
    videos: { thumbnail_url: string | null } | null;
  } | null;
};

// Select tipado como string de propósito (mesmo motivo de src/lib/data/content.ts: evita o estouro de
// profundidade de tipos do supabase-js com embeds).
const SELECT: string = `
  content_id, progress_percent, position_seconds, completed_at, last_accessed_at,
  content ( slug, title, thumbnail_url, categories ( name ), videos ( thumbnail_url ) )
`;

export async function meuProgresso(userId: string): Promise<ResumoProgresso> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_progress")
    .select(SELECT)
    .eq("user_id", userId)
    .order("last_accessed_at", { ascending: false, nullsFirst: false });

  const linhas = (data ?? []) as unknown as LinhaProgresso[];

  const itens: ItemProgresso[] = linhas
    // conteúdo despublicado/removido volta sem o embed: não dá pra mostrar nem abrir
    .filter((l) => l.content)
    .map((l) => ({
      contentId: l.content_id,
      slug: l.content!.slug,
      titulo: l.content!.title,
      imagem: l.content!.thumbnail_url ?? l.content!.videos?.thumbnail_url ?? FALLBACK_IMAGE,
      categoria: l.content!.categories?.name ?? null,
      percent: Math.round(Number(l.progress_percent) || 0),
      posicaoSegundos: l.position_seconds ?? 0,
      completo: !!l.completed_at,
      ultimoAcesso: l.last_accessed_at ?? "",
    }));

  return {
    emAndamento: itens.filter((i) => !i.completo && i.percent > 0),
    concluidos: itens.filter((i) => i.completo),
    minutosAssistidos: Math.round(linhas.reduce((s, l) => s + (l.position_seconds ?? 0), 0) / 60),
  };
}

/** Onde o aluno parou neste conteúdo (para o player retomar). */
export async function progressoDoConteudo(userId: string, contentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_progress")
    .select("progress_percent, position_seconds, completed_at")
    .eq("user_id", userId)
    .eq("content_id", contentId)
    .maybeSingle();
  if (!data) return null;
  return {
    percent: Math.round(Number(data.progress_percent) || 0),
    posicaoSegundos: data.position_seconds ?? 0,
    completo: !!data.completed_at,
  };
}
