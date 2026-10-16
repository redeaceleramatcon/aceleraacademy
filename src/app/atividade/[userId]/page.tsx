import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { ActivityBars } from "@/components/motion/ActivityBars";
import { AnimatedBar } from "@/components/motion/AnimatedBar";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { getSessionUser } from "@/lib/auth";
import { buscarAtividade } from "@/lib/atividade";

const rotuloEvento: Record<string, string> = {
  page_view: "Visitou página",
  heartbeat: "Presença",
  video_start: "Iniciou vídeo",
  video_pause: "Pausou vídeo",
  video_complete: "Concluiu vídeo",
  cta_click: "Clicou em botão",
};

/**
 * Detalhe de atividade de UMA pessoa — acessível pra ela mesma, pra admin, ou
 * pro master da mesma loja (autorização real fica em pode_ver_atividade_de,
 * checada dentro de buscarAtividade; aqui só decidimos o que mostrar).
 */
export default async function AtividadePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/login?redirect=/atividade/${userId}`);

  const atividade = await buscarAtividade(userId);
  if (!atividade) notFound();

  const horas = Math.floor(atividade.tempoUsoMinutos / 60);
  const minutos = atividade.tempoUsoMinutos % 60;

  return (
    <>
      <Header />
      <main className="pt-24 sm:pt-28">
        <Container className="pb-16 pt-2 sm:pt-4">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            {atividade.nome || atividade.email}
          </h1>
          <p className="mt-1 text-sm text-muted">{atividade.email}</p>

          <Stagger stagger={0.1} className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <StaggerItem className="border-l-2 border-brand-blue-light pl-4">
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {horas > 0 && (
                  <>
                    <AnimatedNumber value={horas} suffix="h " />
                  </>
                )}
                <AnimatedNumber value={minutos} suffix={horas > 0 ? "min" : " min"} />
              </p>
              <p className="mt-1.5 text-xs uppercase tracking-wide text-subtle">Tempo de uso (estimado)</p>
            </StaggerItem>
            <StaggerItem className="border-l-2 border-brand-blue-light pl-4">
              <p className="text-3xl font-bold tracking-tight text-foreground">
                <AnimatedNumber value={atividade.progresso.filter((p) => p.completo).length} />/
                {atividade.progresso.length}
              </p>
              <p className="mt-1.5 text-xs uppercase tracking-wide text-subtle">Conteúdos concluídos</p>
            </StaggerItem>
            <StaggerItem className="border-l-2 border-brand-blue-light pl-4">
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {atividade.ultimoAcesso
                  ? new Date(atividade.ultimoAcesso).toLocaleDateString("pt-BR")
                  : "—"}
              </p>
              <p className="mt-1.5 text-xs uppercase tracking-wide text-subtle">Último acesso</p>
            </StaggerItem>
          </Stagger>

          <h2 className="mt-12 text-lg font-bold tracking-tight text-foreground">Atividade nos últimos 14 dias</h2>
          <Reveal className="mt-4 rounded-2xl border border-white/10 bg-surface p-5">
            <ActivityBars dados={atividade.porDia} />
          </Reveal>

          <h2 className="mt-12 text-lg font-bold tracking-tight text-foreground">Progresso por conteúdo</h2>
          {atividade.progresso.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nenhum conteúdo assistido ainda.</p>
          ) : (
            <Reveal className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-white/10">
                  {atividade.progresso.map((p) => (
                    <tr key={p.contentId}>
                      <td className="px-4 py-3 text-foreground">{p.titulo}</td>
                      <td className="w-40 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <AnimatedBar value={p.completo ? 100 : p.percent} className="flex-1" />
                          <span className="w-16 text-right text-xs text-muted">
                            {p.completo ? "Concluído" : `${p.percent}%`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-subtle">
                        {new Date(p.ultimoAcesso).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          )}

          <h2 className="mt-12 text-lg font-bold tracking-tight text-foreground">Últimos eventos</h2>
          {atividade.eventosRecentes.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nenhum evento registrado ainda.</p>
          ) : (
            <Reveal className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-white/10">
                  {atividade.eventosRecentes.map((e, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 text-foreground">{rotuloEvento[e.tipo] ?? e.tipo}</td>
                      <td className="px-4 py-2 text-muted">{e.pagina ?? "—"}</td>
                      <td className="px-4 py-2 text-right text-xs text-subtle">
                        {new Date(e.criadoEm).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
