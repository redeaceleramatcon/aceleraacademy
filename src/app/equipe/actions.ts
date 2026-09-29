"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { apenasDigitos } from "@/lib/adm";
import {
  buscarLojaDoVinculo,
  convidarFuncionario,
  ehMasterAtivo,
  revogarVinculoFuncionario,
} from "@/lib/vinculos";

export interface ConvidarState {
  error?: string;
  aviso?: string;
}

export async function convidar(_prev: ConvidarState, formData: FormData): Promise<ConvidarState> {
  const user = await getSessionUser();
  if (!user) return { error: "Sua sessão expirou. Entre novamente." };

  const lojaCnpj = apenasDigitos(String(formData.get("loja_cnpj") ?? ""));
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || lojaCnpj.length !== 14) {
    return { error: "Preencha ao menos o e-mail." };
  }

  const autorizado = await ehMasterAtivo(user.id, lojaCnpj);
  if (!autorizado) {
    return { error: "Você não é o responsável por essa loja." };
  }

  try {
    const { novoConvite } = await convidarFuncionario(lojaCnpj, nome, email, user.id);
    revalidatePath("/equipe");
    return {
      aviso: novoConvite
        ? `Convite enviado para ${email} — a pessoa recebe um e-mail para criar a própria senha.`
        : `${email} já tinha conta na Academy — acesso a esta loja liberado direto.`,
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Não foi possível convidar agora. Tente novamente.",
    };
  }
}

export async function remover(vinculoId: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Sua sessão expirou. Entre novamente.");

  const lojaCnpj = await buscarLojaDoVinculo(vinculoId);
  if (!lojaCnpj) return;

  const autorizado = await ehMasterAtivo(user.id, lojaCnpj);
  if (!autorizado) throw new Error("Você não é o responsável por essa loja.");

  await revogarVinculoFuncionario(vinculoId, user.id);
  revalidatePath("/equipe");
}
