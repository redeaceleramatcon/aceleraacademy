import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { AstronautaCanto } from "@/components/marca/AstronautaCanto";
import { Estrelas } from "@/components/marca/Estrelas";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { Magnetic } from "@/components/motion/HeroMotion";

/**
 * Seções só para quem ainda não entrou: números reais do catálogo, o que a Academy oferece e o convite
 * para criar o acesso da loja. Logado, o aluno vê "Continuar assistindo" no lugar (ver app/page.tsx).
 */

/** Faixa de números do catálogo (valores reais, vindos do banco). */
export function StatsStrip({ conteudos, categorias }: { conteudos: number; categorias: number }) {
  const itens = [
    { valor: conteudos, rotulo: conteudos === 1 ? "conteúdo publicado" : "conteúdos publicados" },
    { valor: categorias, rotulo: "áreas do varejo" },
  ];

  return (
    <section className="py-6 sm:py-8">
      <Container>
        <Stagger stagger={0.12} className="grid grid-cols-2 gap-4 sm:max-w-md">
          {itens.map((item) => (
            <TiltCard
              key={item.rotulo}
              max={4}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface px-5 py-4"
            >
              <p className="text-3xl font-bold tracking-tight text-foreground">
                <AnimatedNumber value={item.valor} />
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-subtle">{item.rotulo}</p>
            </TiltCard>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

function Icone({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange-light ring-1 ring-brand-orange/25 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </span>
  );
}

const beneficios = [
  {
    titulo: "Aulas práticas para o balcão",
    texto: "Conteúdos curtos e diretos, pensados para a rotina de quem vende material de construção.",
    icone: (
      <>
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="m10 9 5 3-5 3Z" />
        <path d="M8 21h8" />
      </>
    ),
  },
  {
    titulo: "Quem ensina vive o mercado",
    texto: "Mentores e parceiros da Rede compartilhando o que funciona na prática.",
    icone: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M17 11a3 3 0 1 0 0-6" />
        <path d="M21 20c0-2.6-1.7-4.8-4-5.6" />
      </>
    ),
  },
  {
    titulo: "Continue de onde parou",
    texto: "O vídeo abre no ponto em que você saiu e seu progresso fica salvo em todos os conteúdos.",
    icone: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
  {
    titulo: "Toda a equipe da loja",
    texto: "O responsável convida os funcionários e acompanha o avanço de cada um.",
    icone: (
      <>
        <path d="M4 20V9l8-5 8 5v11" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
  },
];

/** "Por que a Academy": 4 cartões com ícone, que entram em sequência e reagem ao mouse. */
export function Beneficios() {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <Reveal y={16}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange-light">Por que a Academy</p>
          <h2 className="mt-2 max-w-2xl text-2xl font-bold tracking-tight text-foreground text-balance sm:text-3xl">
            Treinamento feito para a Rede, no ritmo da sua loja
          </h2>
        </Reveal>

        <Stagger stagger={0.1} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {beneficios.map((b) => (
            <TiltCard
              key={b.titulo}
              max={5}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface p-5"
            >
              <Icone>{b.icone}</Icone>
              <h3 className="mt-4 text-base font-semibold text-foreground">{b.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{b.texto}</p>
            </TiltCard>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

/** Faixa de categorias rolando sozinha (pausa quando o mouse passa por cima). */
export function FaixaCategorias({ nomes }: { nomes: string[] }) {
  if (nomes.length === 0) return null;
  const linha = [...nomes, ...nomes];

  return (
    <div className="group relative overflow-hidden border-y border-white/5 py-4 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      <div className="marquee flex w-max gap-10 group-hover:[animation-play-state:paused]">
        {linha.map((nome, i) => (
          <span key={`${nome}-${i}`} className="flex items-center gap-10 text-sm font-semibold uppercase tracking-[0.2em] text-white/35">
            {nome}
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange/60" />
          </span>
        ))}
      </div>
    </div>
  );
}

/** Convite final: caixa com borda de luz girando, levando para criar o acesso ou entrar. */
export function ConviteFinal() {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl p-px">
            <span aria-hidden className="borda-giratoria absolute inset-[-100%]" />
            <div className="relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-surface px-6 py-10 text-center sm:px-12 sm:py-14">
              <Estrelas className="opacity-70" />
              <AstronautaCanto src="/mascote/astronauta-acenando.webp" largura={420} altura={660} lado="esquerda" className="-left-2 bottom-0 w-36" />
              <div className="relative z-10">
              <h2 className="mx-auto max-w-xl text-2xl font-bold tracking-tight text-foreground text-balance sm:text-3xl">
                Faça sua loja aprender mais rápido
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
                O responsável cria o acesso com o CNPJ da loja e convida a equipe. Quem já tem acesso é só entrar.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Magnetic>
                  <Link
                    href="/cadastro"
                    className="btn-shine inline-flex items-center rounded-lg bg-brand-orange px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 transition-all hover:bg-brand-orange-light hover:shadow-brand-orange/40"
                  >
                    Criar acesso da sua loja
                  </Link>
                </Magnetic>
                <Magnetic>
                  <Link
                    href="/login"
                    className="inline-flex items-center rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-brand-blue-light/60 hover:bg-brand-blue-light/10"
                  >
                    Já tenho acesso
                  </Link>
                </Magnetic>
              </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
