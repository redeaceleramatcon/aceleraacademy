"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidarVinculosDoUsuario } from "@/lib/vinculos";

export interface LoginState {
  error?: string;
}

/** Só aceita caminho interno: evita redirecionamento para domínio externo. */
function destinoSeguro(valor: string | null): string {
  if (!valor) return "/minha-area";
  if (!valor.startsWith("/") || valor.startsWith("//")) return "/minha-area";
  return valor;
}

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const destino = destinoSeguro(formData.get("redirect") as string | null);

  if (!email || !password) {
    return { error: "Informe seu e-mail e sua senha." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Mensagem genérica de propósito: não revela se o e-mail existe.
    const credenciaisInvalidas =
      error.message.toLowerCase().includes("invalid login credentials") ||
      error.status === 400;
    return {
      error: credenciaisInvalidas
        ? "E-mail ou senha incorretos."
        : "Não foi possível entrar agora. Tente novamente em instantes.",
    };
  }

  // Revalida no ADM antes de liberar a sessão — segundo canal de revogação
  // (o principal é o evento do ADM, Fase 6), sem cache: toda vez que alguém
  // loga, cada loja vinculada é reconferida.
  await revalidarVinculosDoUsuario(data.user.id);

  revalidatePath("/", "layout");
  redirect(destino);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
