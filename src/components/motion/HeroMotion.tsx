"use client";

import { Fragment, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import type { PointerEvent } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Imagem de fundo do Hero: entra com zoom-out suave e depois se afasta mais devagar que a página (parallax). */
export function HeroBackdrop({ children }: { children: ReactNode }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, 140]);
  const scale = useTransform(scrollY, [0, 700], [1.04, 1.16]);

  return (
    <motion.div className="absolute inset-0" style={{ y, scale }}>
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.12 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: EASE }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Manchas de luz coloridas que flutuam devagar por cima da imagem (estilo "aurora"). */
export function Aurora({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <motion.div
        className="absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgb(245_115_10/0.26)_0%,transparent_68%)] will-change-transform"
        animate={{ x: [0, 90, -20, 0], y: [0, -70, 40, 0], scale: [1, 1.18, 0.95, 1] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-10%] top-[8%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgb(46_134_214/0.28)_0%,transparent_68%)] will-change-transform"
        animate={{ x: [0, -110, 30, 0], y: [0, 80, -30, 0], scale: [1, 0.92, 1.15, 1] }}
        transition={{ duration: 23, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-18%] left-[28%] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgb(255_145_66/0.16)_0%,transparent_68%)] will-change-transform"
        animate={{ x: [0, 70, -60, 0], y: [0, -50, 30, 0], scale: [1, 1.12, 0.9, 1] }}
        transition={{ duration: 27, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/** Título que se revela palavra por palavra, subindo de uma "máscara". */
export function WordReveal({
  text,
  className,
  delay = 0.2,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const palavras = text.split(" ");
  return (
    <h1 className={className} aria-label={text}>
      {palavras.map((palavra, i) => (
        <Fragment key={`${palavra}-${i}`}>
          <span aria-hidden className="inline-block overflow-hidden pb-[0.14em] align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: "115%", rotate: 4 }}
              animate={{ y: 0, rotate: 0 }}
              transition={{ duration: 0.85, ease: EASE, delay: delay + i * 0.07 }}
            >
              {palavra}
            </motion.span>
          </span>
          {i < palavras.length - 1 && " "}
        </Fragment>
      ))}
    </h1>
  );
}

/** Sobe e aparece com atraso (para os textos e botões do Hero entrarem em cascata). */
export function HeroFade({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Botão "magnético": é puxado levemente na direção do cursor quando o mouse chega perto. */
export function Magnetic({
  children,
  className,
  forca = 0.28,
}: {
  children: ReactNode;
  className?: string;
  forca?: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 15, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 220, damping: 15, mass: 0.3 });

  function mover(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * forca);
    y.set((e.clientY - (r.top + r.height / 2)) * forca);
  }

  function sair() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onPointerMove={mover}
      onPointerLeave={sair}
      style={{ x: sx, y: sy }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}

/** Indicador "role para baixo": um ponto que desce dentro de uma cápsula, em loop. */
export function ScrollHint() {
  return (
    <motion.div
      aria-hidden
      className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:block"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.8 }}
    >
      <div className="flex h-10 w-6 justify-center rounded-full border border-white/30 pt-2">
        <motion.span
          className="h-2 w-1 rounded-full bg-white/80"
          animate={{ y: [0, 14, 0], opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}
