"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";

const FRASES = [
  "Bora aprender hoje?",
  "Cada aula vira venda no balcão.",
  "Sua equipe pronta, sua loja mais forte.",
  "Vem comigo, a gente acelera!",
];

/**
 * Astronauta da rede no foguete, flutuando ao lado do vídeo em destaque. Acompanha o mouse em
 * "camadas" (o astronauta se move mais que as órbitas e os selos), fala quando se passa o mouse ou se
 * toca nele (cada toque, uma frase nova) e dá a primeira dica sozinho, depois de alguns segundos.
 * O parallax só vale para mouse: no celular ele só flutua.
 */
export function AstronautaHero() {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const mola = { stiffness: 90, damping: 16, mass: 0.6 };
  const x = useSpring(useTransform(px, (v) => v * 26), mola);
  const y = useSpring(useTransform(py, (v) => v * 18), mola);
  const rotate = useSpring(useTransform(px, (v) => v * 7), mola);
  const xFundo = useSpring(useTransform(px, (v) => v * -14), mola);
  const yFundo = useSpring(useTransform(py, (v) => v * -10), mola);

  const [frase, setFrase] = useState(0);
  const [fala, setFala] = useState(false);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (e.pointerType !== "mouse") return;
      px.set((e.clientX / window.innerWidth) * 2 - 1);
      py.set((e.clientY / window.innerHeight) * 2 - 1);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    const abre = window.setTimeout(() => setFala(true), 2600);
    const fecha = window.setTimeout(() => setFala(false), 7200);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.clearTimeout(abre);
      window.clearTimeout(fecha);
    };
  }, [px, py]);

  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block">
      <div className="relative mx-auto h-full w-full max-w-[1600px]">
        <motion.div
          className="absolute bottom-2 right-[7%]"
          initial={{ opacity: 0, y: 60, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* órbitas e satélites (camada de trás) */}
          <motion.div style={{ x: xFundo, y: yFundo }} className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="orbita relative h-[330px] w-[330px] rounded-full border border-dashed border-white/20">
              <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-brand-orange shadow-[0_0_14px_3px_rgb(245_115_10/0.7)]" />
            </div>
            <div className="orbita-inversa absolute inset-6 rounded-full border border-white/10">
              <span className="absolute -bottom-1 left-1/3 h-2 w-2 rounded-full bg-brand-blue-light shadow-[0_0_12px_3px_rgb(46_134_214/0.8)]" />
            </div>
            <div className="pulsa absolute inset-10 rounded-full bg-[radial-gradient(circle,rgb(46_134_214/0.35),transparent_68%)]" />
          </motion.div>

          {/* astronauta */}
          <motion.div style={{ x, y, rotate }} className="pointer-events-auto relative">
            <motion.button
              type="button"
              aria-label="Astronauta da Acelera: toque para ouvir uma dica"
              onClick={() => {
                setFrase((f) => (f + 1) % FRASES.length);
                setFala(true);
              }}
              onMouseEnter={() => setFala(true)}
              onMouseLeave={() => setFala(false)}
              onFocus={() => setFala(true)}
              onBlur={() => setFala(false)}
              animate={{ y: [0, -16, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94, rotate: -8 }}
              className="relative block cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
            >
              <Image
                src="/mascote/astronauta-foguete.webp"
                alt=""
                width={600}
                height={632}
                priority
                sizes="220px"
                className="w-[190px] drop-shadow-[0_24px_30px_rgb(0_0_0/0.45)]"
              />
            </motion.button>

            <AnimatePresence>
              {fala && (
                <motion.div
                  key={frase}
                  initial={{ opacity: 0, scale: 0.7, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 6 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className="absolute -top-4 right-[88%] w-44 origin-bottom-right rounded-2xl rounded-br-sm bg-white px-3.5 py-2.5 text-xs font-semibold leading-snug text-brand-blue-dark shadow-xl"
                  role="status"
                >
                  {FRASES[frase]}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
