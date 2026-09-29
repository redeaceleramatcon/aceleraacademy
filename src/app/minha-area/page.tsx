import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { UserIcon } from "@/components/icons";
import { getSessionProfile, displayName } from "@/lib/auth";
import { ehAdmin } from "@/lib/atividade";
import { signOut } from "@/app/login/actions";
import { TrocarSenhaForm } from "./TrocarSenhaForm";

/**
 * Área do associado — exige sessão e pelo menos um vínculo ativo.
 *
 * O proxy já barra quem não está autenticado; a verificação aqui é a garantia
 * definitiva, junto à fonte de dados. Sem nenhum academy_vinculos ativo (loja
 * revogada pelo ADM, ou funcionário removido pelo master), a página mostra o
 * aviso de acesso indisponível em vez de conteúdo de associado.
 *
 * Progresso depende de content_progress, que ainda não foi implementado. Os
 * indicadores continuam como "—": nada nesta página finge ser dado real.
 */
export default async function MinhaAreaPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login?redirect=/minha-area");

  const nome = displayName(profile);
  const ehMaster = profile.vinculos.some((v) => v.papel === "master");
  const admin = await ehAdmin(profile.id);

  // Admin sem nenhum vínculo (só existe em academy_admins) ainda tem motivo
  // legítimo de estar logado — não cai na tela de "sem acesso".
  if (profile.vinculos.length === 0 && !admin) {
    return (
      <>
        <Header />
        <main className="pt-24 sm:pt-28">
          <Container className="pb-16 pt-2 sm:pt-4">
            <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-surface p-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange-light">
                Sem acesso no momento
              </p>
              <h1 className="mt-3 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Nenhuma loja vinculada à sua conta
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Isso acontece quando a loja não está mais ativa na Rede, ou quando seu acesso foi
                removido pelo responsável da loja. Se isso não estiver correto, fale com a equipe
                da Rede ou com o responsável da sua loja.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/conteudos"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-brand-blue-light/60 hover:bg-brand-blue-light/10"
                >
                  Ver conteúdos abertos
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10"
                  >
                    Sair
                  </button>
                </form>
              </div>
            </div>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

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

            <div className="flex items-center gap-3">
              {admin && (
                <Link
                  href="/admin"
                  className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10"
                >
                  Painel admin
                </Link>
              )}
              {ehMaster && (
                <Link
                  href="/equipe"
                  className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10"
                >
                  Minha equipe
                </Link>
              )}
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10"
                >
                  Sair
                </button>
              </form>
            </div>
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

          <h2 className="mt-12 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Segurança
          </h2>
          <div className="mt-4 rounded-2xl border border-white/10 bg-surface p-6">
            <p className="text-sm text-muted">
              Troque sua senha a qualquer momento — não precisa da senha antiga, só estar logado.
            </p>
            <TrocarSenhaForm />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
