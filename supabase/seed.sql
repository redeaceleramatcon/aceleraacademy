-- =============================================================================
-- Acelera Academy — seed de validacao
--
-- ATENCAO: todos os registros de conteudo abaixo sao DADOS DE TESTE.
-- Titulos comecam com "[TESTE]" e slugs com "teste-" justamente para que
-- possam ser identificados e removidos depois (ver bloco final do arquivo).
--
-- As 9 categorias NAO sao dados de teste: sao as categorias reais da Academy.
--
-- O arquivo e idempotente: pode ser reaplicado quantas vezes for preciso
-- (supabase db push --include-seed) sem duplicar nada.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Categorias reais
-- -----------------------------------------------------------------------------
insert into public.categories (slug, name, order_index) values
  ('vendas',     'Vendas',     1),
  ('gestao',     'Gestão',     2),
  ('marketing',  'Marketing',  3),
  ('compras',    'Compras',    4),
  ('financeiro', 'Financeiro', 5),
  ('pessoas',    'Pessoas',    6),
  ('lideranca',  'Liderança',  7),
  ('operacao',   'Operação',   8),
  ('tecnologia', 'Tecnologia', 9)
on conflict (slug) do update
  set name = excluded.name, order_index = excluded.order_index;

-- -----------------------------------------------------------------------------
-- Mentor, parceiro e videos de teste
-- -----------------------------------------------------------------------------
insert into public.mentors (name, slug, role, bio) values
  ('[TESTE] Mentor Academy', 'teste-mentor-academy', 'Consultor de varejo',
   'Registro de teste criado para validar a integracao com o Supabase.')
on conflict (slug) do update
  set name = excluded.name, role = excluded.role, bio = excluded.bio;

insert into public.partners (name, slug) values
  ('[TESTE] Parceiro Academy', 'teste-parceiro-academy')
on conflict (slug) do update set name = excluded.name;

insert into public.videos (provider, provider_video_id, duration_seconds, status, thumbnail_url) values
  ('youtube', 'teste-video-1', 2280, 'ready',
   'https://img.youtube.com/vi/teste-video-1/maxresdefault.jpg'),
  ('youtube', 'teste-video-2',  600, 'ready',
   'https://img.youtube.com/vi/teste-video-2/maxresdefault.jpg')
on conflict (provider, provider_video_id) do update
  set duration_seconds = excluded.duration_seconds,
      status           = excluded.status,
      thumbnail_url    = excluded.thumbnail_url;

-- -----------------------------------------------------------------------------
-- Curso de teste (recebe o modulo e as aulas)
-- -----------------------------------------------------------------------------
insert into public.content
  (slug, title, description, content_type, category_id, video_id,
   thumbnail_url, duration_seconds, status, visibility, is_featured, published_at)
values
  ('teste-curso-gestao',
   '[TESTE] Curso de Gestão',
   'Curso ficticio usado para validar curso + modulo + aulas.',
   'course',
   (select id from public.categories where slug = 'gestao'),
   (select id from public.videos where provider_video_id = 'teste-video-1'),
   'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80',
   2280, 'published', 'public', false, now())
on conflict (slug) do update
  set title = excluded.title, description = excluded.description,
      category_id = excluded.category_id, video_id = excluded.video_id,
      thumbnail_url = excluded.thumbnail_url, duration_seconds = excluded.duration_seconds,
      status = excluded.status, visibility = excluded.visibility,
      is_featured = excluded.is_featured, published_at = excluded.published_at;

insert into public.modules (content_id, title, description, order_index)
select (select id from public.content where slug = 'teste-curso-gestao'),
       '[TESTE] Módulo 1 — Fundamentos',
       'Modulo ficticio para validar o vinculo curso -> modulo -> aula.',
       1
where not exists (
  select 1 from public.modules where title = '[TESTE] Módulo 1 — Fundamentos'
);

-- -----------------------------------------------------------------------------
-- Aulas do modulo, live, entrevista e um rascunho de controle
--
-- is_featured = true alimenta a fileira "Conteudos em destaque" da Home.
-- O Hero, separadamente, vem de featured_slots (bloco final).
-- -----------------------------------------------------------------------------
insert into public.content
  (slug, title, description, content_type, category_id, partner_id, video_id,
   module_id, module_order, thumbnail_url, duration_seconds,
   status, visibility, is_featured, published_at)
values
  ('teste-aula-rotina',
   '[TESTE] Aula 1 — Rotina de gestão',
   'Primeira aula do modulo de teste.',
   'lesson',
   (select id from public.categories where slug = 'gestao'),
   null,
   (select id from public.videos where provider_video_id = 'teste-video-2'),
   (select id from public.modules where title = '[TESTE] Módulo 1 — Fundamentos'),
   1,
   'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80',
   600, 'published', 'public', true, now()),

  ('teste-aula-indicadores',
   '[TESTE] Aula 2 — Indicadores',
   'Segunda aula do modulo de teste.',
   'lesson',
   (select id from public.categories where slug = 'gestao'),
   null, null,
   (select id from public.modules where title = '[TESTE] Módulo 1 — Fundamentos'),
   2,
   'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80',
   900, 'published', 'public', false, now()),

  ('teste-live-parceiro',
   '[TESTE] Live com parceiro',
   'Valida o vinculo de conteudo com parceiro.',
   'live',
   (select id from public.categories where slug = 'marketing'),
   (select id from public.partners where slug = 'teste-parceiro-academy'),
   null, null, null,
   'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1600&q=80',
   3600, 'published', 'public', true, now()),

  ('teste-entrevista-vendas',
   '[TESTE] Entrevista sobre vendas',
   'Valida o tipo interview no catalogo.',
   'interview',
   (select id from public.categories where slug = 'vendas'),
   null, null, null, null,
   'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80',
   1500, 'published', 'public', true, now()),

  ('teste-rascunho-invisivel',
   '[TESTE] Rascunho — nao deve aparecer',
   'Registro de controle: se isto aparecer no catalogo, o filtro de status ou o RLS esta errado.',
   'lesson',
   (select id from public.categories where slug = 'vendas'),
   null, null, null, null, null, 900,
   'draft', 'public', false, null)
on conflict (slug) do update
  set title = excluded.title, description = excluded.description,
      category_id = excluded.category_id, partner_id = excluded.partner_id,
      video_id = excluded.video_id, module_id = excluded.module_id,
      module_order = excluded.module_order, thumbnail_url = excluded.thumbnail_url,
      duration_seconds = excluded.duration_seconds, status = excluded.status,
      visibility = excluded.visibility, is_featured = excluded.is_featured,
      published_at = excluded.published_at;

-- -----------------------------------------------------------------------------
-- Mentor vinculado aos conteudos publicados
-- -----------------------------------------------------------------------------
insert into public.content_mentors (content_id, mentor_id, order_index)
select c.id, m.id, 0
from public.content c
cross join public.mentors m
where m.slug = 'teste-mentor-academy'
  and c.slug in (
    'teste-curso-gestao', 'teste-aula-rotina', 'teste-aula-indicadores',
    'teste-live-parceiro', 'teste-entrevista-vendas'
  )
on conflict (content_id, mentor_id) do nothing;

-- -----------------------------------------------------------------------------
-- Materiais complementares (V1 usa apenas URLs)
-- -----------------------------------------------------------------------------
insert into public.content_materials (content_id, title, type, url, order_index)
select (select id from public.content where slug = 'teste-curso-gestao'),
       t.title, t.type::public.material_type, t.url, t.ord
from (values
  ('[TESTE] Apostila do curso',      'pdf',         'https://example.com/teste-apostila.pdf',     1),
  ('[TESTE] Planilha de indicadores','spreadsheet', 'https://example.com/teste-indicadores.xlsx', 2)
) as t(title, type, url, ord)
where not exists (
  select 1 from public.content_materials m where m.title = t.title
);

-- -----------------------------------------------------------------------------
-- Hero da Home (controle separado da fileira de destaques)
-- -----------------------------------------------------------------------------
insert into public.featured_slots (slot, content_id, active, order_index) values
  ('hero', (select id from public.content where slug = 'teste-curso-gestao'), true, 0)
on conflict (slot) do update
  set content_id = excluded.content_id,
      active     = excluded.active;

-- =============================================================================
-- Para remover os dados de teste depois (mantendo as categorias reais):
--
--   delete from public.content  where slug like 'teste-%';
--   delete from public.mentors  where slug like 'teste-%';
--   delete from public.partners where slug like 'teste-%';
--   delete from public.videos   where provider_video_id like 'teste-%';
--
-- modules, content_mentors, content_materials e featured_slots saem junto
-- por cascade a partir de content.
-- =============================================================================
