"use server";

import { revalidatePath, updateTag } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { podePublicarConteudo } from "@/lib/atividade";
import { enviarCapa } from "@/lib/capas";
import { criarConteudoYoutube, definirCapa, renovarMiniaturasYoutube, type NovoConteudoInput } from "@/lib/conteudo";

export interface NovoConteudoState {
  error?: string;
  aviso?: string;
  slug?: string;
}

const TIPOS_VALIDOS: NovoConteudoInput["contentType"][] = [
  "course",
  "lesson",
  "live",
  "interview",
  "partner",
  "webinar",
];

export async function criarConteudo(
  _prev: NovoConteudoState,
  formData: FormData,
): Promise<NovoConteudoState> {
  const user = await getSessionUser();
  if (!user) return { error: "Sua sessão expirou. Entre novamente." };
  if (!(await podePublicarConteudo(user.id))) return { error: "Você não tem acesso a esta área." };

  const youtubeUrl = String(formData.get("youtube_url") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categorySlug = String(formData.get("category_slug") ?? "").trim();
  const contentType = String(formData.get("content_type") ?? "").trim();
  const visibility = formData.get("visibility") === "associates" ? "associates" : "public";
  const mentorId = String(formData.get("mentor_id") ?? "").trim();
  const mentorNomeNovo = String(formData.get("mentor_nome_novo") ?? "").trim();
  const publicarAgora = formData.get("publicar_agora") === "on";
  const featured = formData.get("featured") === "on";

  if (!youtubeUrl) return { error: "Cole o link do vídeo no YouTube." };
  if (!title) return { error: "Preencha o título." };
  if (!categorySlug) return { error: "Escolha uma categoria." };
  if (!TIPOS_VALIDOS.includes(contentType as NovoConteudoInput["contentType"])) {
    return { error: "Escolha um tipo de conteúdo válido." };
  }

  const capa = formData.get("capa");
  const arquivoCapa = capa instanceof File && capa.size > 0 ? capa : null;

  try {
    const capaUrl = arquivoCapa ? await enviarCapa(arquivoCapa, title) : undefined;
    const { slug } = await criarConteudoYoutube({
      youtubeUrl,
      title,
      description,
      categorySlug,
      contentType: contentType as NovoConteudoInput["contentType"],
      visibility,
      mentorId: mentorId || undefined,
      mentorNomeNovo: mentorNomeNovo || undefined,
      publicarAgora,
      featured,
      capaUrl,
    });

    updateTag("catalogo"); // o cache do catálogo expira já: quem publicou vê o conteúdo na hora
    revalidatePath("/conteudos");
    revalidatePath(`/categorias/${categorySlug}`);
    revalidatePath("/");
    revalidatePath("/admin/conteudos/novo");

    return {
      aviso: publicarAgora
        ? "Conteúdo publicado com sucesso."
        : "Conteúdo salvo como rascunho — ainda não aparece pra ninguém.",
      slug,
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Não foi possível criar o conteúdo agora. Tente novamente.",
    };
  }
}

export interface TrocarCapaState {
  error?: string;
  aviso?: string;
  /** URL nova, para a linha já mostrar a capa trocada sem esperar o cache do catálogo. */
  capaUrl?: string;
}

/** Troca a capa de um conteúdo que já existe (admin ou editor). */
export async function trocarCapa(
  contentId: string,
  _prev: TrocarCapaState,
  formData: FormData,
): Promise<TrocarCapaState> {
  const user = await getSessionUser();
  if (!user) return { error: "Sua sessão expirou. Entre novamente." };
  if (!(await podePublicarConteudo(user.id))) return { error: "Você não tem acesso a esta área." };

  const capa = formData.get("capa");
  if (!(capa instanceof File) || capa.size === 0) return { error: "Escolha uma imagem para a capa." };

  try {
    const url = await enviarCapa(capa, `capa-${contentId.slice(0, 8)}`);
    await definirCapa(contentId, url);
    updateTag("catalogo"); // cards, Hero e busca mostram a capa nova na hora
    revalidatePath("/");
    revalidatePath("/conteudos");
    revalidatePath("/admin/conteudos");
    return { aviso: "Capa atualizada.", capaUrl: url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Não foi possível trocar a capa agora. Tente novamente." };
  }
}

export interface RenovarState {
  error?: string;
  aviso?: string;
}

/** Busca de novo a miniatura do YouTube de um vídeo (`contentId`) ou de todos (`null`). */
export async function renovarMiniaturas(contentId: string | null): Promise<RenovarState> {
  const user = await getSessionUser();
  if (!user) return { error: "Sua sessão expirou. Entre novamente." };
  if (!(await podePublicarConteudo(user.id))) return { error: "Você não tem acesso a esta área." };

  try {
    const n = await renovarMiniaturasYoutube(contentId ?? undefined);
    updateTag("catalogo");
    revalidatePath("/");
    revalidatePath("/conteudos");
    revalidatePath("/admin/conteudos");
    return { aviso: n === 1 ? "Miniatura renovada." : `${n} miniaturas renovadas a partir do YouTube.` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Não foi possível renovar agora. Tente novamente." };
  }
}
