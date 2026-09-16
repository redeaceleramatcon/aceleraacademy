-- =============================================================================
-- Criação automática de profile para cada usuário do Supabase Auth.
--
-- O frontend nunca insere profile: quem cria é este trigger, que roda com
-- privilégio do dono da função (security definer) no momento em que o usuário
-- nasce em auth.users. Assim não é preciso chave secreta em lugar nenhum.
--
-- Nenhuma credencial é copiada para profiles — e-mail e senha continuam
-- exclusivamente sob o Supabase Auth.
-- =============================================================================

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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Usuários que já existissem antes do trigger ganham profile agora.
insert into public.profiles (id, full_name, avatar_url)
select u.id,
       nullif(u.raw_user_meta_data ->> 'full_name', ''),
       nullif(u.raw_user_meta_data ->> 'avatar_url', '')
from auth.users u
on conflict (id) do nothing;

-- Defesa em camadas: mesmo que o trigger falhe, o usuário só consegue criar
-- o profile dele mesmo — nunca o de outra pessoa.
create policy "usuario cria o proprio profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

grant insert on table public.profiles to authenticated;
