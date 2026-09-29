"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { ehAdmin } from "@/lib/atividade";
import { convidarInterno, revogarVinculoInterno } from "@/lib/vinculos";

export interface ConvidarInternoState {
  error?: string;
  aviso?: string;
}

export async function convidarMembroInterno(
  _prev: ConvidarInternoState,
  formData: FormData,
): Promise<ConvidarInternoState> {
  const user = await getSessionUser();
  if (!user) return { error: "Sua sessão expirou. Entre novamente." };
  if (!(await ehAdmin(user.id))) return { error: "Você não tem acesso a esta área." };

  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Preencha o e-mail." };

  try {
    const { novoConvite } = await convidarInterno(nome, email, user.id);
    revalidatePath("/admin");
    return {
      aviso: novoConvite
        ? `Convite enviado para ${email} — a pessoa recebe um e-mail para criar a própria senha.`
        : `${email} já tinha conta na Academy — acesso interno liberado direto.`,
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Não foi possível convidar agora. Tente novamente.",
    };
  }
}

export async function removerMembroInterno(vinculoId: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Sua sessão expirou. Entre novamente.");
  if (!(await ehAdmin(user.id))) throw new Error("Você não tem acesso a esta área.");

  await revogarVinculoInterno(vinculoId, user.id);
  revalidatePath("/admin");
}
