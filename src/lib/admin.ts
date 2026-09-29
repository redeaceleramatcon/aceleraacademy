import { createServiceClient } from "@/lib/supabase/service";

export interface UsuarioDaRede {
  userId: string;
  email: string;
  nome: string | null;
  lojaCnpj: string;
  papel: "master" | "funcionario";
}

/**
 * Todos os usuários com vínculo ativo, de todas as lojas — só para quem já
 * passou por ehAdmin() antes de chamar isto. Usa a chave de serviço porque
 * admin não tem (nem deveria ter, via RLS) visibilidade ampla de
 * academy_vinculos — a autorização é decidida em código, não em policy.
 */
export async function listarTodosUsuarios(): Promise<UsuarioDaRede[]> {
  const service = createServiceClient();

  const { data: vinculos, error } = await service
    .from("academy_vinculos")
    .select("user_id, loja_cnpj, papel")
    .eq("status", "ativo")
    .order("loja_cnpj");

  if (error) {
    console.error("Falha ao listar usuários da rede:", error.message);
    return [];
  }
  if (!vinculos?.length) return [];

  const ids = [...new Set(vinculos.map((v) => v.user_id))];
  const [{ data: profiles }, { data: usersPage, error: usersError }] = await Promise.all([
    service.from("profiles").select("id, full_name").in("id", ids),
    service.auth.admin.listUsers({ perPage: 200 }),
  ]);
  if (usersError) console.error("Falha ao buscar e-mails da rede:", usersError.message);

  const nomePorId = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
  const emailPorId = new Map((usersPage?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  return vinculos.map((v) => ({
    userId: v.user_id,
    email: emailPorId.get(v.user_id) ?? "",
    nome: nomePorId.get(v.user_id) ?? null,
    lojaCnpj: v.loja_cnpj,
    papel: v.papel as UsuarioDaRede["papel"],
  }));
}
