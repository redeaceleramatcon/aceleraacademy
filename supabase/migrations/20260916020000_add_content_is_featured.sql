-- =============================================================================
-- Adiciona content.is_featured.
--
-- Divisao de responsabilidades da vitrine da Home:
--   featured_slots.slot = 'hero'  -> define o Hero principal (um conteudo)
--   content.is_featured = true    -> alimenta a fileira "Conteudos em destaque"
--
-- Sao controles independentes: um conteudo pode estar no Hero, na fileira,
-- nos dois ou em nenhum. Alteracao aditiva, sem nada destrutivo.
-- =============================================================================

alter table public.content
  add column if not exists is_featured boolean not null default false;

-- Indice parcial: so indexa as poucas linhas em destaque.
create index if not exists content_is_featured_idx
  on public.content (is_featured, published_at desc)
  where is_featured;
