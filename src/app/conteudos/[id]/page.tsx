import { notFound } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { TypeBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ContentRow } from "@/components/home/ContentRow";
import { ContentCard } from "@/components/home/ContentCard";
import { PlayIcon } from "@/components/icons";
import { contentItems, categoryNameMap, getByCategory, getContentById } from "@/lib/mock-data";

export function generateStaticParams() {
  return contentItems.map((item) => ({ id: item.id }));
}

function mentorInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default async function ConteudoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getContentById(id);
  if (!item) notFound();

  const related = getByCategory(item.category)
    .filter((related) => related.id !== item.id)
    .slice(0, 6);

  return (
    <>
      <Header />
      <main className="pb-16">
        <section className="relative h-[56vh] min-h-[380px] w-full overflow-hidden sm:h-[64vh]">
          <Image
            src={item.image}
            alt={item.title}
            fill
            priority
            sizes="100vw"
            className="object-cover [filter:saturate(0.92)_contrast(1.04)_brightness(0.96)]"
          />
          <div className="absolute inset-0 bg-brand-blue-dark/10 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-background from-5% via-brand-blue-dark/50 via-35% to-transparent to-80%" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue-dark/70 via-transparent to-transparent" />
          <Container className="relative flex h-full flex-col justify-end pb-10 pt-28">
            <TypeBadge type={item.type} className="w-fit" />
            <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
              {item.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/60">
              <span>{item.mentor}</span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>{item.duration}</span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>{categoryNameMap[item.category]}</span>
              {item.partner && (
                <>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span>Parceria com {item.partner}</span>
                </>
              )}
            </div>
          </Container>
        </section>

        <Container className="mt-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-surface">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="scale-105 object-cover opacity-30 [filter:blur(2px)_saturate(0.9)]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/55" />
                <div className="relative flex flex-col items-center gap-3 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur-sm">
                    <PlayIcon className="h-6 w-6 translate-x-0.5 text-white/90" />
                  </span>
                  <p className="text-sm text-white/70">Player em desenvolvimento</p>
                </div>
              </div>

              {typeof item.progress === "number" && (
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-xs text-muted">
                    <span>Seu progresso</span>
                    <span>{item.progress}%</span>
                  </div>
                  <ProgressBar value={item.progress} />
                </div>
              )}

              <h2 className="mt-8 text-xl font-bold tracking-tight text-foreground">
                Sobre este conteúdo
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </div>

            <aside className="h-fit rounded-2xl border border-white/10 bg-surface p-5">
              <p className="text-xs uppercase tracking-wide text-subtle">Mentor</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue-light/15 text-sm font-semibold text-brand-blue-light ring-1 ring-brand-blue-light/30">
                  {mentorInitials(item.mentor)}
                </span>
                <p className="text-sm font-semibold text-foreground">{item.mentor}</p>
              </div>
              <div className="my-4 border-t border-white/10" />
              <p className="text-xs uppercase tracking-wide text-subtle">Categoria</p>
              <span className="mt-2 inline-flex items-center rounded-full border border-brand-blue-light/30 bg-brand-blue-light/10 px-3 py-1 text-xs font-medium text-brand-blue-light">
                {categoryNameMap[item.category]}
              </span>
              <div className="my-4 border-t border-white/10" />
              <p className="text-xs uppercase tracking-wide text-subtle">Duração</p>
              <p className="mt-1 text-sm text-foreground">{item.duration}</p>
            </aside>
          </div>
        </Container>

        {related.length > 0 && (
          <div className="mt-4">
            <ContentRow title="Conteúdos relacionados" href={`/categorias/${item.category}`}>
              {related.map((related) => (
                <ContentCard
                  key={related.id}
                  item={related}
                  className="w-[260px] shrink-0 sm:w-[280px]"
                />
              ))}
            </ContentRow>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
