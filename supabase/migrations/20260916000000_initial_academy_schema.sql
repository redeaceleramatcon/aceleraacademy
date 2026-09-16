-- =============================================================================
-- Acelera Academy — schema inicial (V1)
--
-- Entidade universal de conteudo (content) + categorias, mentores, parceiros,
-- modulos, videos, materiais, progresso e curadoria de destaques.
--
-- Ordem de criacao: enums -> funcoes -> tabelas -> FK circular (content/modules)
-- -> indices -> triggers -> RLS -> grants.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Enums
-- -----------------------------------------------------------------------------
create type public.content_type as enum (
  'course', 'lesson', 'live', 'interview', 'partner', 'webinar'
);

create type public.content_status as enum ('draft', 'published', 'archived');

create type public.content_visibility as enum ('public', 'associates', 'restricted');

create type public.video_provider as enum ('youtube', 'cloudflare', 'vimeo', 'mux');

create type public.video_status as enum ('pending', 'processing', 'ready', 'error');

create type public.material_type as enum (
  'pdf', 'spreadsheet', 'presentation', 'link', 'other'
);

-- -----------------------------------------------------------------------------
-- 2. Funcao generica de updated_at
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$function$;

-- -----------------------------------------------------------------------------
-- 3. Tabelas
-- -----------------------------------------------------------------------------

-- profiles: usuario da Academy vinculado ao Supabase Auth.
-- Credenciais (email/senha) pertencem a auth.users e nao sao duplicadas aqui.
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  order_index integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.mentors (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  photo_url  text,
  bio        text,
  role       text,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.partners (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  logo_url   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- videos: desacopla o conteudo do provedor. V1 usa youtube;
-- cloudflare/vimeo/mux ja existem no enum mas nao sao implementados agora.
create table public.videos (
  id                uuid primary key default gen_random_uuid(),
  provider          public.video_provider not null default 'youtube',
  provider_video_id text not null,
  playback_url      text,
  duration_seconds  integer check (duration_seconds is null or duration_seconds >= 0),
  thumbnail_url     text,
  status            public.video_status not null default 'pending',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (provider, provider_video_id)
);

-- content: entidade universal. module_id recebe a FK depois que modules existir
-- (dependencia circular content <-> modules).
create table public.content (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  description      text,
  content_type     public.content_type not null,
  category_id      uuid references public.categories (id) on delete set null,
  partner_id       uuid references public.partners (id) on delete set null,
  video_id         uuid references public.videos (id) on delete set null,
  module_id        uuid,
  module_order     integer,
  thumbnail_url    text,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  status           public.content_status not null default 'draft',
  visibility       public.content_visibility not null default 'public',
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- modules: modulos de um curso. content_id aponta para o content do curso.
create table public.modules (
  id          uuid primary key default gen_random_uuid(),
  content_id  uuid not null references public.content (id) on delete cascade,
  title       text not null,
  description text,
  order_index integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- FK circular resolvida aqui: a aula (content_type = 'lesson') pertence a um modulo.
alter table public.content
  add constraint content_module_id_fkey
  foreign key (module_id) references public.modules (id) on delete set null;

create table public.content_mentors (
  content_id  uuid not null references public.content (id) on delete cascade,
  mentor_id   uuid not null references public.mentors (id) on delete cascade,
  order_index integer not null default 0,
  primary key (content_id, mentor_id)
);

create table public.content_materials (
  id          uuid primary key default gen_random_uuid(),
  content_id  uuid not null references public.content (id) on delete cascade,
  title       text not null,
  type        public.material_type not null default 'other',
  url         text not null,
  order_index integer not null default 0,
  created_at  timestamptz not null default now()
);

create table public.content_progress (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  content_id       uuid not null references public.content (id) on delete cascade,
  progress_percent numeric not null default 0
                     check (progress_percent >= 0 and progress_percent <= 100),
  position_seconds integer not null default 0 check (position_seconds >= 0),
  started_at       timestamptz,
  last_accessed_at timestamptz,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, content_id)
);

-- featured_slots: curadoria da vitrine. slot e unico (V1: 'hero').
-- O destaque NUNCA vem de uma flag em content.
create table public.featured_slots (
  id          uuid primary key default gen_random_uuid(),
  slot        text not null unique,
  content_id  uuid not null references public.content (id) on delete cascade,
  active      boolean not null default true,
  order_index integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 4. Indices
-- -----------------------------------------------------------------------------
create index categories_order_index_idx on public.categories (order_index);

create index content_category_id_idx  on public.content (category_id);
create index content_partner_id_idx   on public.content (partner_id);
create index content_video_id_idx     on public.content (video_id);
create index content_module_id_idx    on public.content (module_id, module_order);
create index content_status_idx       on public.content (status);
create index content_visibility_idx   on public.content (visibility);
create index content_published_at_idx on public.content (published_at desc);
-- indice composto do catalogo: o filtro mais comum da Home e das listagens
create index content_catalog_idx      on public.content (status, visibility, published_at desc);

create index modules_content_id_idx  on public.modules (content_id);
create index modules_order_index_idx on public.modules (order_index);

create index content_mentors_mentor_id_idx on public.content_mentors (mentor_id);

create index content_materials_content_id_idx on public.content_materials (content_id);

create index content_progress_user_id_idx          on public.content_progress (user_id);
create index content_progress_content_id_idx       on public.content_progress (content_id);
create index content_progress_last_accessed_at_idx on public.content_progress (last_accessed_at desc);

create index featured_slots_content_id_idx on public.featured_slots (content_id);
create index featured_slots_active_idx     on public.featured_slots (active);

-- -----------------------------------------------------------------------------
-- 5. Triggers de updated_at
-- -----------------------------------------------------------------------------
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create trigger mentors_set_updated_at before update on public.mentors
  for each row execute function public.set_updated_at();
create trigger partners_set_updated_at before update on public.partners
  for each row execute function public.set_updated_at();
create trigger videos_set_updated_at before update on public.videos
  for each row execute function public.set_updated_at();
create trigger content_set_updated_at before update on public.content
  for each row execute function public.set_updated_at();
create trigger modules_set_updated_at before update on public.modules
  for each row execute function public.set_updated_at();
create trigger content_progress_set_updated_at before update on public.content_progress
  for each row execute function public.set_updated_at();
create trigger featured_slots_set_updated_at before update on public.featured_slots
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 6. RLS
-- -----------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.categories        enable row level security;
alter table public.mentors           enable row level security;
alter table public.partners          enable row level security;
alter table public.videos            enable row level security;
alter table public.content           enable row level security;
alter table public.modules           enable row level security;
alter table public.content_mentors   enable row level security;
alter table public.content_materials enable row level security;
alter table public.content_progress  enable row level security;
alter table public.featured_slots    enable row level security;

-- Nenhuma politica de escrita e criada para o catalogo:
-- insert/update/delete so acontecem com a chave secreta (editor SQL, CLI ou o
-- futuro painel administrativo). O frontend usa a chave publicavel e so le.

-- Um conteudo e legivel quando publicado, dentro da janela de publicacao e
-- dentro da visibility permitida para quem consulta:
--   anonimo     -> public
--   autenticado -> public + associates
--   restricted  -> nunca (reservado para fases futuras)
create policy "conteudo publicado e legivel"
  on public.content for select to anon, authenticated
  using (
    status = 'published'
    and (published_at is null or published_at <= now())
    and (
      visibility = 'public'
      or (visibility = 'associates' and (select auth.uid()) is not null)
    )
  );

-- Reaproveita a politica acima: como a funcao e security invoker, um select em
-- public.content ja devolve apenas as linhas legiveis para quem chamou.
create or replace function public.content_is_readable(target uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $function$
  select exists (select 1 from public.content c where c.id = target);
$function$;

create policy "categorias sao publicas"
  on public.categories for select to anon, authenticated
  using (true);

create policy "mentor de conteudo legivel e legivel"
  on public.mentors for select to anon, authenticated
  using (
    exists (
      select 1
      from public.content_mentors cm
      where cm.mentor_id = mentors.id
        and public.content_is_readable(cm.content_id)
    )
  );

create policy "parceiro de conteudo legivel e legivel"
  on public.partners for select to anon, authenticated
  using (
    exists (select 1 from public.content c where c.partner_id = partners.id)
  );

create policy "video de conteudo legivel e legivel"
  on public.videos for select to anon, authenticated
  using (
    exists (select 1 from public.content c where c.video_id = videos.id)
  );

create policy "modulo de curso legivel e legivel"
  on public.modules for select to anon, authenticated
  using (public.content_is_readable(content_id));

create policy "mentores de conteudo legivel sao legiveis"
  on public.content_mentors for select to anon, authenticated
  using (public.content_is_readable(content_id));

create policy "materiais de conteudo legivel sao legiveis"
  on public.content_materials for select to anon, authenticated
  using (public.content_is_readable(content_id));

create policy "vitrine ativa aponta para conteudo legivel"
  on public.featured_slots for select to anon, authenticated
  using (active and public.content_is_readable(content_id));

-- profiles: cada um ve e edita apenas o proprio registro.
create policy "usuario le o proprio profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "usuario atualiza o proprio profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- content_progress: cada um le, cria e atualiza apenas o proprio progresso.
create policy "usuario le o proprio progresso"
  on public.content_progress for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "usuario cria o proprio progresso"
  on public.content_progress for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "usuario atualiza o proprio progresso"
  on public.content_progress for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- 7. Grants (o RLS acima continua decidindo linha a linha)
-- -----------------------------------------------------------------------------
grant select on
  public.categories, public.mentors, public.partners, public.videos,
  public.content, public.modules, public.content_mentors,
  public.content_materials, public.featured_slots
  to anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update on public.content_progress to authenticated;
