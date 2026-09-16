import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center pt-24 sm:pt-28">
      <Container className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue-light">
          Erro 404
        </p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Conteúdo não encontrado
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          O endereço pode ter mudado, ou este conteúdo ainda não foi publicado.
        </p>
        <Link
          href="/conteudos"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-orange px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 transition-all hover:bg-brand-orange-light hover:shadow-brand-orange/30"
        >
          Ver todos os conteúdos
        </Link>
      </Container>
    </main>
  );
}
