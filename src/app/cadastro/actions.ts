"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { apenasDigitos, verificarCnpjNoAdm } from "@/lib/adm";
import { criarVinculoMaster } from "@/lib/vinculos";

export interface SignUpState {
  error?: string;
  aviso?: string;
}

/**
 * Cadastro do "acesso master": só quem tem o e-mail cadastrado como
 * responsável do CNPJ no ADM consegue se cadastrar por aqui — não existe
 * aprovação nem solicitação. Quem não é o responsável não se auto-cadastra;
 * pede para o master da loja te cadastrar como funcionário dentro da Academy.
 */
export async function signUp(_prev: SignUpState, formData: FormData): Promise<SignUpState> {
  const nome = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("password") ?? "");
  const cnpj = apenasDigitos(String(formData.get("cnpj") ?? ""));

  if (!email || !senha || !cnpj) {
    return { error: "Preencha CNPJ, e-mail e senha." };
  }
  if (senha.length < 8) {
    return { error: "A senha precisa ter pelo menos 8 caracteres." };
  }
  if (cnpj.length !== 14) {
    return { error: "O CNPJ precisa ter 14 dígitos." };
  }

  const verificacao = await verificarCnpjNoAdm(cnpj);

  if (verificacao.indisponivel) {
    return {
      error: "Não conseguimos confirmar seu cadastro agora. Tente novamente em instantes.",
    };
  }

  // Mesma mensagem para CNPJ não encontrado, loja inativa e e-mail que não é o
  // responsável — evita que alguém descubra, tentando um a um, quais CNPJs
  // pertencem à Rede ou quem é o responsável de cada um.
  const mensagemNaoElegivel =
    "Não encontramos uma loja ativa da Rede com o e-mail de responsável informado. " +
    "Confira o CNPJ e o e-mail cadastrado como responsável no ADM — ou, se você é " +
    "funcionário, peça para o responsável da loja te cadastrar dentro da Academy.";

  if (!verificacao.elegivel || !verificacao.emailMaster) {
    return { error: mensagemNaoElegivel };
  }
  if (verificacao.emailMaster.trim().toLowerCase() !== email) {
    return { error: mensagemNaoElegivel };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: nome ? { full_name: nome } : undefined,
    },
  });

  if (error) {
    console.error("Falha no signUp:", error.status, error.message);
    const jaCadastrado =
      error.message.toLowerCase().includes("already") ||
      error.message.toLowerCase().includes("registered");
    return {
      error: jaCadastrado
        ? "Já existe uma conta com esse e-mail. Use a tela de entrada."
        : "Não foi possível concluir o cadastro agora. Tente novamente em instantes.",
    };
  }

  if (!data.user) {
    return { error: "Não foi possível concluir o cadastro agora. Tente novamente em instantes." };
  }

  try {
    await criarVinculoMaster(data.user.id, cnpj);
  } catch {
    // A conta já existe em auth.users mesmo se isto falhar (ex.: corrida com
    // outro cadastro para o mesmo CNPJ — só um master por loja). A pessoa
    // consegue logar depois; sem vínculo, cai na tela de "sem acesso" e pode
    // procurar o suporte em vez de ficar com um erro sem explicação aqui.
    return {
      error:
        "Sua conta foi criada, mas não conseguimos vincular a loja agora. Tente entrar mais tarde ou fale com o suporte.",
    };
  }

  // Sem sessão significa que o projeto exige confirmação por e-mail.
  if (!data.session) {
    return {
      aviso: `Cadastro criado para ${
        verificacao.nomeLoja ?? "sua loja"
      }. Enviamos um e-mail de confirmação — confirme o endereço para entrar na Academy.`,
    };
  }

  revalidatePath("/", "layout");
  redirect("/minha-area");
}
