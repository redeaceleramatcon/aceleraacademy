-- =============================================================================
-- Vínculo "interno": conta criada pelo admin, sem CNPJ nenhum por trás.
--
-- Caso de uso: time da Acelera Matcon (treinamento, suporte, conteúdo) que
-- precisa acessar a Academy sem estar amarrado a nenhuma loja do ADM. Até
-- aqui, todo academy_vinculos exigia loja_cnpj — este é o primeiro tipo de
-- vínculo que não tem CNPJ nenhum de verdade por trás.
--
-- Consequência importante: revalidarVinculosDoUsuario (Fase 5, login) precisa
-- pular vínculos com loja_cnpj nulo — não existe CNPJ pra perguntar ao ADM se
-- "continua ativo". Um vínculo interno só sai do ar se um admin revogar na
-- mão; não expira sozinho, não é revalidado.
-- =============================================================================

alter table public.academy_vinculos alter column loja_cnpj drop not null;

alter table public.academy_vinculos drop constraint if exists academy_vinculos_papel_check;
alter table public.academy_vinculos add constraint academy_vinculos_papel_check
  check (papel in ('master', 'funcionario', 'interno'));

alter table public.academy_vinculos drop constraint if exists academy_vinculos_origem_check;
alter table public.academy_vinculos add constraint academy_vinculos_origem_check
  check (origem in ('auto_responsavel_adm', 'cadastrado_por_master', 'cadastrado_por_admin'));

alter table public.academy_vinculos drop constraint if exists academy_vinculos_check;
alter table public.academy_vinculos add constraint academy_vinculos_check
  check (
    (origem = 'auto_responsavel_adm'  and papel = 'master'      and criado_por is null     and loja_cnpj is not null)
    or
    (origem = 'cadastrado_por_master' and papel = 'funcionario' and criado_por is not null  and loja_cnpj is not null)
    or
    (origem = 'cadastrado_por_admin'  and papel = 'interno'     and criado_por is not null  and loja_cnpj is null)
  );

-- unique parcial já existente (user_id, loja_cnpj) where status='ativo' não
-- protege duplicata quando loja_cnpj é null (NULL nunca é igual a NULL num
-- índice único) — cobre esse caso à parte.
create unique index academy_vinculos_interno_ativo_uidx
  on public.academy_vinculos (user_id)
  where status = 'ativo' and loja_cnpj is null;
