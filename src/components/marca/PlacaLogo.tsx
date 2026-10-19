import Image from "next/image";
import { cn } from "@/lib/utils";

/** Logos oficiais da rede (public/marcas). São azul-marinho e laranja: sempre sobre uma placa clara. */
export const marcas = {
  academy: { src: "/marcas/acelera-academy.webp", width: 520, height: 221, nome: "Acelera Academy" },
  monitor: { src: "/marcas/acelera-monitor.webp", width: 520, height: 391, nome: "Acelera Monitor" },
  tech: { src: "/marcas/acellera-tech.webp", width: 520, height: 403, nome: "Acellera Tech" },
  erp: { src: "/marcas/astro-acelera-erp.webp", width: 520, height: 230, nome: "Astro Acelera ERP" },
} as const;

export type MarcaId = keyof typeof marcas;

/** Logo da rede sobre uma placa branca arredondada (a que mantém o contraste no fundo azul-marinho). */
export function PlacaLogo({
  marca,
  className,
  imgClassName,
  priority = false,
}: {
  marca: MarcaId;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const m = marcas[marca];
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-2xl bg-white p-3 shadow-lg shadow-black/25 ring-1 ring-white/60",
        className,
      )}
    >
      <Image
        src={m.src}
        alt={m.nome}
        width={m.width}
        height={m.height}
        priority={priority}
        sizes="200px"
        className={cn("h-full w-auto max-w-full object-contain", imgClassName)}
      />
    </span>
  );
}
