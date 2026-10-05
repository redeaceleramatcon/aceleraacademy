-- =============================================================================
-- academy_editores — quem pode postar e gerenciar conteúdo (vídeos) sem ser
-- admin da rede.
--
-- Papel mais estreito que academy_admins: editor publica conteúdo e só isso.
-- Não vê atividade de usuários, não convida equipe, não enxerga a rede.
-- Mesmo desenho do academy_admins: allowlist, sem autocadastro, nenhuma escrita
-- liberada a anon/authenticated (entra por ação do admin com a chave de
-- serviço). A leitura da própria linha é o que deixa o app conferir o papel.
-- =============================================================================

create table public.academy_editores (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  criado_em   timestamptz not null default now(),
  criado_por  uuid references auth.users (id)
);

comment on table public.academy_editores is
  'Allowlist de quem pode cadastrar conteúdo na Academy sem ser admin. '
  'Sem autocadastro — só entra por ação de um admin com a chave de serviço.';

alter table public.academy_editores enable row level security;

create policy "usuario confere se e editor"
  on public.academy_editores for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all privileges on table public.academy_editores from anon, authenticated;
grant select on table public.academy_editores to authenticated;
