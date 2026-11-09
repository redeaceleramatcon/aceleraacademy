import { getPerfilCabecalho, getVerComoColaborador } from "@/lib/auth";
import { FaixaVerComo } from "@/components/layout/FaixaVerComo";
import { HeaderShell } from "@/components/layout/HeaderShell";

/**
 * Casca do cabeçalho com estado real de sessão.
 *
 * É um Server Component só para ler a sessão; toda a interação (scroll, menu
 * mobile, dropdown) continua no `HeaderShell`, que é cliente e não mudou de
 * aparência. Usa a leitura rápida (token conferido localmente + uma consulta
 * ao perfil): o cabeçalho só exibe nome e e-mail, não decide acesso.
 */
export async function Header() {
  const [perfil, verComoColaborador] = await Promise.all([getPerfilCabecalho(), getVerComoColaborador()]);

  return (
    <>
      <HeaderShell user={perfil} />
      {verComoColaborador && <FaixaVerComo />}
    </>
  );
}
