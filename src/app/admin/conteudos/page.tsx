import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { getSessionUser } from "@/lib/auth";
import { podePublicarConteudo } from "@/lib/atividade";
import { listarConteudosParaCapa } from "@/lib/conteudo";
import { BotaoRenovar } from "./BotaoRenovar";
import { LinhaCapa } from "./LinhaCapa";

/** Capas dos vídeos — admin ou editor. Aqui se troca a capa de qualquer conteúdo já publicado. */
export default async function CapasPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?redirect=/admin/conteudos");
  if (!(await podePublicarConteudo(user.id))) redirect("/minha-area");

  const conteudos = await listarConteudosParaCapa();
  const semCapa = conteudos.filter((c) => !c.temCapaPropria).length;

  return (
    <>
      <Header />
      <main className="pt-24 sm:pt-28">
        <Container className="pb-16 pt-2 sm:pt-4">
          <Link href="/minha-area" className="text-xs font-semibold text-brand-blue-light hover:underline">
            ← Voltar para Minha área
          </Link>

          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">Capas dos vídeos</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted">
                A capa aparece nos cards da Home, do catálogo e da busca. Sem capa própria, a Academy usa a miniatura que o
                YouTube gera (que às vezes demora a atualizar ou mostra um quadro do vídeo). {semCapa > 0 && (
                  <>
                    <strong className="text-foreground">{semCapa}</strong> {semCapa === 1 ? "vídeo está" : "vídeos estão"} sem capa
                    própria.
                  </>
                )}
              </p>
            </div>
            <Link
              href="/admin/conteudos/novo"
              className="rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-light"
            >
              + Novo conteúdo
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-surface px-4 py-3 text-sm text-muted">
            <span className="min-w-0 flex-1">
              Trocou as capas direto no YouTube e o site ainda mostra as antigas? Busque de novo de uma vez:
            </span>
            <BotaoRenovar
              rotulo="Atualizar miniaturas de todos os vídeos"
              className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-brand-blue-light/60 hover:bg-brand-blue-light/10"
            />
          </div>

          <Stagger stagger={0.04} className="mt-8">
            <div className="space-y-4">
              {conteudos.map((c) => (
                <StaggerItem key={c.id}>
                  <LinhaCapa item={c} />
                </StaggerItem>
              ))}
            </div>
          </Stagger>
        </Container>
      </main>
      <Footer />
    </>
  );
}
