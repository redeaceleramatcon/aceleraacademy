import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PlayIcon } from "@/components/icons";
import { heroContent } from "@/lib/mock-data";

export function Hero() {
  const { eyebrow, title, description, mentor, duration, category, image, contentId } =
    heroContent;

  return (
    <section className="relative h-[88vh] min-h-[620px] w-full overflow-hidden">
      <Image
        src={image}
        alt={title}
        fill
        priority
        sizes="100vw"
        className="object-cover [filter:saturate(0.92)_contrast(1.04)_brightness(0.96)]"
      />
      <div className="absolute inset-0 bg-brand-blue-dark/10 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-t from-background from-5% via-brand-blue-dark/55 via-35% to-transparent to-80%" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-blue-dark/85 via-brand-blue-dark/25 to-transparent" />

      <Container className="relative flex h-full flex-col justify-end pb-16 pt-28 sm:pb-20">
        <div className="max-w-xl sm:max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange-light">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
            {description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/60">
            <span>{mentor}</span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span>{duration}</span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span>{category}</span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={`/conteudos/${contentId}`}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 transition-all hover:bg-brand-orange-light hover:shadow-brand-orange/30"
            >
              <PlayIcon className="h-4 w-4" />
              Assistir agora
            </Link>
            <Link
              href={`/categorias/gestao`}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-brand-blue-light/60 hover:bg-brand-blue-light/10"
            >
              Ver conteúdo
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
