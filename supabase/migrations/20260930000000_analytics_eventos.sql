-- =============================================================================
-- Analytics: admin da rede, eventos-chave e leitura de atividade por usuário.
--
-- Duas peças novas:
--   - academy_admins: allowlist simples de quem enxerga a rede inteira (time
--     Acelera Matcon). Sem autocadastro — só entra por ação direta no banco
--     (mesmo espírito de academy_vinculos: nenhuma escrita liberada a
--     authenticated).
--   - academy_eventos: log de eventos-chave (não every-click — página vista,
--     vídeo iniciado/pausado/concluído, clique em CTA importante, heartbeat de
--     presença). "Tempo de uso" não é uma coluna própria: é calculado na
--     leitura, agrupando eventos consecutivos do mesmo usuário com um corte de
--     inatividade — evita ter que administrar limite de sessão na escrita.
--
-- content_progress (quanto já assistiu) já existe desde a Fase 1 — só nunca
-- foi escrito por nada. Esta migration não mexe nela, só na leitura de quem
-- pode ver o progresso de quem (função pode_ver_eventos_de, reaproveitada
-- pelas páginas de relatório para content_progress também).
-- =============================================================================

create table public.academy_admins (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  criado_em   timestamptz not null default now(),
  criado_por  uuid references auth.users (id)
);

comment on table public.academy_admins is
  'Allowlist de quem vê a rede inteira nos relatórios (time Acelera Matcon). '
  'Sem autocadastro — só entra por ação direta no banco.';

alter table public.academy_admins enable row level security;

create policy "usuario confere se e admin"
  on public.academy_admins for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all privileges on table public.academy_admins from anon, authenticated;
grant select on table public.academy_admins to authenticated;

-- -----------------------------------------------------------------------------
-- academy_eventos
-- -----------------------------------------------------------------------------
create table public.academy_eventos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  tipo        text not null check (
                tipo in ('page_view', 'heartbeat', 'video_start', 'video_pause', 'video_complete', 'cta_click')
              ),
  pagina      text,
  content_id  uuid references public.content (id) on delete set null,
  detalhe     jsonb,
  criado_em   timestamptz not null default now()
);

comment on table public.academy_eventos is
  'Eventos-chave de uso (não every-click): página vista, progresso de vídeo, '
  'CTAs importantes, presença (heartbeat). "Tempo de uso" é derivado na '
  'leitura agrupando eventos próximos no tempo — não existe conceito de '
  'sessão gravado.';

create index academy_eventos_user_criado_idx on public.academy_eventos (user_id, criado_em desc);
create index academy_eventos_content_idx on public.academy_eventos (content_id) where content_id is not null;

-- -----------------------------------------------------------------------------
-- Autorização de leitura — mesma pergunta pra academy_eventos e content_progress:
-- "quem pode ver a atividade do usuário X?" — o próprio X, um admin, ou o
-- master de uma loja onde X também tem vínculo ativo. security definer pra não
-- reavaliar RLS de academy_vinculos recursivamente (mesmo motivo da correção
-- em eh_master_ativo).
-- -----------------------------------------------------------------------------
create or replace function public.pode_ver_atividade_de(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select
    (select auth.uid()) = p_user_id
    or exists (select 1 from public.academy_admins a where a.user_id = (select auth.uid()))
    or exists (
      select 1
      from public.academy_vinculos m
      join public.academy_vinculos alvo on alvo.loja_cnpj = m.loja_cnpj
      where m.user_id = (select auth.uid())
        and m.papel = 'master'
        and m.status = 'ativo'
        and alvo.user_id = p_user_id
        and alvo.status = 'ativo'
    );
$function$;

alter table public.academy_eventos enable row level security;

create policy "usuario grava os proprios eventos"
  on public.academy_eventos for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "quem pode ver a atividade consulta os eventos"
  on public.academy_eventos for select to authenticated
  using (public.pode_ver_atividade_de(user_id));

revoke all privileges on table public.academy_eventos from anon, authenticated;
grant select, insert on table public.academy_eventos to authenticated;

-- -----------------------------------------------------------------------------
-- content_progress ganha a mesma regra de leitura (admin/master também veem);
-- escrita continua só o próprio dono, como já era.
-- -----------------------------------------------------------------------------
drop policy if exists "usuario le o proprio progresso" on public.content_progress;

create policy "quem pode ver a atividade consulta o progresso"
  on public.content_progress for select to authenticated
  using (public.pode_ver_atividade_de(user_id));
