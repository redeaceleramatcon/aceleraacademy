import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

/** Parceiros da Rede (os mesmos logos do site institucional). Os logos são escuros: sempre sobre placa branca. */
const parceiros = [
  { nome: "Eucatex", logo: "/parceiros/eucatex.svg", href: "https://www.eucatex.com.br/", largura: 134, altura: 30, placa: "bg-white" },
  { nome: "Fiat Ferramentas", logo: "/parceiros/fiat-ferramentas.svg", href: "https://www.fiatmachinery.com.br/", largura: 183, altura: 75, placa: "bg-white" },
];

export function ParceirosFaixa() {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <Reveal>
          <div className="flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-surface/60 px-6 py-8 text-center backdrop-blur-sm sm:flex-row sm:justify-between sm:px-10 sm:text-left">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange-light">Parceiros da Rede</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted sm:text-base">
                Marcas que caminham ao lado das lojas da Acelera e fazem parte da Rede.
              </p>
            </div>
            <Stagger stagger={0.12} className="flex flex-wrap items-center justify-center gap-4">
              {parceiros.map((p) => (
                <StaggerItem key={p.nome}>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={p.nome}
                    className={`flex h-20 min-w-40 items-center justify-center rounded-2xl px-6 shadow-lg ${p.placa} shadow-black/25 transition-transform duration-300 hover:-translate-y-1.5 hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-brand-orange`}
                  >
                    <Image src={p.logo} alt={p.nome} width={p.largura} height={p.altura} className="h-9 w-auto" />
                  </a>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
