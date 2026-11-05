/**
 * Ponte entre a Academy e o ADM (AceleraMatCon) para descobrir se um CNPJ
 * pertence a uma loja ativa da Rede (cadastro no CRM).
 *
 * Só roda no servidor: as variáveis abaixo não têm prefixo NEXT_PUBLIC_ e
 * portanto nunca chegam ao navegador.
 */
export interface VerificacaoCnpj {
  /** Status real da loja no ADM — usado sozinho na revalidação de login. */
  ativo: boolean;
  /** Loja ativa na Rede (CRM) — é o que libera o cadastro do responsável. */
  elegivel: boolean;
  nomeLoja?: string;
  /** Preenchido quando a verificação não pôde ser concluída (ADM fora do ar). */
  indisponivel?: boolean;
}

export function apenasDigitos(valor: string) {
  return valor.replace(/[^0-9]/g, "");
}

export async function verificarCnpjNoAdm(cnpjBruto: string): Promise<VerificacaoCnpj> {
  const cnpj = apenasDigitos(cnpjBruto);
  if (cnpj.length !== 14) {
    return { ativo: false, elegivel: false };
  }

  const url = process.env.ADM_VERIFY_URL;
  const segredo = process.env.ADM_VERIFY_SECRET;

  // Falha fechada: sem integração configurada, ninguém é considerado elegível.
  if (!url || !segredo) {
    console.error("Integração com o ADM não configurada (ADM_VERIFY_URL/ADM_VERIFY_SECRET).");
    return { ativo: false, elegivel: false, indisponivel: true };
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
      return { ativo: false, elegivel: false, indisponivel: resposta.status >= 500 };
    }

    const corpo = (await resposta.json()) as {
      ativo?: boolean;
      elegivel?: boolean;
      nomeLoja?: string;
    };

    const ativo = Boolean(corpo.ativo);

    if (!ativo || !corpo.elegivel) {
      return { ativo, elegivel: false };
    }

    return { ativo: true, elegivel: true, nomeLoja: corpo.nomeLoja };
  } catch (erro) {
    console.error("Falha ao falar com o ADM:", erro);
    return { ativo: false, elegivel: false, indisponivel: true };
  }
}
