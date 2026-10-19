"use client";

import {
  motion,
  type MotionStyle,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import { entrada } from "@/components/motion/Reveal";

/**
 * Card interativo (estilo "spotlight card" do 21st.dev). No hover com mouse:
 *  - inclina em 3D, cresce e sobe, seguindo o cursor;
 *  - um brilho laranja acompanha o cursor;
 *  - a imagem (classe `card-img`) desliza no sentido contrário do mouse e dá zoom (efeito de profundidade);
 *  - um feixe de luz atravessa o card e uma borda colorida gira ao redor.
 * Em celular (toque) só entra com a animação de entrada. Dentro de um <Stagger> herda a entrada em sequência.
 */
export function TiltCard({
  children,
  className,
  max = 10,
  selecionado = false,
}: {
  children: ReactNode;
  className?: string;
  /** Inclinação máxima em graus. */
  max?: number;
  /** Card "aberto" (painel de detalhes mostrado embaixo): ganha borda laranja e fica um pouco maior. */
  selecionado?: boolean;
}) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const ativo = useSpring(useMotionValue(0), { stiffness: 200, damping: 25 });
  const mola = { stiffness: 220, damping: 18, mass: 0.4 };
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), mola);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), mola);
  // -1..1 para a imagem interna se mover (variáveis CSS lidas por .card-img)
  const mx = useSpring(useTransform(px, (v) => v * 2 - 1), { stiffness: 140, damping: 20 });
  const my = useSpring(useTransform(py, (v) => v * 2 - 1), { stiffness: 140, damping: 20 });
  const gx = useTransform(px, (v) => v * 100);
  const gy = useTransform(py, (v) => v * 100);
  const brilho = useMotionTemplate`radial-gradient(260px circle at ${gx}% ${gy}%, rgb(255 145 66 / 0.3), transparent 65%)`;

  // --mx/--my são variáveis CSS (lidas por .card-img); o tipo MotionStyle não as declara, daí o cast.
  const estilo = { rotateX, rotateY, transformPerspective: 900, "--mx": mx, "--my": my } as MotionStyle;

  function mover(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    ativo.set(1);
  }

  function sair() {
    px.set(0.5);
    py.set(0.5);
    ativo.set(0);
  }

  return (
    <motion.div
      variants={entrada}
      whileHover={{ y: -10, scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      onPointerMove={mover}
      onPointerLeave={sair}
      style={estilo}
      data-selecionado={selecionado ? "true" : undefined}
      className={`tilt ${className ?? ""}`}
    >
      {children}
      <span aria-hidden className="card-shine" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] mix-blend-screen"
        style={{ background: brilho, opacity: ativo }}
      />
      <span aria-hidden className="card-borda" />
    </motion.div>
  );
}
