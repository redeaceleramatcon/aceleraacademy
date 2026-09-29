import { createServiceClient } from "@/lib/supabase/service";

/**
 * Registra o usuário recém-criado como master do CNPJ, sem aprovação de
 * ninguém — só é chamada depois que o e-mail já bateu com o e-mail do
 * associado devolvido pelo ADM (ver src/app/cadastro/actions.ts).
 *
 * O índice único academy_vinculos_master_unico_uidx garante 1 master ativo
 * por CNPJ mesmo sob concorrência — em caso de corrida (duas pessoas com o
 * mesmo e-mail de responsável se cadastrando ao mesmo tempo), a segunda
 * chamada falha aqui e o cadastro já criado em auth.users fica sem vínculo;
 * a pessoa loga normalmente depois, mas cai na tela de "sem acesso".
 */
export async function criarVinculoMaster(userId: string, lojaCnpj: string) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("academy_vinculos").insert({
    user_id: userId,
    loja_cnpj: lojaCnpj,
    papel: "master",
    status: "ativo",
    origem: "auto_responsavel_adm",
  });

  if (error) {
    console.error("Falha ao criar vínculo de master:", error.message);
    throw error;
  }
}
