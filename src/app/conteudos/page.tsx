import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { CategoryFilter } from "@/components/home/CategoryFilter";
import { ContentCard } from "@/components/home/ContentCard";
import { contentItems } from "@/lib/mock-data";

export default async function ConteudosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim().toLowerCase();

  const items = query
    ? contentItems.filter((item) =>
        [item.title, item.mentor, item.description].join(" ").toLowerCase().includes(query)
      )
    : contentItems;

  return (
    <>
      <Header />
      <main className="pt-24 sm:pt-28">
        <Container className="pb-6 pt-2 sm:pb-10 sm:pt-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {q ? `Resultados para "${q}"` : "Todos os conteúdos"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {items.length} {items.length === 1 ? "conteúdo encontrado" : "conteúdos encontrados"}
          </p>

          <div className="mt-6">
            <CategoryFilter />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>

          {items.length === 0 && (
            <p className="mt-16 text-center text-sm text-muted">
              Nenhum conteúdo encontrado para essa busca.
            </p>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
