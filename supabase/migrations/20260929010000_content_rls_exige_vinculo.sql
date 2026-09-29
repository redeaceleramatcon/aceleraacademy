-- =============================================================================
-- RLS de content: "associates" passa a exigir vínculo ativo, não só sessão.
--
-- A policy original (migration inicial) liberava visibility='associates' para
-- qualquer `auth.uid() is not null` — ou seja, um funcionário removido pelo
-- master, ou uma loja revogada pelo ADM, continuava lendo conteúdo de
-- associado enquanto a sessão do Supabase não expirasse. Esse gap foi
-- identificado na auditoria inicial deste projeto e fica corrigido aqui,
-- junto do resto da Fase 5 (login revalidando o ADM).
--
-- content_progress não muda: já é só leitura/escrita da própria linha, e o
-- acesso ao conteúdo referenciado já é filtrado por esta policy.
-- =============================================================================

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
  );
