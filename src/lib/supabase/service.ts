import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente com a chave de serviço — ignora RLS por completo.
 *
 * academy_vinculos não concede nenhum insert/update a authenticated/anon de
 * propósito (ver migration academy_vinculos_schema): criar ou revogar vínculo
 * sempre depende de uma decisão que só o servidor pode validar (resposta do
 * ADM, ou "quem chamou é master ativo desta loja"), então a escrita nunca
 * acontece via RLS — sempre por aqui, e só a partir de código que já rodou
 * essa validação antes de chamar este cliente.
 *
 * Nunca importar este módulo em código que possa rodar no navegador —
 * SUPABASE_SERVICE_ROLE_KEY não tem prefixo NEXT_PUBLIC_ de propósito.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_URL não configurados.");
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
