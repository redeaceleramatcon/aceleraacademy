import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { ContentRow } from "@/components/home/ContentRow";
import { ContentCard } from "@/components/home/ContentCard";
import { FeaturedCard } from "@/components/home/FeaturedCard";
import { LiveCard } from "@/components/home/LiveCard";
import { CategoryFilter } from "@/components/home/CategoryFilter";
import { Container } from "@/components/ui/Container";
import {
  getCategories,
  getContentsByCategory,
  getFeaturedContent,
  getLives,
} from "@/lib/data/content";

export const revalidate = 60;

const rowCardClass = "w-[260px] shrink-0 sm:w-[280px]";
const featuredCardClass = "w-[300px] shrink-0 sm:w-[360px]";
const liveCardClass = "w-[280px] shrink-0 sm:w-[320px]";

/** Fileiras temáticas da Home, na ordem em que aparecem. */
const HOME_ROW_SLUGS = ["vendas", "gestao", "marketing", "lideranca"];

export default async function Home() {
  const [featured, lives, categories] = await Promise.all([
    getFeaturedContent(),
    getLives(),
    getCategories(),
  ]);

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

        {/* "Continuar assistindo" depende de content_progress e de login, que
            ainda não existem. A seção fica fora até haver progresso real. */}

        <section className="py-6 sm:py-8">
          <Container>
            <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground sm:mb-5 sm:text-2xl">
              Explore por categoria
            </h2>
            <CategoryFilter />
          </Container>
        </section>

        {featured.length > 0 && (
          <ContentRow title="Conteúdos em destaque" href="/conteudos">
            {featured.map((item) => (
              <FeaturedCard key={item.slug} item={item} className={featuredCardClass} />
            ))}
          </ContentRow>
        )}

        {lives.length > 0 && (
          <ContentRow title="Lives com parceiros" href="/conteudos">
            {lives.map((item) => (
              <LiveCard key={item.slug} item={item} className={liveCardClass} />
            ))}
          </ContentRow>
        )}

        {rows.map(({ category, items }) => (
          <ContentRow
            key={category.slug}
            title={category.name}
            href={`/categorias/${category.slug}`}
          >
            {items.map((item) => (
              <ContentCard key={item.slug} item={item} className={rowCardClass} />
            ))}
          </ContentRow>
        ))}

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
