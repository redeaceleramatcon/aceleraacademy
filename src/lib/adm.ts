/**
 * Ponte entre a Academy e o ADM (AceleraMatCon) para descobrir se um CNPJ
 * pertence a uma loja ativa da Rede e qual e-mail é o "acesso master" dela.
 *
 * Só roda no servidor: as variáveis abaixo não têm prefixo NEXT_PUBLIC_ e
 * portanto nunca chegam ao navegador.
 */
export interface VerificacaoCnpj {
  elegivel: boolean;
  nomeLoja?: string;
  /** E-mail do associado no ADM — vira o "acesso master" no primeiro acesso. */
  emailMaster?: string;
  /** Preenchido quando a verificação não pôde ser concluída (ADM fora do ar). */
  indisponivel?: boolean;
}

export function apenasDigitos(valor: string) {
  return valor.replace(/[^0-9]/g, "");
}

export async function verificarCnpjNoAdm(cnpjBruto: string): Promise<VerificacaoCnpj> {
  const cnpj = apenasDigitos(cnpjBruto);
  if (cnpj.length !== 14) {
    return { elegivel: false };
  }

  const url = process.env.ADM_VERIFY_URL;
  const segredo = process.env.ADM_VERIFY_SECRET;

  // Falha fechada: sem integração configurada, ninguém é considerado elegível.
  if (!url || !segredo) {
    console.error("Integração com o ADM não configurada (ADM_VERIFY_URL/ADM_VERIFY_SECRET).");
    return { elegivel: false, indisponivel: true };
  }

  try {
    const resposta = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${segredo}`,
      },
      body: JSON.stringify({ cnpj }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!resposta.ok) {
      console.error("ADM respondeu", resposta.status);
      return { elegivel: false, indisponivel: resposta.status >= 500 };
    }

    const corpo = (await resposta.json()) as {
      elegivel?: boolean;
      nomeLoja?: string;
      emailMaster?: string;
    };

    if (!corpo.elegivel || !corpo.emailMaster) {
      // Loja ativa sem e-mail cadastrado no ADM cai aqui também: bloqueia e
      // deixa a tela orientar contato com o suporte — não há pra quem mandar
      // o convite de master.
      return { elegivel: false };
    }

    return { elegivel: true, nomeLoja: corpo.nomeLoja, emailMaster: corpo.emailMaster };
  } catch (erro) {
    console.error("Falha ao falar com o ADM:", erro);
    return { elegivel: false, indisponivel: true };
  }
}
