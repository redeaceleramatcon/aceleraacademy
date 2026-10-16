"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { PlayIcon } from "@/components/icons";
import { TiltCard } from "@/components/motion/TiltCard";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Cartão do vídeo em destaque (lado direito do Hero): entra deslizando, fica flutuando devagar,
 * inclina em 3D com o mouse e tem botão de play pulsando. A miniatura aparece dentro de uma moldura,
 * então o texto escrito nela não compete com o título da página.
 */
export function HeroVideoCard({
  href,
  imagem,
  titulo,
  duracao,
  categoria,
}: {
  href: string;
  imagem: string;
  titulo: string;
  duracao?: string;
  categoria?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 70, rotate: 2 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      transition={{ duration: 1, delay: 0.5, ease: EASE }}
      className="relative"
    >
      {/* halo atrás do cartão */}
      <div aria-hidden className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-brand-blue-light/30 via-transparent to-brand-orange/25 blur-2xl" />

      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
        <Link href={href} className="group relative block" aria-label={`Assistir: ${titulo}`}>
          <TiltCard className="relative aspect-video overflow-hidden rounded-2xl bg-surface ring-1 ring-white/20 shadow-2xl shadow-black/40">
            <Image
              src={imagem}
              alt={titulo}
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 560px"
              className="card-img object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-lg">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Em destaque
            </span>

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-background shadow-xl transition-transform duration-300 group-hover:scale-110">
                <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-white/60 [animation-duration:2s]" />
                <span aria-hidden className="absolute -inset-3 animate-ping rounded-full border border-white/40 [animation-delay:0.7s] [animation-duration:2.4s]" />
                <PlayIcon className="relative h-6 w-6 translate-x-0.5" />
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-4 text-xs text-white/80">
              <span className="truncate font-medium">{categoria}</span>
              {duracao && <span className="rounded-md bg-black/50 px-2 py-0.5 tabular-nums backdrop-blur">{duracao}</span>}
            </div>
          </TiltCard>
        </Link>
      </motion.div>
    </motion.div>
  );
}
