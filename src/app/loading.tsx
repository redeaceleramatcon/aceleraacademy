import { Container } from "@/components/ui/Container";

/**
 * Estado de carregamento. Usa as mesmas medidas e cantos dos cards reais para
 * que a troca pelo conteúdo não desloque a página.
 */
export default function Loading() {
  return (
    <main className="pt-24 sm:pt-28" aria-busy="true" aria-label="Carregando conteúdos">
      <Container className="pb-10 pt-2 sm:pt-4">
        <div className="shimmer h-8 w-56 rounded-lg bg-white/5" />
        <div className="shimmer mt-3 h-4 w-32 rounded bg-white/5" />

        <div className="mt-6 flex gap-2.5 overflow-hidden">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="shimmer h-9 w-28 flex-shrink-0 rounded-full bg-white/5"
            />
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="shimmer aspect-video rounded-xl bg-surface ring-1 ring-white/5"
            />
          ))}
        </div>
      </Container>
    </main>
  );
}
