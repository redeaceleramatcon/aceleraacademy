import { getSessionProfile, displayName } from "@/lib/auth";
import { HeaderShell } from "@/components/layout/HeaderShell";

/**
 * Casca do cabeçalho com estado real de sessão.
 *
 * É um Server Component só para ler a sessão; toda a interação (scroll, menu
 * mobile, dropdown) continua no `HeaderShell`, que é cliente e não mudou de
 * aparência.
 */
export async function Header() {
  const profile = await getSessionProfile();

  return (
    <HeaderShell
      user={
        profile
          ? { name: displayName(profile), email: profile.email }
          : null
      }
    />
  );
}
