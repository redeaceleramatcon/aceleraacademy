-- =============================================================================
-- Revoga o acesso do papel anon as tabelas privadas.
--
-- O RLS ja impedia qualquer linha de vazar (as politicas exigem auth.uid()),
-- mas o Supabase concede privilegios ao papel anon por padrao em tabelas novas,
-- o que fazia um select anonimo responder 200 com lista vazia em vez de recusar.
-- Esta migration deixa explicito que profiles e content_progress nao pertencem
-- ao publico anonimo — defesa em camadas, nao substituicao do RLS.
--
-- Nao altera nenhuma politica existente. O RLS continua habilitado.
-- =============================================================================

revoke all privileges on table public.profiles         from anon;
revoke all privileges on table public.content_progress from anon;

-- Garante o que o usuario autenticado precisa (idempotente com a migration inicial).
grant select, update               on table public.profiles         to authenticated;
grant select, insert, update       on table public.content_progress to authenticated;
