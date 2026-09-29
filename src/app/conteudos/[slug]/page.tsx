import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { TypeBadge } from "@/components/ui/Badge";
import { ContentRow } from "@/components/home/ContentRow";
import { ContentCard } from "@/components/home/ContentCard";
import { ChevronRightIcon, PlayIcon } from "@/components/icons";
import { YoutubePlayer } from "@/components/conteudo/YoutubePlayer";
import { getContentBySlug, getRelatedContent } from "@/lib/data/content";

export const revalidate = 60;

const materialLabels: Record<string, string> = {
  pdf: "PDF",
  spreadsheet: "Planilha",
  presentation: "Apresentação",
  link: "Link",
  other: "Arquivo",
};

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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getContentBySlug(slug);
  if (!item) notFound();

  const related = await getRelatedContent(item.category, item.slug);
  const meta = [item.mentor, item.duration, item.categoryName].filter(Boolean);
  const totalLessons = item.modules.reduce((total, module) => total + module.lessons.length, 0);

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
              {meta.map((value, index) => (
                <span key={value} className="flex items-center gap-x-3">
                  {index > 0 && <span className="h-1 w-1 rounded-full bg-white/30" />}
                  {value}
                </span>
              ))}
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
              {item.video?.provider === "youtube" ? (
                <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-surface">
                  {/*
                    youtube-nocookie.com (modo privacy-enhanced) + modestbranding/rel/iv_load_policy
                    reduzem ao máximo a marca do YouTube. O link "assistir no YouTube" do player não
                    some — os Termos de Serviço do YouTube exigem isso em qualquer embed gratuito;
                    removê-lo via CSS violaria os termos e arrisca o canal ser banido.
                    YoutubePlayer usa a IFrame API (não um <iframe src> estático) pra gravar
                    progresso e os eventos-chave de vídeo — ver src/components/conteudo/YoutubePlayer.tsx.
                  */}
                  <YoutubePlayer
                    videoId={item.video.providerVideoId}
                    contentId={item.uuid}
                    title={item.title}
                  />
                </div>
              ) : (
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
              )}

              <h2 className="mt-8 text-xl font-bold tracking-tight text-foreground">
                Sobre este conteúdo
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                {item.description}
              </p>

              {item.modules.length > 0 && (
                <>
                  <h2 className="mt-8 text-xl font-bold tracking-tight text-foreground">
                    Conteúdo do curso
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    {item.modules.length}{" "}
                    {item.modules.length === 1 ? "módulo" : "módulos"} ·{" "}
                    {totalLessons} {totalLessons === 1 ? "aula" : "aulas"}
                  </p>

                  <div className="mt-5 space-y-4">
                    {item.modules.map((module, moduleIndex) => (
                      <div
                        key={module.title}
                        className="overflow-hidden rounded-2xl bg-surface ring-1 ring-white/5"
                      >
                        <div className="px-5 pb-4 pt-5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-orange-light">
                            Módulo {moduleIndex + 1}
                          </p>
                          <p className="mt-1.5 text-base font-semibold text-foreground">
                            {module.title}
                          </p>
                          {module.description && (
                            <p className="mt-1 text-sm leading-relaxed text-muted">
                              {module.description}
                            </p>
                          )}
                        </div>

                        {module.lessons.length > 0 && (
                          <ul className="border-t border-white/5">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <li
                                key={lesson.slug}
                                className={lessonIndex > 0 ? "border-t border-white/5" : undefined}
                              >
                                <Link
                                  href={`/conteudos/${lesson.slug}`}
                                  className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.03]"
                                >
                                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition-colors group-hover:bg-white/10">
                                    <PlayIcon className="h-3 w-3 translate-x-px text-white/70 transition-colors group-hover:text-brand-orange-light" />
                                  </span>
                                  <span className="min-w-0 flex-1 truncate text-sm text-muted transition-colors group-hover:text-foreground">
                                    {lesson.title}
                                  </span>
                                  {lesson.duration && (
                                    <span className="flex-shrink-0 text-xs text-subtle">
                                      {lesson.duration}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <aside className="h-fit rounded-2xl border border-white/10 bg-surface p-5">
              {item.mentors.length > 0 && (
                <>
                  <p className="text-xs uppercase tracking-wide text-subtle">
                    {item.mentors.length === 1 ? "Mentor" : "Mentores"}
                  </p>
                  <div className="mt-2 space-y-3">
                    {item.mentors.map((mentor) => (
                      <div key={mentor.name} className="flex items-center gap-3">
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue-light/15 text-sm font-semibold text-brand-blue-light ring-1 ring-brand-blue-light/30">
                          {mentorInitials(mentor.name)}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{mentor.name}</p>
                          {mentor.role && <p className="text-xs text-subtle">{mentor.role}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="my-4 border-t border-white/10" />
                </>
              )}

              {item.categoryName && (
                <>
                  <p className="text-xs uppercase tracking-wide text-subtle">Categoria</p>
                  <span className="mt-2 inline-flex items-center rounded-full border border-brand-blue-light/30 bg-brand-blue-light/10 px-3 py-1 text-xs font-medium text-brand-blue-light">
                    {item.categoryName}
                  </span>
                  <div className="my-4 border-t border-white/10" />
                </>
              )}

              {item.duration && (
                <>
                  <p className="text-xs uppercase tracking-wide text-subtle">Duração</p>
                  <p className="mt-1 text-sm text-foreground">{item.duration}</p>
                </>
              )}

              {item.materials.length > 0 && (
                <>
                  <div className="my-4 border-t border-white/10" />
                  <p className="text-xs uppercase tracking-wide text-subtle">Materiais</p>
                  <ul className="mt-2.5 space-y-1">
                    {item.materials.map((material) => (
                      <li key={material.url}>
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-foreground transition-colors group-hover:text-brand-orange-light">
                              {material.title}
                            </span>
                            <span className="mt-0.5 block text-[11px] uppercase tracking-wide text-subtle">
                              {materialLabels[material.type] ?? "Arquivo"}
                            </span>
                          </span>
                          <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-brand-orange-light" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </aside>
          </div>
        </Container>

        {related.length > 0 && (
          <div className="mt-4">
            <ContentRow
              title="Conteúdos relacionados"
              href={item.category ? `/categorias/${item.category}` : "/conteudos"}
            >
              {related.map((relatedItem) => (
                <ContentCard
                  key={relatedItem.slug}
                  item={relatedItem}
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
