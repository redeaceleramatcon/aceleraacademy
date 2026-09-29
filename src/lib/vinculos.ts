import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verificarCnpjNoAdm } from "@/lib/adm";

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

export interface MembroEquipe {
  vinculoId: string;
  userId: string;
  email: string;
  nome: string | null;
  papel: "master" | "funcionario";
  criadoEm: string;
}

/**
 * Único ponto de autorização de tudo que a Fase 4 escreve: convidar/remover
 * funcionário só acontece depois que isto confirmar que quem chamou é master
 * ativo daquele CNPJ. Usa o cliente normal (RLS) — a policy "usuario le os
 * proprios vinculos" já restringe a leitura à própria linha, então isto não
 * precisa (e não deve) usar a chave de serviço.
 */
export async function ehMasterAtivo(userId: string, lojaCnpj: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("academy_vinculos")
    .select("id")
    .eq("user_id", userId)
    .eq("loja_cnpj", lojaCnpj)
    .eq("papel", "master")
    .eq("status", "ativo")
    .maybeSingle();
  return !!data;
}

/** CNPJ de um vínculo, para a rota de remoção descobrir quem precisa autorizar. */
export async function buscarLojaDoVinculo(vinculoId: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("academy_vinculos")
    .select("loja_cnpj")
    .eq("id", vinculoId)
    .maybeSingle();
  return data?.loja_cnpj ?? null;
}

/**
 * Equipe (master + funcionários ativos) de uma loja, com nome/e-mail para
 * exibição. Chame só depois de confirmar ehMasterAtivo — esta função em si
 * não reconfere autorização, só busca dado.
 */
export async function listarEquipe(lojaCnpj: string): Promise<MembroEquipe[]> {
  const supabase = createServiceClient();

  const { data: vinculos, error } = await supabase
    .from("academy_vinculos")
    .select("id, user_id, papel, criado_em")
    .eq("loja_cnpj", lojaCnpj)
    .eq("status", "ativo")
    .order("criado_em", { ascending: true });

  if (error) {
    console.error("Falha ao listar equipe:", error.message);
    return [];
  }
  if (!vinculos?.length) return [];

  const ids = vinculos.map((v) => v.user_id);

  const [{ data: profiles }, { data: usersPage, error: usersError }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").in("id", ids),
    supabase.auth.admin.listUsers({ perPage: 200 }),
  ]);
  if (usersError) console.error("Falha ao buscar e-mails da equipe:", usersError.message);

  const nomePorId = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
  const emailPorId = new Map((usersPage?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  return vinculos.map((v) => ({
    vinculoId: v.id,
    userId: v.user_id,
    email: emailPorId.get(v.user_id) ?? "",
    nome: nomePorId.get(v.user_id) ?? null,
    papel: v.papel as MembroEquipe["papel"],
    criadoEm: v.criado_em,
  }));
}

/**
 * Convida (ou vincula, se já tiver conta) um funcionário à loja. E-mail já
 * existente em auth.users não vira conta nova — só ganha o vínculo (regra:
 * "usuário existente + novo CNPJ" não duplica auth.users).
 */
export async function convidarFuncionario(
  lojaCnpj: string,
  nome: string,
  email: string,
  criadoPor: string,
): Promise<{ novoConvite: boolean }> {
  const supabase = createServiceClient();

  const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: nome ? { full_name: nome } : undefined,
  });

  let userId: string;
  let novoConvite = true;

  if (inviteError) {
    const jaExiste =
      inviteError.message.toLowerCase().includes("already") ||
      inviteError.message.toLowerCase().includes("registered");
    if (!jaExiste) {
      console.error("Falha ao convidar funcionário:", inviteError.message);
      throw inviteError;
    }

    novoConvite = false;
    const { data: usersPage, error: listError } = await supabase.auth.admin.listUsers({ perPage: 200 });
    if (listError) throw listError;
    const existente = usersPage.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!existente) throw new Error("Não encontramos a conta existente desse e-mail. Tente novamente.");
    userId = existente.id;
  } else {
    userId = inviteData.user.id;
  }

  const { error: vinculoError } = await supabase.from("academy_vinculos").insert({
    user_id: userId,
    loja_cnpj: lojaCnpj,
    papel: "funcionario",
    status: "ativo",
    origem: "cadastrado_por_master",
    criado_por: criadoPor,
  });

  if (vinculoError) {
    // unique_violation: já existe vínculo ativo desse usuário com essa loja.
    if (vinculoError.code === "23505") {
      throw new Error("Essa pessoa já faz parte da equipe desta loja.");
    }
    console.error("Falha ao criar vínculo de funcionário:", vinculoError.message);
    throw vinculoError;
  }

  return { novoConvite };
}

/**
 * Revoga o vínculo de um funcionário. Nunca mexe em vínculo de master —
 * remover o responsável não tem tela nesta fase.
 */
export async function revogarVinculoFuncionario(vinculoId: string, revogadoPor: string) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("academy_vinculos")
    .update({
      status: "revogado",
      revogado_em: new Date().toISOString(),
      revogado_por: revogadoPor,
      revogado_motivo: "manual",
    })
    .eq("id", vinculoId)
    .eq("papel", "funcionario")
    .eq("status", "ativo");

  if (error) {
    console.error("Falha ao revogar vínculo:", error.message);
    throw error;
  }
}

/**
 * Revoga TODOS os vínculos ativos de um CNPJ (master e funcionários) — usada
 * quando o ADM diz que a loja não está mais ativa. Não é o master derrubando
 * um funcionário (revogado_por fica nulo, revogado_motivo marca a origem).
 * Exportada: também é chamada pelo webhook do ADM (Fase 6), não só pela
 * revalidação de login.
 */
export async function revogarVinculosDaLoja(lojaCnpj: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("academy_vinculos")
    .update({
      status: "revogado",
      revogado_em: new Date().toISOString(),
      revogado_motivo: "adm_nao_ativo",
    })
    .eq("loja_cnpj", lojaCnpj)
    .eq("status", "ativo");

  if (error) console.error(`Falha ao revogar vínculos do CNPJ ${lojaCnpj}:`, error.message);
}

/**
 * Revalidação de login: para cada loja onde o usuário tem vínculo ativo,
 * confere no ADM se ela continua ativa. Só revoga com resposta explícita do
 * ADM — indisponibilidade não derruba ninguém (fail-open: aqui é manutenção
 * de acesso já concedido, diferente do cadastro, que é concessão nova e por
 * isso é fail-closed). Não usa `elegivel` (que também exige e-mail de
 * master) — só `ativo`, que é o único dado relevante pra manter alguém
 * logado.
 */
export async function revalidarVinculosDoUsuario(userId: string): Promise<void> {
  const supabase = createServiceClient();
  const { data: vinculos, error } = await supabase
    .from("academy_vinculos")
    .select("loja_cnpj")
    .eq("user_id", userId)
    .eq("status", "ativo");

  if (error) {
    console.error("Falha ao buscar vínculos para revalidação:", error.message);
    return;
  }
  if (!vinculos?.length) return;

  const lojasUnicas = [...new Set(vinculos.map((v) => v.loja_cnpj))];

  await Promise.all(
    lojasUnicas.map(async (lojaCnpj) => {
      const verificacao = await verificarCnpjNoAdm(lojaCnpj);
      if (verificacao.indisponivel) return;
      if (!verificacao.ativo) await revogarVinculosDaLoja(lojaCnpj);
    }),
  );
}
