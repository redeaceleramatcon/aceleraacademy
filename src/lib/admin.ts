import { createServiceClient } from "@/lib/supabase/service";

export interface UsuarioDaRede {
  userId: string;
  email: string;
  nome: string | null;
  lojaCnpj: string;
  papel: "master" | "funcionario";
}

export interface MembroInterno {
  vinculoId: string;
  userId: string;
  email: string;
  nome: string | null;
}

async function enriquecerComPerfil(
  service: ReturnType<typeof createServiceClient>,
  ids: string[],
): Promise<{ nomePorId: Map<string, string | null>; emailPorId: Map<string, string> }> {
  const [{ data: profiles }, { data: usersPage, error: usersError }] = await Promise.all([
    service.from("profiles").select("id, full_name").in("id", ids),
    service.auth.admin.listUsers({ perPage: 200 }),
  ]);
  if (usersError) console.error("Falha ao buscar e-mails:", usersError.message);

  return {
    nomePorId: new Map((profiles ?? []).map((p) => [p.id, p.full_name])),
    emailPorId: new Map((usersPage?.users ?? []).map((u) => [u.id, u.email ?? ""])),
  };
}

/**
 * Todos os usuários com vínculo a alguma loja, de todas as lojas — só para
 * quem já passou por ehAdmin() antes de chamar isto. Usa a chave de serviço
 * porque admin não tem (nem deveria ter, via RLS) visibilidade ampla de
 * academy_vinculos — a autorização é decidida em código, não em policy.
 * Não traz vínculo interno (loja_cnpj nulo) — ver listarEquipeInterna.
 */
export async function listarTodosUsuarios(): Promise<UsuarioDaRede[]> {
  const service = createServiceClient();

  const { data: vinculos, error } = await service
    .from("academy_vinculos")
    .select("user_id, loja_cnpj, papel")
    .eq("status", "ativo")
    .not("loja_cnpj", "is", null)
    .order("loja_cnpj");

  if (error) {
    console.error("Falha ao listar usuários da rede:", error.message);
    return [];
  }
  if (!vinculos?.length) return [];

  const ids = [...new Set(vinculos.map((v) => v.user_id))];
  const { nomePorId, emailPorId } = await enriquecerComPerfil(service, ids);

  return vinculos.map((v) => ({
    userId: v.user_id,
    email: emailPorId.get(v.user_id) ?? "",
    nome: nomePorId.get(v.user_id) ?? null,
    lojaCnpj: v.loja_cnpj as string,
    papel: v.papel as UsuarioDaRede["papel"],
  }));
}

/** Equipe interna (papel='interno', sem loja nenhuma) — só para quem já passou por ehAdmin(). */
export async function listarEquipeInterna(): Promise<MembroInterno[]> {
  const service = createServiceClient();

  const { data: vinculos, error } = await service
    .from("academy_vinculos")
    .select("id, user_id")
    .eq("status", "ativo")
    .eq("papel", "interno")
    .order("criado_em");

  if (error) {
    console.error("Falha ao listar equipe interna:", error.message);
    return [];
  }
  if (!vinculos?.length) return [];

  const ids = [...new Set(vinculos.map((v) => v.user_id))];
  const { nomePorId, emailPorId } = await enriquecerComPerfil(service, ids);

  return vinculos.map((v) => ({
    vinculoId: v.id,
    userId: v.user_id,
    email: emailPorId.get(v.user_id) ?? "",
    nome: nomePorId.get(v.user_id) ?? null,
  }));
}
