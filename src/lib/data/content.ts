import { supabasePublic } from "@/lib/supabase/public";
import type {
  Category,
  ContentDetail,
  ContentItem,
  ContentMaterial,
  ContentModule,
  ContentType,
} from "@/types/content";

/**
 * Camada de dados da Academy: frontend -> aqui -> Supabase.
 *
 * Tudo que é específico do banco fica contido neste arquivo — nomes de colunas,
 * enums em inglês, duração em segundos e a sintaxe de embedding do PostgREST.
 * Os componentes recebem apenas `ContentItem` / `ContentDetail`.
 */

// -----------------------------------------------------------------------------
// Conversão banco -> interface
// -----------------------------------------------------------------------------

const TYPE_MAP: Record<string, ContentType> = {
  course: "curso",
  lesson: "aula",
  live: "live",
  interview: "entrevista",
  partner: "parceiro",
  webinar: "webinar",
};

/** Usada quando o conteúdo não tem thumbnail própria nem vídeo com thumbnail. */
const FALLBACK_IMAGE = "/placeholder-conteudo.svg";

/** 2280 -> "38 min"; 9600 -> "2h 40min". */
function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "";
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

type CategoryRow = { slug: string; name: string } | null;
type PartnerRow = { name: string } | null;
type VideoRow = {
  provider?: string;
  provider_video_id?: string;
  playback_url?: string | null;
  thumbnail_url?: string | null;
  status?: string;
} | null;
type MentorLinkRow = {
  order_index: number;
  mentors: { name: string; role?: string | null } | null;
};

type ContentRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content_type: string;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  is_featured?: boolean;
  categories?: CategoryRow;
  partners?: PartnerRow;
  videos?: VideoRow;
  content_mentors?: MentorLinkRow[];
};

function sortedMentors(row: ContentRow) {
  return (row.content_mentors ?? [])
    .slice()
    .sort((a, b) => a.order_index - b.order_index)
    .map((link) => ({
      name: link.mentors?.name ?? "",
      role: link.mentors?.role ?? undefined,
    }))
    .filter((mentor) => mentor.name.length > 0);
}

function toContentItem(row: ContentRow): ContentItem {
  const mentors = sortedMentors(row);

  return {
    uuid: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    mentor: mentors[0]?.name,
    category: row.categories?.slug,
    categoryName: row.categories?.name,
    type: TYPE_MAP[row.content_type] ?? "aula",
    duration: formatDuration(row.duration_seconds),
    image: row.thumbnail_url ?? row.videos?.thumbnail_url ?? FALLBACK_IMAGE,
    partner: row.partners?.name ?? undefined,
    featured: row.is_featured ?? false,
  };
}

// -----------------------------------------------------------------------------
// Consultas
// -----------------------------------------------------------------------------

/** Campos de card. `categories(...)` etc. vêm das FKs declaradas no schema. */
const LIST_SELECT = `
  id, slug, title, description, content_type, duration_seconds, thumbnail_url,
  is_featured, published_at,
  categories ( slug, name ),
  partners ( name ),
  videos ( thumbnail_url ),
  content_mentors ( order_index, mentors ( name, role ) )
`;

/**
 * Detalhe. `modules!modules_content_id_fkey` e `content!content_module_id_fkey`
 * são obrigatórios: existem dois caminhos entre content e modules (o módulo
 * pertence ao curso, a aula pertence ao módulo) e sem a dica explícita o
 * PostgREST recusa a consulta com PGRST201.
 */
const DETAIL_SELECT = `
  id, slug, title, description, content_type, duration_seconds, thumbnail_url,
  is_featured, published_at,
  categories ( slug, name ),
  partners ( name ),
  videos ( provider, provider_video_id, playback_url, thumbnail_url, status ),
  content_mentors ( order_index, mentors ( name, role ) ),
  modules!modules_content_id_fkey (
    title, description, order_index,
    aulas:content!content_module_id_fkey ( slug, title, module_order, duration_seconds )
  ),
  content_materials ( title, type, url, order_index )
`;

function fail(context: string, message: string): never {
  throw new Error(`Falha ao carregar ${context}: ${message}`);
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabasePublic
    .from("categories")
    .select("slug, name")
    .order("order_index", { ascending: true });

  if (error) fail("as categorias", error.message);
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabasePublic
    .from("categories")
    .select("slug, name")
    .eq("slug", slug)
    .maybeSingle();

  if (error) fail("a categoria", error.message);
  return data ?? null;
}

/**
 * Catálogo. `query` filtra por título/descrição; `category` pelo slug da
 * categoria. Só retorna publicados — o RLS já garante isso, o filtro explícito
 * deixa a intenção visível na consulta.
 */
export async function getContents(options?: {
  query?: string;
  category?: string;
  limit?: number;
}): Promise<ContentItem[]> {
  // `categories!inner` transforma o join em filtro obrigatório quando há
  // categoria. O select sai tipado como `string` de propósito: com a string
  // literal o supabase-js tenta inferir o formato da resposta e estoura o
  // limite de profundidade do TypeScript.
  const select: string = options?.category
    ? LIST_SELECT.replace("categories (", "categories!inner (")
    : LIST_SELECT;

  let request = supabasePublic
    .from("content")
    .select(select)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (options?.category) {
    request = request.eq("categories.slug", options.category);
  }

  if (options?.query) {
    const term = options.query.replace(/[%,()]/g, " ").trim();
    if (term) {
      request = request.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    }
  }

  if (options?.limit) request = request.limit(options.limit);

  const { data, error } = await request;
  if (error) fail("os conteúdos", error.message);
  return ((data ?? []) as unknown as ContentRow[]).map(toContentItem);
}

export async function getContentsByCategory(slug: string): Promise<ContentItem[]> {
  return getContents({ category: slug });
}

/** Fileira "Conteúdos em destaque" — controlada por content.is_featured. */
export async function getFeaturedContent(limit = 12): Promise<ContentItem[]> {
  const { data, error } = await supabasePublic
    .from("content")
    .select(LIST_SELECT)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) fail("os destaques", error.message);
  return ((data ?? []) as unknown as ContentRow[]).map(toContentItem);
}

/**
 * Hero da Home — controlado por featured_slots, nunca por is_featured.
 * Retorna null quando não há slot ativo ou o conteúdo apontado não está
 * publicado (nesse caso o RLS devolve o vínculo sem conteúdo).
 */
export async function getHeroContent(): Promise<ContentItem | null> {
  const { data, error } = await supabasePublic
    .from("featured_slots")
    .select(`slot, active, content ( ${LIST_SELECT} )`)
    .eq("slot", "hero")
    .eq("active", true)
    .maybeSingle();

  if (error) fail("o destaque principal", error.message);

  const row = (data as unknown as { content: ContentRow | null } | null)?.content;
  return row ? toContentItem(row) : null;
}

export async function getLives(limit = 12): Promise<ContentItem[]> {
  const { data, error } = await supabasePublic
    .from("content")
    .select(LIST_SELECT)
    .eq("status", "published")
    .eq("content_type", "live")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) fail("as lives", error.message);
  return ((data ?? []) as unknown as ContentRow[]).map(toContentItem);
}

export async function getContentBySlug(slug: string): Promise<ContentDetail | null> {
  const { data, error } = await supabasePublic
    .from("content")
    .select(DETAIL_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) fail("o conteúdo", error.message);
  if (!data) return null;

  type DetailRow = ContentRow & {
    modules?: {
      title: string;
      description: string | null;
      order_index: number;
      aulas?: {
        slug: string;
        title: string;
        module_order: number | null;
        duration_seconds: number | null;
      }[];
    }[];
    content_materials?: {
      title: string;
      type: ContentMaterial["type"];
      url: string;
      order_index: number;
    }[];
  };

  const row = data as unknown as DetailRow;

  const modules: ContentModule[] = (row.modules ?? [])
    .slice()
    .sort((a, b) => a.order_index - b.order_index)
    .map((module) => ({
      title: module.title,
      description: module.description ?? undefined,
      order: module.order_index,
      lessons: (module.aulas ?? [])
        .slice()
        .sort((a, b) => (a.module_order ?? 0) - (b.module_order ?? 0))
        .map((lesson) => ({
          slug: lesson.slug,
          title: lesson.title,
          order: lesson.module_order ?? 0,
          duration: formatDuration(lesson.duration_seconds),
        })),
    }));

  const materials: ContentMaterial[] = (row.content_materials ?? [])
    .slice()
    .sort((a, b) => a.order_index - b.order_index)
    .map((material) => ({
      title: material.title,
      type: material.type,
      url: material.url,
    }));

  const video = row.videos?.provider_video_id
    ? {
        provider: row.videos.provider as "youtube" | "cloudflare" | "vimeo" | "mux",
        providerVideoId: row.videos.provider_video_id,
        playbackUrl: row.videos.playback_url ?? undefined,
        status: row.videos.status ?? "pending",
      }
    : undefined;

  return {
    ...toContentItem(row),
    mentors: sortedMentors(row),
    video,
    modules,
    materials,
  };
}

/** Conteúdos relacionados (mesma categoria), excluindo o atual. */
export async function getRelatedContent(
  categorySlug: string | undefined,
  excludeSlug: string,
  limit = 6,
): Promise<ContentItem[]> {
  if (!categorySlug) return [];
  const items = await getContentsByCategory(categorySlug);
  return items.filter((item) => item.slug !== excludeSlug).slice(0, limit);
}

export async function getMentors(): Promise<{ name: string; role?: string }[]> {
  const { data, error } = await supabasePublic
    .from("mentors")
    .select("name, role")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) fail("os mentores", error.message);
  return (data ?? []).map((mentor) => ({
    name: mentor.name,
    role: mentor.role ?? undefined,
  }));
}

export async function getPartners(): Promise<{ name: string; logoUrl?: string }[]> {
  const { data, error } = await supabasePublic
    .from("partners")
    .select("name, logo_url")
    .order("name", { ascending: true });

  if (error) fail("os parceiros", error.message);
  return (data ?? []).map((partner) => ({
    name: partner.name,
    logoUrl: partner.logo_url ?? undefined,
  }));
}
