"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Astronauta decorativo que entra deslizando e depois flutua parado num canto (convite final, rodapés de seção).
 * `lado` define de que lado ele chega; só aparece em tela larga, onde não disputa espaço com o texto.
 */
export function AstronautaCanto({
  src,
  largura,
  altura,
  lado,
  className,
  rotacao = false,
}: {
  src: string;
  largura: number;
  altura: number;
  lado: "esquerda" | "direita";
  className?: string;
  rotacao?: boolean;
}) {
  return (
    <motion.div
      aria-hidden
      className={cn("pointer-events-none absolute hidden xl:block", className)}
      initial={{ opacity: 0, x: lado === "esquerda" ? -40 : 40, y: 30 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={{ y: [0, -12, 0], rotate: rotacao ? [-2, 3, -2] : 0 }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src={src}
          alt=""
          width={largura}
          height={altura}
          sizes="180px"
          className="h-auto w-full drop-shadow-[0_18px_22px_rgb(0_0_0/0.4)]"
        />
      </motion.div>
    </motion.div>
  );
}
