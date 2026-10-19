import { Container } from "@/components/ui/Container";
import { PlacaLogo, type MarcaId } from "@/components/marca/PlacaLogo";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { SpotlightCard } from "@/components/motion/SpotlightCard";

/**
 * "A rede Acelera": os produtos da plataforma, cada um com o logo oficial. Textos e status vêm do conteúdo já
 * aprovado do site institucional (lib/content/plataforma.ts) — descrevem o resultado para a loja, nunca de onde
 * vêm os dados.
 */
const produtos: {
  marca: MarcaId;
  titulo: string;
  texto: string;
  status: string;
  href: string;
  externo: boolean;
  aqui?: boolean;
}[] = [
  {
    marca: "academy",
    titulo: "Acelera Academy",
    texto: "Trilhas de conhecimento para o dono e para cada funcionário, em todos os setores da loja.",
    status: "Você está aqui",
    href: "/conteudos",
    externo: false,
    aqui: true,
  },
  {
    marca: "monitor",
    titulo: "Acelera Monitor",
    texto: "Compras, vendas, fornecedores e o resultado do mês em um painel só.",
    status: "Em operação",
    href: "https://monitor.aceleramatcon.com.br",
    externo: true,
  },
  {
    marca: "erp",
    titulo: "Astro Acelera ERP",
    texto: "Frente de caixa, estoque de várias lojas, financeiro e parte fiscal num sistema só.",
    status: "Em lançamento",
    href: "https://site.astromatcon.com.br",
    externo: true,
  },
  {
    marca: "tech",
    titulo: "Acellera Tech",
    texto: "A tecnologia própria que liga todos os produtos da rede e leva o varejo de materiais a outro ritmo.",
    status: "A base da rede",
    href: "https://www.grupoacellera.com.br",
    externo: true,
  },
];

function Seta() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function Ecossistema() {
  return (
    <section className="relative py-10 sm:py-16">
      <Container>
        <Reveal y={16}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange-light">A rede Acelera</p>
          <h2 className="mt-2 max-w-2xl text-2xl font-bold tracking-tight text-foreground text-balance sm:text-3xl">
            A Academy faz parte de uma plataforma que a sua loja já pode usar
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Aprender, acompanhar o negócio e comprar melhor: tudo conectado, feito para o varejo de materiais de construção.
          </p>
        </Reveal>

        <Stagger stagger={0.1} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {produtos.map((p) => (
            <SpotlightCard
              key={p.marca}
              className={`group rounded-3xl border bg-surface/80 backdrop-blur-sm ${p.aqui ? "border-brand-orange/50" : "border-white/10"}`}
            >
              <a
                href={p.href}
                {...(p.externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="relative z-[3] flex h-full flex-col rounded-[inherit] p-5 outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
              >
                <PlacaLogo
                  marca={p.marca}
                  className="h-28 transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:-rotate-2 group-hover:scale-[1.04]"
                />
                <span
                  className={`mt-4 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                    p.aqui ? "bg-brand-orange/20 text-brand-orange-light" : "bg-white/8 text-muted"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${p.aqui ? "pulsa bg-brand-orange" : "bg-brand-blue-light"}`} />
                  {p.status}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-foreground">{p.titulo}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{p.texto}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange-light">
                  {p.aqui ? "Explorar conteúdos" : "Conhecer"}
                  <Seta />
                </span>
              </a>
            </SpotlightCard>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
