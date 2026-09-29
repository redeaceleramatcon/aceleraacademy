import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/** Confere via a mesma function que a RLS usa — não infere autorização por "resultado vazio". */
export async function podeVerAtividadeDe(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("pode_ver_atividade_de", { p_user_id: userId });
  if (error) {
    console.error("Falha ao checar pode_ver_atividade_de:", error.message);
    return false;
  }
  return !!data;
}

export async function ehAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.from("academy_admins").select("user_id").eq("user_id", userId).maybeSingle();
  return !!data;
}

export interface ProgressoConteudo {
  contentId: string;
  titulo: string;
  percent: number;
  completo: boolean;
  ultimoAcesso: string;
}

export interface EventoAtividade {
  tipo: string;
  pagina: string | null;
  criadoEm: string;
  detalhe: unknown;
}

export interface ResumoAtividade {
  nome: string | null;
  email: string;
  tempoUsoMinutos: number;
  ultimoAcesso: string | null;
  progresso: ProgressoConteudo[];
  eventosRecentes: EventoAtividade[];
}

/**
 * Só devolve dado depois de confirmar podeVerAtividadeDe — nunca infere
 * autorização a partir de "a consulta voltou vazia" (alguém sem nenhum
 * evento ainda registrado seria indistinguível de alguém sem permissão).
 */
export async function buscarAtividade(userId: string): Promise<ResumoAtividade | null> {
  const autorizado = await podeVerAtividadeDe(userId);
  if (!autorizado) return null;

  const supabase = await createClient();
  const service = createServiceClient();

  const [{ data: eventos }, { data: progressoRows }, { data: profile }, userAuth] = await Promise.all([
    supabase
      .from("academy_eventos")
      .select("tipo, pagina, criado_em, detalhe")
      .eq("user_id", userId)
      .order("criado_em", { ascending: false })
      .limit(200),
    supabase
      .from("content_progress")
      .select("content_id, progress_percent, completed_at, last_accessed_at")
      .eq("user_id", userId)
      .order("last_accessed_at", { ascending: false }),
    service.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
    service.auth.admin.getUserById(userId),
  ]);

  const contentIds = [...new Set((progressoRows ?? []).map((p) => p.content_id))];
  const { data: conteudos } = contentIds.length
    ? await supabase.from("content").select("id, title").in("id", contentIds)
    : { data: [] as { id: string; title: string }[] };
  const tituloPorId = new Map((conteudos ?? []).map((c) => [c.id, c.title]));

  return {
    nome: profile?.full_name ?? null,
    email: userAuth.data.user?.email ?? "",
    tempoUsoMinutos: calcularTempoUso(eventos ?? []),
    ultimoAcesso: eventos?.[0]?.criado_em ?? null,
    progresso: (progressoRows ?? []).map((p) => ({
      contentId: p.content_id,
      titulo: tituloPorId.get(p.content_id) ?? "Conteúdo removido",
      percent: p.progress_percent,
      completo: !!p.completed_at,
      ultimoAcesso: p.last_accessed_at,
    })),
    eventosRecentes: (eventos ?? []).slice(0, 50).map((e) => ({
      tipo: e.tipo,
      pagina: e.pagina,
      criadoEm: e.criado_em,
      detalhe: e.detalhe,
    })),
  };
}

/**
 * "Tempo de uso" não é gravado — é derivado somando os intervalos entre
 * eventos consecutivos, descartando gaps grandes (a pessoa fechou a aba e
 * voltou depois; sem isso, dois acessos em dias diferentes virariam um único
 * intervalo gigante).
 */
const CORTE_INATIVIDADE_MS = 5 * 60_000;

function calcularTempoUso(eventos: { criado_em: string }[]): number {
  if (eventos.length < 2) return 0;
  const asc = [...eventos].reverse(); // eventos chega desc (mais recente primeiro)
  let totalMs = 0;
  for (let i = 1; i < asc.length; i++) {
    const gap = new Date(asc[i].criado_em).getTime() - new Date(asc[i - 1].criado_em).getTime();
    if (gap > 0 && gap <= CORTE_INATIVIDADE_MS) totalMs += gap;
  }
  return Math.round(totalMs / 60_000);
}
