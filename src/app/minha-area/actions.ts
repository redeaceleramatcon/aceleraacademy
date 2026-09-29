"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

export interface TrocarSenhaState {
  error?: string;
  aviso?: string;
}

/**
 * Troca a senha de quem já está logado — Supabase Auth não pede a senha
 * antiga pra isso (a sessão válida já prova quem é a pessoa). Não depende de
 * e-mail nenhum, diferente de um fluxo de "esqueci minha senha".
 */
export async function trocarSenha(
  _prev: TrocarSenhaState,
  formData: FormData,
): Promise<TrocarSenhaState> {
  const user = await getSessionUser();
  if (!user) return { error: "Sua sessão expirou. Entre novamente." };

  const novaSenha = String(formData.get("nova_senha") ?? "");
  const confirmacao = String(formData.get("confirmar_senha") ?? "");

  if (novaSenha.length < 8) {
    return { error: "A senha precisa ter pelo menos 8 caracteres." };
  }
  if (novaSenha !== confirmacao) {
    return { error: "As senhas não coincidem." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: novaSenha });

  if (error) {
    return { error: "Não foi possível trocar a senha agora. Tente novamente." };
  }

  return { aviso: "Senha alterada com sucesso." };
}
