import { createServiceClient } from "@/lib/supabase/service";

/**
 * Capas dos conteúdos (bucket público "capas" do Supabase Storage). Só o servidor grava (chave de serviço),
 * depois de a ação conferir que quem chamou é admin ou editor; a leitura é pública porque a capa aparece
 * para todo mundo no catálogo.
 */

const TIPOS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export const LIMITE_CAPA_BYTES = 4 * 1024 * 1024;

/** Valida e envia a imagem; devolve a URL pública. Lança Error com mensagem em português se algo estiver errado. */
export async function enviarCapa(arquivo: File, base: string): Promise<string> {
  const extensao = TIPOS[arquivo.type];
  if (!extensao) throw new Error("A capa precisa ser uma imagem JPG, PNG ou WebP.");
  if (arquivo.size > LIMITE_CAPA_BYTES) throw new Error("A capa passou de 4 MB. Escolha uma imagem menor.");

  const seguro = base
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "capa";
  // Nome novo a cada envio: o navegador e o otimizador de imagens nunca mostram a capa antiga em cache.
  const caminho = `${seguro}-${Date.now()}.${extensao}`;

  const supabase = createServiceClient();
  const { error } = await supabase.storage.from("capas").upload(caminho, arquivo, {
    contentType: arquivo.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    console.error("Falha ao enviar capa:", error.message);
    throw new Error("Não foi possível enviar a capa agora. Tente de novo.");
  }
  return supabase.storage.from("capas").getPublicUrl(caminho).data.publicUrl;
}

/**
 * Melhor miniatura do YouTube para quando não há capa própria: a de maior resolução que realmente existe
 * (maxresdefault só existe para vídeos HD; sem isso o YouTube devolve uma imagem cinza pequena).
 */
export async function melhorMiniaturaYoutube(videoId: string): Promise<string> {
  for (const nome of ["maxresdefault", "sddefault", "hqdefault"]) {
    const url = `https://i.ytimg.com/vi/${videoId}/${nome}.jpg`;
    try {
      const r = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(4000) });
      if (r.ok) return url;
    } catch {
      // tenta a próxima
    }
  }
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Copia a miniatura ATUAL do YouTube para o bucket "capas" e devolve o endereço novo (nome diferente a cada cópia,
 * então nenhum cache mostra a imagem antiga). O YouTube não aceita parâmetro extra no endereço da miniatura
 * (devolve 404), por isso a renovação é feita copiando a imagem, e não "enfeitando" a URL.
 */
export async function copiarMiniaturaYoutube(videoId: string): Promise<string> {
  for (const nome of ["maxresdefault", "sddefault", "hqdefault"]) {
    try {
      const r = await fetch(`https://i.ytimg.com/vi/${videoId}/${nome}.jpg`, { signal: AbortSignal.timeout(8000) });
      if (!r.ok) continue;
      const bytes = await r.arrayBuffer();
      const caminho = `yt-${videoId}-${Date.now()}.jpg`;
      const supabase = createServiceClient();
      const { error } = await supabase.storage
        .from("capas")
        .upload(caminho, bytes, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
      if (error) throw error;
      return supabase.storage.from("capas").getPublicUrl(caminho).data.publicUrl;
    } catch (e) {
      console.error(`Falha ao copiar a miniatura (${nome}) de ${videoId}:`, e instanceof Error ? e.message : e);
    }
  }
  throw new Error("Não consegui buscar a miniatura no YouTube agora.");
}
