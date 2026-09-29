-- =============================================================================
-- Corrige recursão infinita na RLS de academy_vinculos.
--
-- A policy "master le os vinculos da propria loja" consultava academy_vinculos
-- dentro de si mesma (para saber se o chamador é master daquela loja), o que
-- faz o Postgres reavaliar a mesma policy indefinidamente — erro 42P17
-- "infinite recursion detected in policy for relation academy_vinculos",
-- descoberto testando o cadastro de ponta a ponta.
--
-- Solução padrão: mover a checagem para uma função security definer, que roda
-- com o privilégio do dono (fora do RLS de authenticated), quebrando o ciclo.
-- Mesmo padrão já usado em content_is_readable() na migration inicial.
-- =============================================================================

create or replace function public.eh_master_ativo(p_loja_cnpj text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.academy_vinculos m
    where m.user_id = auth.uid()
      and m.loja_cnpj = p_loja_cnpj
      and m.papel = 'master'
      and m.status = 'ativo'
  );
$function$;

drop policy if exists "master le os vinculos da propria loja" on public.academy_vinculos;

create policy "master le os vinculos da propria loja"
  on public.academy_vinculos for select to authenticated
  using (public.eh_master_ativo(loja_cnpj));
