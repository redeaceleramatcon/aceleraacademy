"use client";

import Image from "next/image";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Estrelas } from "@/components/marca/Estrelas";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

/** Cada passo troca a pose do astronauta (mascote da rede) enquanto a página rola. */
const passos = [
  {
    titulo: "Crie o acesso da loja",
    texto: "O responsável usa o CNPJ da loja para criar o acesso à Academy. É rápido e feito uma vez só.",
    pose: { src: "/mascote/astronauta-acenando.webp", width: 420, height: 660, alt: "Astronauta da Acelera acenando" },
  },
  {
    titulo: "Convide a equipe",
    texto: "Cada funcionário recebe o convite por e-mail e define a própria senha. A loja inteira aprende junto.",
    pose: { src: "/mascote/astronauta-apontando.webp", width: 420, height: 539, alt: "Astronauta da Acelera apontando o caminho" },
  },
  {
    titulo: "Aprenda e acompanhe",
    texto: "O vídeo abre onde você parou, o progresso fica salvo e o responsável acompanha o avanço de cada um.",
    pose: { src: "/mascote/astronauta-joinha.webp", width: 420, height: 665, alt: "Astronauta da Acelera fazendo joinha" },
  },
];

/** "Como começar": linha do tempo que se preenche com a rolagem; o passo em foco acende e o astronauta muda de pose. */
export function Jornada() {
  const lista = useRef<HTMLOListElement>(null);
  const [ativo, setAtivo] = useState(0);
  const { scrollYProgress } = useScroll({ target: lista, offset: ["start 70%", "end 60%"] });
  const preenche = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });
  const pose = passos[ativo].pose;

  return (
    <section className="relative overflow-hidden py-12 sm:py-20">
      <Estrelas className="opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" />
      <Container className="relative">
        <Reveal y={16}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange-light">Como começar</p>
          <h2 className="mt-2 max-w-2xl text-2xl font-bold tracking-tight text-foreground text-balance sm:text-3xl">
            Da primeira aula ao time inteiro treinado, em três passos
          </h2>
        </Reveal>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-16">
          {/* astronauta: fica parado na tela enquanto os passos rolam */}
          <div className="hidden lg:sticky lg:top-28 lg:block">
            <div className="relative mx-auto flex aspect-square w-full max-w-[300px] items-center justify-center sm:max-w-[360px]">
              <div className="pulsa absolute inset-6 rounded-full bg-[radial-gradient(circle,rgb(46_134_214/0.4),transparent_68%)]" />
              <div className="orbita absolute inset-0 rounded-full border border-dashed border-white/20">
                <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-brand-orange shadow-[0_0_14px_3px_rgb(245_115_10/0.7)]" />
              </div>
              <div className="orbita-inversa absolute inset-8 rounded-full border border-white/10">
                <span className="absolute -bottom-1 left-1/4 h-2 w-2 rounded-full bg-brand-blue-light shadow-[0_0_12px_3px_rgb(46_134_214/0.8)]" />
              </div>

              <motion.div
                className="relative h-[78%]"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pose.src}
                    className="h-full"
                    initial={{ opacity: 0, scale: 0.8, rotate: -8, y: 24 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, rotate: 8, y: -16 }}
                    transition={{ type: "spring", stiffness: 240, damping: 20 }}
                  >
                    <Image
                      src={pose.src}
                      alt={pose.alt}
                      width={pose.width}
                      height={pose.height}
                      sizes="300px"
                      className="h-full w-auto drop-shadow-[0_22px_28px_rgb(0_0_0/0.45)]"
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          {/* passos com a linha do tempo */}
          <ol ref={lista} className="relative space-y-5">
            <span aria-hidden className="absolute bottom-6 left-[23px] top-6 w-0.5 rounded-full bg-white/10" />
            <motion.span
              aria-hidden
              className="absolute left-[23px] top-6 w-0.5 origin-top rounded-full bg-gradient-to-b from-brand-orange to-brand-blue-light"
              style={{ scaleY: preenche, height: "calc(100% - 3rem)" }}
            />
            {passos.map((p, i) => {
              const em = i === ativo;
              return (
                <motion.li
                  key={p.titulo}
                  onViewportEnter={() => setAtivo(i)}
                  viewport={{ margin: "-40% 0px -40% 0px" }}
                  className="relative flex gap-5"
                >
                  <span
                    className={cn(
                      "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-lg font-bold transition-all duration-500",
                      em
                        ? "border-brand-orange bg-brand-orange text-white shadow-[0_0_28px_-2px_rgb(245_115_10/0.8)]"
                        : "border-white/15 bg-surface text-muted",
                    )}
                  >
                    {i + 1}
                  </span>
                  <div
                    className={cn(
                      "flex-1 rounded-2xl border p-5 transition-all duration-500",
                      em
                        ? "border-brand-orange/40 bg-surface-elevated/70 opacity-100 shadow-[0_18px_40px_-18px_rgb(245_115_10/0.5)]"
                        : "border-white/10 bg-surface/60 opacity-60",
                    )}
                  >
                    {/* celular: o astronauta grande não cabe ao lado dos passos, então cada passo leva a sua pose */}
                    <Image
                      src={p.pose.src}
                      alt=""
                      width={p.pose.width}
                      height={p.pose.height}
                      sizes="64px"
                      className={cn(
                        "float-right -mt-9 ml-3 h-20 w-auto transition-all duration-500 lg:hidden",
                        em ? "scale-100 opacity-100" : "scale-90 opacity-50 grayscale",
                      )}
                    />
                    <h3 className="text-lg font-semibold text-foreground">{p.titulo}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted sm:text-base">{p.texto}</p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
