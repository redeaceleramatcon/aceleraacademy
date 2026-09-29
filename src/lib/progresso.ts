import { createClient } from "@/lib/supabase/client";

/**
 * Grava/atualiza content_progress (existe desde a Fase 1, nunca tinha sido
 * escrito por nada). RLS já restringe insert/update à própria linha.
 *
 * `iniciar` só deve vir true na primeira chamada (video_start) — sem isso,
 * started_at nunca é sobrescrito nas atualizações seguintes (upsert só seta
 * as colunas presentes no payload).
 */
export async function atualizarProgresso(
  contentId: string,
  positionSeconds: number,
  durationSeconds: number,
  opts?: { iniciar?: boolean; completo?: boolean },
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const percent =
      durationSeconds > 0 ? Math.min(100, Math.round((positionSeconds / durationSeconds) * 100)) : 0;
    const agora = new Date().toISOString();

    const payload: Record<string, unknown> = {
      user_id: user.id,
      content_id: contentId,
      progress_percent: opts?.completo ? 100 : percent,
      position_seconds: Math.round(positionSeconds),
      last_accessed_at: agora,
    };
    if (opts?.iniciar) payload.started_at = agora;
    if (opts?.completo) payload.completed_at = agora;

    await supabase.from("content_progress").upsert(payload, { onConflict: "user_id,content_id" });
  } catch {
    // silencioso — progresso nunca deve quebrar a reprodução do vídeo
  }
}
