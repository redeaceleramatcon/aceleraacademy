import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Aurora, HeroFade, Magnetic } from "@/components/motion/HeroMotion";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[80vh] items-center overflow-hidden pt-24 sm:pt-28">
      <Aurora />
      <Container className="relative text-center">
        <HeroFade>
          <p className="animate-[flutuar_4s_ease-in-out_infinite] bg-gradient-to-b from-white to-white/10 bg-clip-text text-[7rem] font-bold leading-none tracking-tighter text-transparent sm:text-[10rem]">
            404
          </p>
        </HeroFade>
        <HeroFade delay={0.15}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue-light">
            Erro 404
          </p>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Conteúdo não encontrado
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            O endereço pode ter mudado, ou este conteúdo ainda não foi publicado.
          </p>
        </HeroFade>
        <HeroFade delay={0.3} className="mt-8">
          <Magnetic>
            <Link
              href="/conteudos"
              className="btn-shine inline-flex items-center gap-2 rounded-lg bg-brand-orange px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 transition-all hover:bg-brand-orange-light hover:shadow-brand-orange/30"
            >
              Ver todos os conteúdos
            </Link>
          </Magnetic>
        </HeroFade>
      </Container>
    </main>
  );
}
