"use client";

import { motion } from "motion/react";
import { useMemo } from "react";

const CORES = ["#f5730a", "#ff9142", "#2e86d6", "#ffffff", "#0b4f8a"];

/** Número "aleatório" estável entre 0 e 1 a partir de uma semente (puro: o mesmo disparo gera sempre a mesma explosão). */
const sorteio = (semente: number) => {
  const x = Math.sin(semente * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/** Explosão de confete (celebra conclusão de conteúdo). `disparo` muda → nova explosão. */
export function Confetti({ disparo, quantidade = 36 }: { disparo: number; quantidade?: number }) {
  const particulas = useMemo(
    () =>
      Array.from({ length: quantidade }, (_, i) => {
        const angulo = (Math.PI * 2 * i) / quantidade + sorteio(disparo * 100 + i) * 0.4;
        const dist = 120 + sorteio(disparo * 100 + i + 0.3) * 180;
        return {
          id: i,
          x: Math.cos(angulo) * dist,
          y: Math.sin(angulo) * dist - 60,
          rot: sorteio(disparo * 100 + i + 0.6) * 720 - 360,
          cor: CORES[i % CORES.length],
          tam: 6 + sorteio(disparo * 100 + i + 0.9) * 6,
        };
      }),
    [disparo, quantidade],
  );

  if (disparo === 0) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden">
      {particulas.map((p) => (
        <motion.span
          key={`${disparo}-${p.id}`}
          className="absolute rounded-[2px]"
          style={{ width: p.tam, height: p.tam * 0.5, background: p.cor }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
          animate={{ x: p.x, y: p.y + 180, opacity: 0, scale: 1, rotate: p.rot }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}
