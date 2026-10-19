import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { ContentRow } from "@/components/home/ContentRow";
import { CatalogoRow, type ProgressoPorSlug } from "@/components/home/CatalogoRow";
import { CategoryFilter } from "@/components/home/CategoryFilter";
import { ContinueCard } from "@/components/home/ContinueCard";
import { Beneficios, ConviteFinal, FaixaCategorias, StatsStrip } from "@/components/home/VisitorSections";
import { MinhaListaProvider } from "@/components/lista/MinhaListaProvider";
import { Container } from "@/components/ui/Container";
import { getSessionUser } from "@/lib/auth";
import {
  getCategories,
  getContents,
  getContentsByCategory,
  getFeaturedContent,
  getLives,
} from "@/lib/data/content";
import { meuProgresso } from "@/lib/meu-progresso";
import { minhaLista } from "@/lib/minha-lista";

export const revalidate = 60;

const rowCardClass = "w-[260px] shrink-0 sm:w-[280px]";

/** Fileiras temáticas da Home, na ordem em que aparecem. */
const HOME_ROW_SLUGS = ["vendas", "gestao", "marketing", "lideranca"];

export default async function Home() {
  const [featured, lives, categories, user, todos] = await Promise.all([
    getFeaturedContent(),
    getLives(),
    getCategories(),
    getSessionUser(),
    getContents(),
  ]);
  // Logado: "Continuar assistindo" e "Minha lista" no topo. Visitante: números do catálogo e convite no fim da página.
  const [progresso, salvos] = user
    ? await Promise.all([meuProgresso(user.id), minhaLista(user.id)])
    : [null, [] as Awaited<ReturnType<typeof minhaLista>>];

  // Onde o aluno está em cada conteúdo (o painel de detalhes mostra "Continuar", "Concluído"...).
  const progressoPorSlug: ProgressoPorSlug = {};
  for (const p of progresso?.emAndamento ?? []) progressoPorSlug[p.slug] = { percent: p.percent, completo: false };
  for (const p of progresso?.concluidos ?? []) progressoPorSlug[p.slug] = { percent: 100, completo: true };

  const rows = (
    await Promise.all(
      HOME_ROW_SLUGS.map(async (slug) => {
        const category = categories.find((item) => item.slug === slug);
        if (!category) return null;
        const items = await getContentsByCategory(slug);
        return items.length > 0 ? { category, items } : null;
      }),
    )
  ).filter((row) => row !== null);

  const vazio = featured.length === 0 && lives.length === 0 && rows.length === 0;

  return (
    <>
      <Header />
      <main>
        {/* Hero vem de featured_slots; some sozinho quando não há slot ativo. */}
        <Hero />

        {!user && <StatsStrip conteudos={todos.length} categorias={categories.length} />}

        <MinhaListaProvider inicial={salvos.map((s) => s.uuid)} logado={!!user}>
          {progresso && progresso.emAndamento.length > 0 && (
            <ContentRow title="Continuar assistindo" href="/minha-area">
              {progresso.emAndamento.map((item) => (
                <ContinueCard key={item.contentId} item={item} className={rowCardClass} />
              ))}
            </ContentRow>
          )}

          {salvos.length > 0 && (
            <CatalogoRow titulo="Minha lista" href="/minha-area" itens={salvos} progresso={progressoPorSlug} />
          )}

          <section className="py-6 sm:py-8">
            <Container>
              <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground sm:mb-5 sm:text-2xl">
                Explore por categoria
              </h2>
              <CategoryFilter />
            </Container>
          </section>

          {featured.length > 0 && (
            <CatalogoRow
              titulo="Conteúdos em destaque"
              href="/conteudos"
              itens={featured}
              variante="featured"
              progresso={progressoPorSlug}
            />
          )}

          {lives.length > 0 && (
            <CatalogoRow
              titulo="Lives com parceiros"
              href="/conteudos"
              itens={lives}
              variante="live"
              progresso={progressoPorSlug}
            />
          )}

          {rows.map(({ category, items }) => (
            <CatalogoRow
              key={category.slug}
              titulo={category.name}
              href={`/categorias/${category.slug}`}
              itens={items}
              progresso={progressoPorSlug}
            />
          ))}
        </MinhaListaProvider>

        {!user && (
          <>
            <Beneficios />
            <FaixaCategorias nomes={categories.map((c) => c.name)} />
            <ConviteFinal />
          </>
        )}

        {vazio && (
          <Container className="py-20">
            <p className="text-center text-sm text-muted">
              Ainda não há conteúdos publicados na Academy.
            </p>
          </Container>
        )}
      </main>
      <Footer />
    </>
  );
}
