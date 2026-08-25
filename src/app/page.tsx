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
  getContinueWatching,
  getFeatured,
  getLives,
  getByCategory,
} from "@/lib/mock-data";

const rowCardClass = "w-[260px] shrink-0 sm:w-[280px]";
const featuredCardClass = "w-[300px] shrink-0 sm:w-[360px]";
const liveCardClass = "w-[280px] shrink-0 sm:w-[320px]";

export default function Home() {
  const continueWatching = getContinueWatching();
  const featured = getFeatured();
  const lives = getLives();

  return (
    <>
      <Header />
      <main>
        <Hero />

        {continueWatching.length > 0 && (
          <ContentRow title="Continuar assistindo">
            {continueWatching.map((item) => (
              <ContentCard key={item.id} item={item} className={rowCardClass} />
            ))}
          </ContentRow>
        )}

        <section className="py-6 sm:py-8">
          <Container>
            <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground sm:mb-5 sm:text-2xl">
              Explore por categoria
            </h2>
            <CategoryFilter />
          </Container>
        </section>

        <ContentRow title="Conteúdos em destaque" href="/conteudos">
          {featured.map((item) => (
            <FeaturedCard key={item.id} item={item} className={featuredCardClass} />
          ))}
        </ContentRow>

        <ContentRow title="Lives com parceiros" href="/conteudos">
          {lives.map((item) => (
            <LiveCard key={item.id} item={item} className={liveCardClass} />
          ))}
        </ContentRow>

        <ContentRow title="Vendas" href="/categorias/vendas">
          {getByCategory("vendas").map((item) => (
            <ContentCard key={item.id} item={item} className={rowCardClass} />
          ))}
        </ContentRow>

        <ContentRow title="Gestão" href="/categorias/gestao">
          {getByCategory("gestao").map((item) => (
            <ContentCard key={item.id} item={item} className={rowCardClass} />
          ))}
        </ContentRow>

        <ContentRow title="Marketing" href="/categorias/marketing">
          {getByCategory("marketing").map((item) => (
            <ContentCard key={item.id} item={item} className={rowCardClass} />
          ))}
        </ContentRow>

        <ContentRow title="Liderança" href="/categorias/lideranca">
          {getByCategory("lideranca").map((item) => (
            <ContentCard key={item.id} item={item} className={rowCardClass} />
          ))}
        </ContentRow>
      </main>
      <Footer />
    </>
  );
}
