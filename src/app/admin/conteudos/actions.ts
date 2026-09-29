"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { ehAdmin } from "@/lib/atividade";
import { criarConteudoYoutube, type NovoConteudoInput } from "@/lib/conteudo";

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
  if (!(await ehAdmin(user.id))) return { error: "Você não tem acesso a esta área." };

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

  try {
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
    });

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
