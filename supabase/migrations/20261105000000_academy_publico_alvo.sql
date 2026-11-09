-- =============================================================================
-- Público-alvo do conteúdo (lojista x colaborador) e papel do usuário.
--
-- Regra do dono (05/11/2026):
--  - o LOJISTA (responsável da loja) vê todos os conteúdos;
--  - o COLABORADOR (funcionário que o lojista cadastra) vê só o treinamento, nunca o
--    conteúdo feito para o proprietário da loja.
--
-- content.audience:
--   'ambos'       (padrão) — como era antes; todos que a visibilidade permitir.
--   'colaborador' — treinamento para a equipe; o lojista também vê.
--   'lojista'     — só para proprietário: nunca aparece para visitante nem para
--                   colaborador (mesmo que visibility = 'public'). Exige login como
--                   master, interno, editor ou admin.
--
-- Os vídeos que já existem ficam 'ambos' até o dono classificar (nada some de ninguém).
-- =============================================================================

alter table public.content
  add column if not exists audience text not null default 'ambos'
  check (audience in ('lojista', 'colaborador', 'ambos'));

-- Papel de quem está chamando, para a interface e para a policy de content.
-- security definer: lê as tabelas de papéis (admins/editores/vínculos) por dentro, sem
-- exigir grant ao anon; só devolve o papel do próprio auth.uid().
create or replace function public.academy_meu_papel()
returns text
language sql
stable
security definer
set search_path = ''
as $function$
  select case
    when (select auth.uid()) is null then 'visitante'
    when exists (select 1 from public.academy_admins a where a.user_id = (select auth.uid())) then 'lojista'
    when exists (select 1 from public.academy_editores e where e.user_id = (select auth.uid())) then 'lojista'
    when exists (
      select 1 from public.academy_vinculos v
      where v.user_id = (select auth.uid()) and v.status = 'ativo' and v.papel in ('master', 'interno')
    ) then 'lojista'
    when exists (
      select 1 from public.academy_vinculos v
      where v.user_id = (select auth.uid()) and v.status = 'ativo' and v.papel = 'funcionario'
    ) then 'colaborador'
    else 'visitante'
  end
$function$;

revoke all on function public.academy_meu_papel() from public;
grant execute on function public.academy_meu_papel() to anon, authenticated;

-- A policy de leitura de content ganha a regra de público-alvo.
drop policy "conteudo publicado e legivel" on public.content;

create policy "conteudo publicado e legivel"
  on public.content for select to anon, authenticated
  using (
    status = 'published'
    and (published_at is null or published_at <= now())
    and (
      visibility = 'public'
      or (
        visibility = 'associates'
        and exists (
          select 1 from public.academy_vinculos v
          where v.user_id = (select auth.uid()) and v.status = 'ativo'
        )
      )
    )
    and (audience <> 'lojista' or public.academy_meu_papel() = 'lojista')
  );
