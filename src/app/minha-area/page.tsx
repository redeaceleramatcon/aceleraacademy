import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { ContentCard } from "@/components/home/ContentCard";
import { UserIcon } from "@/components/icons";
import { getContinueWatching } from "@/lib/mock-data";

const stats = [
  { label: "Conteúdos assistidos", value: "12" },
  { label: "Tempo este mês", value: "3h 20min" },
  { label: "Trilhas em andamento", value: "4" },
];

export default function MinhaAreaPage() {
  const continueWatching = getContinueWatching();

  return (
    <>
      <Header />
      <main className="pt-24 sm:pt-28">
        <Container className="pb-6 pt-2 sm:pb-10 sm:pt-4">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated ring-1 ring-white/10">
              <UserIcon className="h-7 w-7 text-muted" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">Minha área</h1>
              <p className="text-sm text-muted">Associado Acelera Matcon</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="border-l-2 border-brand-blue-light pl-4">
                <p className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
                <p className="mt-1.5 text-xs uppercase tracking-wide text-subtle">{stat.label}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Continuar assistindo
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {continueWatching.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
