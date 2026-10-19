import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PlayIcon } from "@/components/icons";
import { HeroVideoCard } from "@/components/home/HeroVideoCard";
import { HeroBackground } from "@/components/motion/HeroBackground";
import { HeroFade, Magnetic, ScrollHint, WordReveal } from "@/components/motion/HeroMotion";
import { getHeroContent } from "@/lib/data/content";

/**
 * O Hero vem exclusivamente de featured_slots (slot = 'hero', active = true).
 * Sem slot ativo — ou apontando para conteúdo não publicado — a seção some,
 * em vez de mostrar um destaque inventado.
 *
 * Layout: texto à esquerda, vídeo em destaque num cartão à direita, sobre um fundo próprio da marca
 * (HeroBackground). A miniatura do vídeo NÃO é mais esticada como fundo: ela já traz texto escrito
 * e competia com o título.
 */
export async function Hero() {
  const item = await getHeroContent();
  if (!item) return null;

  const meta = [item.mentor, item.duration, item.categoryName].filter(Boolean);

  return (
    <section className="relative w-full overflow-hidden">
      <HeroBackground />

      <Container className="relative grid min-h-[640px] items-center gap-12 pb-20 pt-32 sm:min-h-[720px] lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-24">
        <div className="max-w-xl sm:max-w-2xl">
          <HeroFade delay={0.1}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange-light">
              {item.categoryName ?? "Acelera Academy"}
            </p>
          </HeroFade>
          <WordReveal
            text={item.title}
            delay={0.1}
            className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl"
          />
          <HeroFade delay={0.3}>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">{item.description}</p>
          </HeroFade>

          <HeroFade delay={0.4}>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/65">
              {meta.map((value, index) => (
                <span key={value} className="flex items-center gap-x-3">
                  {index > 0 && <span className="h-1 w-1 rounded-full bg-white/30" />}
                  {value}
                </span>
              ))}
            </div>
          </HeroFade>

          <HeroFade delay={0.5} className="mt-8 flex flex-wrap items-center gap-3">
            <Magnetic>
              <Link
                href={`/conteudos/${item.slug}`}
                className="btn-shine inline-flex items-center gap-2 rounded-lg bg-brand-orange px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 transition-all hover:bg-brand-orange-light hover:shadow-brand-orange/40"
              >
                <PlayIcon className="h-4 w-4" />
                Assistir agora
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                href={item.category ? `/categorias/${item.category}` : "/conteudos"}
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-brand-blue-light/60 hover:bg-brand-blue-light/10"
              >
                Ver mais de {item.categoryName ?? "conteúdos"}
              </Link>
            </Magnetic>
          </HeroFade>
        </div>

        <HeroVideoCard
          href={`/conteudos/${item.slug}`}
          imagem={item.image}
          titulo={item.title}
          duracao={item.duration}
          categoria={item.categoryName}
        />
      </Container>

      <ScrollHint />
    </section>
  );
}
