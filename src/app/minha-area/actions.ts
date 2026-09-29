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
    // Loga o erro real do Supabase pro Vercel (nunca aparece pro usuário) —
    // a mensagem genérica abaixo é só o fallback quando não reconhecemos o caso.
    console.error("trocarSenha: falha no supabase.auth.updateUser", error);

    if (error.message.toLowerCase().includes("different from the old password")) {
      return { error: "A nova senha precisa ser diferente da senha atual." };
    }
    if (error.message.toLowerCase().includes("should be at least")) {
      return { error: "A senha é muito curta para os critérios de segurança configurados." };
    }
    if (
      error.message.toLowerCase().includes("weak") ||
      error.message.toLowerCase().includes("easy to guess")
    ) {
      return { error: "Essa senha é considerada fraca. Escolha uma senha mais forte." };
    }
    if (error.message.toLowerCase().includes("security purposes")) {
      return { error: "Muitas tentativas seguidas. Aguarde um minuto e tente de novo." };
    }

    return { error: "Não foi possível trocar a senha agora. Tente novamente." };
  }

  return { aviso: "Senha alterada com sucesso." };
}
