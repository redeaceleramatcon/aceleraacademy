"use server";

import { getCategories, getContents } from "@/lib/data/content";

export interface ResultadoBusca {
  conteudos: { slug: string; titulo: string; categoria: string | null; tipo: string; imagem: string }[];
  categorias: { slug: string; nome: string }[];
}

/**
 * Busca rápida da paleta de comandos (Ctrl+K). Sem termo, devolve os conteúdos mais recentes e as
 * categorias, para a paleta nunca abrir vazia. Usa a mesma camada de dados do catálogo, então o RLS
 * (publicado + visibilidade) continua valendo.
 */
export async function buscarRapido(termo: string): Promise<ResultadoBusca> {
  const q = termo.trim().slice(0, 80);
  const [itens, categorias] = await Promise.all([
    getContents({ query: q || undefined, limit: q ? 6 : 4 }),
    getCategories(),
  ]);

  const filtro = q.toLowerCase();
  return {
    conteudos: itens.map((i) => ({
      slug: i.slug,
      titulo: i.title,
      categoria: i.categoryName ?? null,
      tipo: i.type,
      imagem: i.image,
    })),
    categorias: categorias
      .filter((c) => !filtro || c.name.toLowerCase().includes(filtro))
      .slice(0, 6)
      .map((c) => ({ slug: c.slug, nome: c.name })),
  };
}
