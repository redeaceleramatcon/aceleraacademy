import { timingSafeEqual, createHmac } from "node:crypto";
import { revogarVinculosDaLoja } from "@/lib/vinculos";
import { apenasDigitos } from "@/lib/adm";

/**
 * Recebe do ADM o aviso de que uma loja mudou de status — chamado por um
 * trigger em `empresas` via pg_net, não por uma pessoa. Fase 6: complementa a
 * revalidação no login (Fase 5) com revogação quase imediata, sem esperar a
 * próxima vez que alguém da loja entrar.
 *
 * Assinatura HMAC sobre uma string simples e concatenada (timestamp.cnpj.status),
 * não sobre o JSON serializado — evita o problema clássico de webhook em que o
 * remetente (aqui, uma function PL/pgSQL) e o receptor formatam o mesmo JSON de
 * jeitos byte-a-byte diferentes e a assinatura nunca bate.
 *
 * Reativação ('ativo') não faz nada aqui de propósito: a V1 não reativa vínculo
 * revogado automaticamente (decisão fechada na especificação) — quem readquire
 * acesso passa pelo cadastro/convite de novo.
 */

const JANELA_TIMESTAMP_SEGUNDOS = 5 * 60;

function assinaturaValida(timestamp: string, cnpj: string, status: string, segredo: string, recebida: string) {
  const esperada = createHmac("sha256", segredo).update(`${timestamp}.${cnpj}.${status}`).digest("hex");
  const a = Buffer.from(esperada);
  const b = Buffer.from(recebida);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const segredo = process.env.ADM_REVOKE_SECRET;
  if (!segredo) {
    console.error("ADM_REVOKE_SECRET não configurado — endpoint bloqueado (fail-closed).");
    return Response.json({ erro: "nao_configurado" }, { status: 503 });
  }

  const assinaturaRecebida = request.headers.get("x-academy-signature") ?? "";

  let corpo: { cnpj?: string; status?: string; timestamp?: number };
  try {
    corpo = await request.json();
  } catch {
    return Response.json({ erro: "corpo_invalido" }, { status: 400 });
  }

  const cnpj = apenasDigitos(String(corpo.cnpj ?? ""));
  const status = String(corpo.status ?? "").trim().toLowerCase();
  const timestamp = Number(corpo.timestamp);

  if (cnpj.length !== 14 || !status || !Number.isFinite(timestamp)) {
    return Response.json({ erro: "corpo_invalido" }, { status: 400 });
  }

  // Anti-replay: rejeita eventos velhos (ou com relógio muito adiantado).
  const agora = Math.floor(Date.now() / 1000);
  if (Math.abs(agora - timestamp) > JANELA_TIMESTAMP_SEGUNDOS) {
    return Response.json({ erro: "timestamp_expirado" }, { status: 401 });
  }

  if (!assinaturaValida(String(corpo.timestamp), cnpj, status, segredo, assinaturaRecebida)) {
    return Response.json({ erro: "assinatura_invalida" }, { status: 401 });
  }

  // 'ativo' não reativa nada (V1 não reativa vínculo revogado automaticamente).
  // Qualquer outro status revoga — idempotente: rodar de novo só afeta 0 linhas.
  if (status !== "ativo") {
    await revogarVinculosDaLoja(cnpj);
  }

  return Response.json({ ok: true });
}
