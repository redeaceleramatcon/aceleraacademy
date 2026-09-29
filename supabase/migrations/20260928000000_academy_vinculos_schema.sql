-- =============================================================================
-- Academy — modelo de vínculo e autorização de acesso (V1)
--
-- Substitui o modelo anterior (profiles.associado_cnpj / acesso_ativo), que
-- assumia 1 CNPJ por pessoa e nunca chegou a ser aplicado neste banco.
--
-- Modelo definitivo (mais simples do que a primeira versão desta migration,
-- que ainda previa solicitação + convite por e-mail para múltiplos
-- responsáveis do ADM — descartado: só o "acesso master" de cada CNPJ cadastra
-- e remove funcionários, sempre dentro da própria Academy, sem aprovação
-- externa nem tabela de solicitação pendente):
--   - O ADM é a única fonte de verdade sobre a existência do CNPJ e o status
--     da loja. A Academy nunca guarda cópia permanente disso — não existe
--     tabela local de lojas.
--   - Exatamente 1 master por CNPJ, estabelecido quando o e-mail informado no
--     primeiro acesso bate com o e-mail do associado no ADM.
--   - O master cadastra e revoga funcionários daquele CNPJ diretamente dentro
--     da Academy — nunca por aprovação externa.
--   - 1 usuário pode ser master/funcionário de mais de uma loja ao mesmo
--     tempo (ex.: dono de duas lojas, ou funcionário de uma loja que também é
--     convidado por outra).
--
-- Nada aqui mexe em profiles, content ou content_progress — a RLS de content
-- (que hoje libera "associates" para qualquer autenticado) é ajustada em uma
-- migration futura, junto do restante do fluxo de login.
-- =============================================================================

create table public.academy_vinculos (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  loja_cnpj        text not null check (loja_cnpj ~ '^[0-9]{14}$'),
  papel            text not null check (papel in ('master', 'funcionario')),
  status           text not null default 'ativo' check (status in ('ativo', 'revogado')),
  origem           text not null
                     check (origem in ('auto_responsavel_adm', 'cadastrado_por_master')),
  -- quem praticou a ação. Nulo quando foi o próprio ADM (via e-mail batendo no
  -- primeiro acesso, ou via revogação em massa) — nunca nulo quando foi um
  -- master agindo dentro da Academy.
  criado_por       uuid references auth.users (id),
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now(),
  revogado_em      timestamptz,
  revogado_por     uuid references auth.users (id),
  revogado_motivo  text check (revogado_motivo in ('adm_nao_ativo', 'manual')),
  check (
    (origem = 'auto_responsavel_adm'   and papel = 'master'      and criado_por is null)
    or
    (origem = 'cadastrado_por_master'  and papel = 'funcionario' and criado_por is not null)
  )
);

comment on table public.academy_vinculos is
  'Vínculo ativo (ou já revogado) entre um usuário e uma loja. É a única fonte de verdade '
  'de acesso dentro da Academy — quem decide existência/status da loja continua sendo o '
  'ADM, nunca esta tabela.';
comment on column public.academy_vinculos.loja_cnpj is
  'CNPJ (somente dígitos) da loja no ADM. Texto solto, sem FK: a Academy não tem tabela '
  'própria de lojas.';
comment on column public.academy_vinculos.papel is
  'master decide quem entra/sai da equipe daquela loja (RLS abaixo); funcionario só '
  'enxerga o próprio vínculo.';

-- Só um vínculo ATIVO por par (usuário, loja); revogar não apaga a linha, então o
-- histórico de vínculos anteriores fica preservado sem precisar de tabela à parte.
create unique index academy_vinculos_ativo_uidx
  on public.academy_vinculos (user_id, loja_cnpj)
  where status = 'ativo';

-- Exatamente 1 master ativo por CNPJ — trava no banco a regra de negócio.
create unique index academy_vinculos_master_unico_uidx
  on public.academy_vinculos (loja_cnpj)
  where status = 'ativo' and papel = 'master';

create index academy_vinculos_user_id_idx on public.academy_vinculos (user_id);
-- Índice que a revogação em massa por CNPJ (Fase 6) vai usar.
create index academy_vinculos_loja_ativo_idx on public.academy_vinculos (loja_cnpj)
  where status = 'ativo';

create or replace function public.set_atualizado_em()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  new.atualizado_em = pg_catalog.now();
  return new;
end;
$function$;

create trigger academy_vinculos_set_atualizado_em before update on public.academy_vinculos
  for each row execute function public.set_atualizado_em();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
-- Nenhuma escrita é liberada ao cliente autenticado, nem para o próprio
-- master: criar um funcionário envolve convidar uma conta nova no Supabase
-- Auth (Admin API), que já exige uma rota de servidor — a mesma rota também
-- escreve o vínculo, sob uma checagem explícita de que quem chamou é master
-- ativo daquele CNPJ. Isso evita ter que reforçar por trigger quais colunas
-- um UPDATE via RLS poderia tocar.
alter table public.academy_vinculos enable row level security;

create policy "usuario le os proprios vinculos"
  on public.academy_vinculos for select to authenticated
  using ((select auth.uid()) = user_id);

-- Master enxerga a própria equipe (para a tela "minha equipe" da Fase 4).
create policy "master le os vinculos da propria loja"
  on public.academy_vinculos for select to authenticated
  using (
    exists (
      select 1 from public.academy_vinculos m
      where m.user_id = (select auth.uid())
        and m.loja_cnpj = academy_vinculos.loja_cnpj
        and m.papel = 'master'
        and m.status = 'ativo'
    )
  );

revoke all privileges on table public.academy_vinculos from anon, authenticated;
grant select on table public.academy_vinculos to authenticated;
