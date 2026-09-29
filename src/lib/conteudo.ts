import { createServiceClient } from "@/lib/supabase/service";

/**
 * Escrita do catálogo (content/videos/mentors) — só o Admin usa isto, sempre
 * com a chave de serviço: não existe policy de insert/update para
 * anon/authenticated nessas tabelas (ver migration 20260916000000, seção 6).
 */

const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Aceita link completo (watch?v=, youtu.be/, embed/, shorts/) ou o ID puro
 * colado direto. Retorna null quando não reconhece nada parecido com um ID
 * de vídeo do YouTube.
 */
export function extrairYoutubeId(input: string): string | null {
  const valor = input.trim();
  if (YOUTUBE_ID_RE.test(valor)) return valor;

  try {
    const url = new URL(valor);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && YOUTUBE_ID_RE.test(id) ? id : null;
    }
    if (url.hostname.includes("youtube.com")) {
      const vParam = url.searchParams.get("v");
      if (vParam && YOUTUBE_ID_RE.test(vParam)) return vParam;

      const partes = url.pathname.split("/").filter(Boolean);
      const marcador = partes.findIndex((p) => p === "embed" || p === "shorts" || p === "live");
      const candidato = marcador >= 0 ? partes[marcador + 1] : undefined;
      return candidato && YOUTUBE_ID_RE.test(candidato) ? candidato : null;
    }
  } catch {
    return null;
  }
  return null;
}

/** "Pró-labore: você está quebrando sua loja?" -> "pro-labore-voce-esta-quebrando-sua-loja". */
function gerarSlugBase(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function gerarSlugUnico(
  supabase: ReturnType<typeof createServiceClient>,
  tabela: "content" | "mentors",
  base: string,
): Promise<string> {
  const raiz = gerarSlugBase(base) || "conteudo";
  let candidato = raiz;
  let sufixo = 2;
  // Coleções pequenas — um loop sequencial é suficiente e mais simples que
  // tentar prever colisão antecipadamente.
  for (;;) {
    const { data } = await supabase.from(tabela).select("id").eq("slug", candidato).maybeSingle();
    if (!data) return candidato;
    candidato = `${raiz}-${sufixo}`;
    sufixo += 1;
  }
}

export interface CategoriaAdmin {
  slug: string;
  name: string;
}

export async function listarCategoriasAdmin(): Promise<CategoriaAdmin[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("categories")
    .select("slug, name")
    .order("order_index", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export interface MentorAdmin {
  id: string;
  name: string;
}

/**
 * Todos os mentores cadastrados, não só os já ligados a algum conteúdo
 * publicado — a policy pública de mentors filtra por isso, então o Admin
 * precisa da chave de serviço mesmo só para ler.
 */
export async function listarMentoresAdmin(): Promise<MentorAdmin[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("mentors")
    .select("id, name")
    .eq("active", true)
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export interface NovoConteudoInput {
  youtubeUrl: string;
  title: string;
  description: string;
  categorySlug: string;
  contentType: "course" | "lesson" | "live" | "interview" | "partner" | "webinar";
  visibility: "public" | "associates";
  mentorId?: string;
  mentorNomeNovo?: string;
  publicarAgora: boolean;
  featured: boolean;
}

/** Cria o conteúdo e devolve o slug final — para linkar para /conteudos/[slug]. */
export async function criarConteudoYoutube(input: NovoConteudoInput): Promise<{ slug: string }> {
  const supabase = createServiceClient();

  const videoId = extrairYoutubeId(input.youtubeUrl);
  if (!videoId) {
    throw new Error("Não reconheci esse link do YouTube. Cole a URL completa do vídeo.");
  }

  const { data: categoria } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", input.categorySlug)
    .maybeSingle();
  if (!categoria) throw new Error("Categoria inválida.");

  // Reaproveita o vídeo se esse mesmo YouTube ID já foi cadastrado antes —
  // videos.provider_video_id é unique, então inserir de novo quebraria.
  const { data: videoExistente } = await supabase
    .from("videos")
    .select("id")
    .eq("provider", "youtube")
    .eq("provider_video_id", videoId)
    .maybeSingle();

  let videoRowId = videoExistente?.id as string | undefined;
  if (!videoRowId) {
    const { data: novoVideo, error: erroVideo } = await supabase
      .from("videos")
      .insert({
        provider: "youtube",
        provider_video_id: videoId,
        thumbnail_url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        status: "ready",
      })
      .select("id")
      .single();
    if (erroVideo) throw erroVideo;
    videoRowId = novoVideo.id;
  }

  let mentorId = input.mentorId?.trim() || undefined;
  const mentorNomeNovo = input.mentorNomeNovo?.trim();
  if (!mentorId && mentorNomeNovo) {
    const slugMentor = await gerarSlugUnico(supabase, "mentors", mentorNomeNovo);
    const { data: novoMentor, error: erroMentor } = await supabase
      .from("mentors")
      .insert({ name: mentorNomeNovo, slug: slugMentor })
      .select("id")
      .single();
    if (erroMentor) throw erroMentor;
    mentorId = novoMentor.id;
  }

  const slug = await gerarSlugUnico(supabase, "content", input.title);
  const agora = new Date().toISOString();

  const { data: conteudo, error: erroConteudo } = await supabase
    .from("content")
    .insert({
      slug,
      title: input.title,
      description: input.description || null,
      content_type: input.contentType,
      category_id: categoria.id,
      video_id: videoRowId,
      status: input.publicarAgora ? "published" : "draft",
      visibility: input.visibility,
      published_at: input.publicarAgora ? agora : null,
      is_featured: input.featured,
    })
    .select("id")
    .single();
  if (erroConteudo) throw erroConteudo;

  if (mentorId) {
    const { error: erroLink } = await supabase
      .from("content_mentors")
      .insert({ content_id: conteudo.id, mentor_id: mentorId, order_index: 0 });
    if (erroLink) throw erroLink;
  }

  return { slug };
}
