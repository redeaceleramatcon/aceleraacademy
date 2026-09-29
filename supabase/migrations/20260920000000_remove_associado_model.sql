-- =============================================================================
-- Remove o modelo antigo (profiles.associado_cnpj / acesso_ativo).
--
-- Essa versão intermediária foi aplicada direto no banco (fora do git — o
-- arquivo da migration original nunca chegou a ser commitado) e assumia 1 CNPJ
-- por pessoa. Foi substituída pelo modelo definitivo de academy_vinculos
-- (ver 20260928000000_academy_vinculos_schema.sql), que suporta N:N entre
-- usuário e loja. Plataforma ainda sem nenhum cadastro real — seguro derrubar
-- as colunas sem perda de dado.
-- =============================================================================

drop trigger if exists profiles_protege_vinculo on public.profiles;
drop function if exists public.protege_vinculo_associado();

-- Restaura handle_new_user() à versão original (20260916030000), sem o CNPJ.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;

drop index if exists public.profiles_associado_cnpj_idx;

alter table public.profiles
  drop column if exists associado_cnpj,
  drop column if exists acesso_ativo,
  drop column if exists acesso_verificado_em,
  drop column if exists acesso_revogado_em;
