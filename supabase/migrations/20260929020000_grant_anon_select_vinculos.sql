-- =============================================================================
-- Corrige "permission denied for table academy_vinculos" para o papel anon.
--
-- A policy de content (migration anterior) faz uma subquery em
-- academy_vinculos dentro do OR de visibility='associates'. Mesmo quando essa
-- branch não importa para a linha (conteúdo público, avaliado por um
-- visitante anônimo), o Postgres ainda precisa ter permissão para RODAR a
-- subquery — e academy_vinculos nunca teve grant nenhum para anon.
--
-- Seguro dar esse grant: não existe nenhuma policy "to anon" em
-- academy_vinculos, então RLS continua barrando 100% das linhas para esse
-- papel — o grant só permite que a subquery seja avaliada (e vazia), não que
-- ela devolva dado.
-- =============================================================================

grant select on table public.academy_vinculos to anon;
