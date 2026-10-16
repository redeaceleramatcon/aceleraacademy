"use client";

import { motion } from "motion/react";

function forca(senha: string) {
  let pontos = 0;
  if (senha.length >= 8) pontos++;
  if (senha.length >= 12) pontos++;
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) pontos++;
  if (/\d/.test(senha)) pontos++;
  if (/[^A-Za-z0-9]/.test(senha)) pontos++;
  return Math.min(4, pontos);
}

const rotulos = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];
const cores = ["bg-red-500", "bg-brand-orange", "bg-yellow-400", "bg-brand-blue-light", "bg-emerald-400"];

/** Medidor de força da senha: 4 barrinhas que acendem conforme a senha melhora. */
export function PasswordStrength({ senha }: { senha: string }) {
  if (!senha) return null;
  const nivel = forca(senha);
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className={`h-1 flex-1 rounded-full ${i < nivel ? cores[nivel] : "bg-white/10"}`}
            initial={false}
            animate={{ scaleY: i < nivel ? 1.4 : 1, opacity: i < nivel ? 1 : 0.6 }}
            transition={{ type: "spring", stiffness: 400, damping: 22, delay: i * 0.04 }}
          />
        ))}
      </div>
      <p className="mt-1 text-[11px] text-subtle">Força da senha: {rotulos[nivel]}</p>
    </div>
  );
}
