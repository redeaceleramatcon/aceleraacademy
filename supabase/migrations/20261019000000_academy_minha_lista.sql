-- =============================================================================
-- academy_minha_lista — conteúdos que a pessoa salvou para ver depois ("Minha lista").
--
-- Cada pessoa lê, adiciona e remove apenas as próprias linhas (RLS por auth.uid()).
-- Nada é exposto a anon. Sai junto se o usuário ou o conteúdo forem apagados (cascade).
-- =============================================================================

create table public.academy_minha_lista (
  user_id     uuid not null references auth.users (id) on delete cascade,
  content_id  uuid not null references public.content (id) on delete cascade,
  criado_em   timestamptz not null default now(),
  primary key (user_id, content_id)
);

create index academy_minha_lista_user_idx on public.academy_minha_lista (user_id, criado_em desc);

comment on table public.academy_minha_lista is
  'Conteúdos salvos pelo próprio usuário (Minha lista). Só o dono lê e altera.';

alter table public.academy_minha_lista enable row level security;

create policy "usuario le a propria lista"
  on public.academy_minha_lista for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "usuario adiciona na propria lista"
  on public.academy_minha_lista for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "usuario remove da propria lista"
  on public.academy_minha_lista for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all privileges on table public.academy_minha_lista from anon, authenticated;
grant select, insert, delete on table public.academy_minha_lista to authenticated;
