import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { UserIcon } from "@/components/icons";
import { getSessionProfile, displayName } from "@/lib/auth";
import { signOut } from "@/app/login/actions";

/**
 * Área do associado — exige sessão.
 *
 * O proxy já barra quem não está autenticado; a verificação aqui é a garantia
 * definitiva, junto à fonte de dados.
 *
 * Progresso depende de content_progress, que ainda não foi implementado. Os
 * indicadores continuam como "—": nada nesta página finge ser dado real.
 */
export default async function MinhaAreaPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login?redirect=/minha-area");

  const nome = displayName(profile);
  const membroDesde = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : null;

  const stats = [
    { label: "Conteúdos assistidos", value: "—" },
    { label: "Tempo este mês", value: "—" },
    { label: "Trilhas em andamento", value: "—" },
  ];

  return (
    <>
      <Header />
      <main className="pt-24 sm:pt-28">
        <Container className="pb-6 pt-2 sm:pb-10 sm:pt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated ring-1 ring-white/10">
                <UserIcon className="h-7 w-7 text-muted" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">{nome}</h1>
                <p className="text-sm text-muted">{profile.email}</p>
                {membroDesde && (
                  <p className="mt-0.5 text-xs text-subtle">Associado desde {membroDesde}</p>
                )}
              </div>
            </div>

            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10"
              >
                Sair
              </button>
            </form>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="border-l-2 border-brand-blue-light pl-4">
                <p className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
                <p className="mt-1.5 text-xs uppercase tracking-wide text-subtle">{stat.label}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Continuar assistindo
          </h2>
          <div className="mt-4 rounded-2xl border border-white/10 bg-surface p-8 text-center">
            <p className="text-sm text-muted">
              Seu histórico aparece aqui assim que o acompanhamento de progresso estiver
              disponível.
            </p>
            <Link
              href="/conteudos"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-brand-blue-light/60 hover:bg-brand-blue-light/10"
            >
              Explorar conteúdos
            </Link>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
