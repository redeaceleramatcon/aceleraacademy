/** Rótulos de tipo usados pela interface (o banco guarda em inglês). */
export type ContentType =
  | "curso"
  | "aula"
  | "entrevista"
  | "live"
  | "parceiro"
  | "webinar";

export interface Category {
  slug: string;
  name: string;
}

/**
 * Formato que os componentes visuais consomem.
 *
 * A camada de dados (`src/lib/data/content.ts`) converte as linhas do Supabase
 * para cá, de modo que nenhum componente precise conhecer nomes de colunas,
 * enums em inglês ou duração em segundos.
 */
export interface ContentItem {
  /** Identificador interno do banco. Não aparece em URLs. */
  uuid: string;
  /** Identificador usado nas URLs: /conteudos/[slug]. */
  slug: string;
  title: string;
  description: string;
  mentor?: string;
  category?: string;
  categoryName?: string;
  type: ContentType;
  /** Já formatada para exibição: "38 min", "2h 40min". */
  duration: string;
  image: string;
  partner?: string;
  progress?: number;
  featured?: boolean;
}

export interface ContentVideo {
  provider: "youtube" | "cloudflare" | "vimeo" | "mux";
  providerVideoId: string;
  playbackUrl?: string;
  status: string;
}

export interface ContentLesson {
  slug: string;
  title: string;
  order: number;
  duration: string;
}

export interface ContentModule {
  title: string;
  description?: string;
  order: number;
  lessons: ContentLesson[];
}

export interface ContentMaterial {
  title: string;
  type: "pdf" | "spreadsheet" | "presentation" | "link" | "other";
  url: string;
}

/** Conteúdo completo da página de detalhe. */
export interface ContentDetail extends ContentItem {
  mentors: { name: string; role?: string }[];
  video?: ContentVideo;
  modules: ContentModule[];
  materials: ContentMaterial[];
}
