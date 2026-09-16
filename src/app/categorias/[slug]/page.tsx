import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { CategoryFilter } from "@/components/home/CategoryFilter";
import { ContentCard } from "@/components/home/ContentCard";
import { getCategoryBySlug, getContentsByCategory } from "@/lib/data/content";

export const revalidate = 60;

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const items = await getContentsByCategory(slug);

  return (
    <>
      <Header />
      <main className="pt-24 sm:pt-28">
        <Container className="pb-6 pt-2 sm:pb-10 sm:pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue-light">
            Categoria
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {category.name}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {items.length} {items.length === 1 ? "conteúdo" : "conteúdos"}
          </p>

          <div className="mt-6">
            <CategoryFilter activeSlug={slug} />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item) => (
              <ContentCard key={item.slug} item={item} />
            ))}
          </div>

          {items.length === 0 && (
            <p className="mt-16 text-center text-sm text-muted">
              Ainda não há conteúdos nesta categoria.
            </p>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
