import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { UserIcon, PlayIcon } from "@/components/icons";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { ProgressRing } from "@/components/motion/ProgressRing";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ContinueCard } from "@/components/home/ContinueCard";
import { getSessionProfile, displayName } from "@/lib/auth";
import { ehAdmin, ehEditor } from "@/lib/atividade";
import { getContents } from "@/lib/data/content";
import { meuProgresso } from "@/lib/meu-progresso";
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
 * Os números vêm de content_progress (o player grava a cada 10 s): conteúdos
 * concluídos, em andamento e minutos assistidos. Nada aqui é inventado — sem
 * progresso, a página mostra zeros e um convite para começar.
 */
export default async function MinhaAreaPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login?redirect=/minha-area");

  const nome = displayName(profile);
  const ehMaster = profile.vinculos.some((v) => v.papel === "master");
  const [admin, editor] = await Promise.all([ehAdmin(profile.id), ehEditor(profile.id)]);

  // Admin/editor sem nenhum vínculo (só existe em academy_admins/editores)
  // ainda tem motivo legítimo de estar logado — não cai na tela de "sem acesso".
  if (profile.vinculos.length === 0 && !admin && !editor) {
    return (
      <>
        <Header />
        <main className="pt-24 sm:pt-28">
          <Container className="pb-16 pt-2 sm:pt-4">
            <Reveal className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-surface p-8 text-center">
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
            </Reveal>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  const [progresso, catalogo] = await Promise.all([meuProgresso(profile.id), getContents()]);
  const concluidos = progresso.concluidos.length;
  const jornada = catalogo.length > 0 ? Math.round((concluidos / catalogo.length) * 100) : 0;
  const hora = Number(
    new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: "America/Sao_Paulo" }).format(new Date()),
  );
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const primeiroNome = nome.split(" ")[0];

  const membroDesde = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : null;

  const stats = [
    { label: "Conteúdos concluídos", valor: concluidos, sufixo: "" },
    { label: "Em andamento", valor: progresso.emAndamento.length, sufixo: "" },
    { label: "Minutos assistidos", valor: progresso.minutosAssistidos, sufixo: " min" },
  ];

  const botao =
    "rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10";

  return (
    <>
      <Header />
      <main className="pt-24 sm:pt-28">
        <Container className="pb-6 pt-2 sm:pb-10 sm:pt-4">
          <Reveal className="flex flex-wrap items-center justify-between gap-4" y={16}>
            <div className="flex items-center gap-4">
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated ring-1 ring-white/10">
                <span className="absolute inset-0 animate-ping rounded-full bg-brand-blue-light/10 [animation-duration:3s]" />
                <UserIcon className="relative h-7 w-7 text-muted" />
              </span>
              <div>
                <p className="text-sm text-brand-orange-light">{saudacao},</p>
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">{primeiroNome}</h1>
                <p className="text-sm text-muted">{profile.email}</p>
                {membroDesde && <p className="mt-0.5 text-xs text-subtle">Associado desde {membroDesde}</p>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {(admin || editor) && (
                <Link href="/admin/conteudos/novo" className={botao}>
                  Novo conteúdo
                </Link>
              )}
              {admin && (
                <Link href="/admin" className={botao}>
                  Painel admin
                </Link>
              )}
              {ehMaster && (
                <Link href="/equipe" className={botao}>
                  Minha equipe
                </Link>
              )}
              <form action={signOut}>
                <button type="submit" className={botao}>
                  Sair
                </button>
              </form>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-[1fr_auto]">
            <Stagger stagger={0.1} className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {stats.map((stat) => (
                <StaggerItem key={stat.label} className="border-l-2 border-brand-blue-light pl-4">
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    <AnimatedNumber value={stat.valor} suffix={stat.sufixo} />
                  </p>
                  <p className="mt-1.5 text-xs uppercase tracking-wide text-subtle">{stat.label}</p>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal delay={0.25} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-surface px-5 py-4">
              <ProgressRing percent={jornada} size={72} stroke={6} />
              <div>
                <p className="text-sm font-semibold text-foreground">Sua jornada</p>
                <p className="mt-0.5 text-xs text-muted">
                  {concluidos} de {catalogo.length} {catalogo.length === 1 ? "conteúdo" : "conteúdos"} do catálogo
                </p>
              </div>
            </Reveal>
          </div>

          <h2 className="mt-12 text-xl font-bold tracking-tight text-foreground sm:text-2xl">Continuar assistindo</h2>
          {progresso.emAndamento.length > 0 ? (
            <Stagger
              stagger={0.08}
              className="fila-cards scrollbar-hide -mx-4 mt-4 flex gap-4 overflow-x-auto px-4 pb-2 pt-2 sm:-mx-6 sm:gap-5 sm:px-6 lg:-mx-10 lg:px-10"
            >
              {progresso.emAndamento.map((item) => (
                <ContinueCard key={item.contentId} item={item} className="w-[260px] shrink-0 sm:w-[280px]" />
              ))}
            </Stagger>
          ) : (
            <Reveal className="mt-4 rounded-2xl border border-white/10 bg-surface p-8 text-center">
              <span className="mx-auto flex h-14 w-14 animate-[flutuar_3s_ease-in-out_infinite] items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange-light ring-1 ring-brand-orange/30">
                <PlayIcon className="h-5 w-5 translate-x-0.5" />
              </span>
              <p className="mt-4 text-sm text-muted">
                Você ainda não começou nenhum conteúdo. Assim que assistir, o ponto onde parou aparece aqui.
              </p>
              <Link
                href="/conteudos"
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-brand-blue-light/60 hover:bg-brand-blue-light/10"
              >
                Explorar conteúdos
              </Link>
            </Reveal>
          )}

          {progresso.concluidos.length > 0 && (
            <>
              <h2 className="mt-12 text-xl font-bold tracking-tight text-foreground sm:text-2xl">Concluídos</h2>
              <Stagger stagger={0.06} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {progresso.concluidos.map((item) => (
                  <StaggerItem key={item.contentId}>
                    <Link
                      href={`/conteudos/${item.slug}`}
                      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-surface px-4 py-3 transition-colors hover:border-white/20 hover:bg-surface-elevated"
                    >
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-sm text-emerald-300 ring-1 ring-emerald-400/30 transition-transform group-hover:scale-110">
                        ✓
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-foreground">{item.titulo}</span>
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </>
          )}

          <h2 className="mt-12 text-xl font-bold tracking-tight text-foreground sm:text-2xl">Segurança</h2>
          <Reveal className="mt-4 rounded-2xl border border-white/10 bg-surface p-6">
            <p className="text-sm text-muted">
              Troque sua senha a qualquer momento — não precisa da senha antiga, só estar logado.
            </p>
            <TrocarSenhaForm />
          </Reveal>
        </Container>
      </main>
      <Footer />
    </>
  );
}
