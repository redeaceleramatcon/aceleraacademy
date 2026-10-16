import Image from "next/image";
import Link from "next/link";
import { AnimatedBar } from "@/components/motion/AnimatedBar";
import { TiltCard } from "@/components/motion/TiltCard";
import { PlayIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { ItemProgresso } from "@/lib/meu-progresso";

/** Card "continuar assistindo": miniatura, barra de progresso animada e botão Retomar. */
export function ContinueCard({ item, className }: { item: ItemProgresso; className?: string }) {
  return (
    <Link href={`/conteudos/${item.slug}`} className={cn("group block", className)}>
      <TiltCard className="relative overflow-hidden rounded-xl bg-surface ring-1 ring-white/5 transition-[box-shadow,--tw-ring-color] duration-300 hover:ring-white/10 hover:shadow-elevated">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={item.imagem}
            alt={item.titulo}
            fill
            sizes="(max-width: 640px) 70vw, 280px"
            className="card-img object-cover [filter:saturate(0.92)_contrast(1.04)_brightness(0.9)]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-brand-orange px-3 py-1 text-[11px] font-semibold text-white shadow-lg transition-transform duration-300 group-hover:scale-105">
            <PlayIcon className="h-3 w-3" />
            Retomar
          </span>
        </div>
        <div className="p-3.5">
          <p className="line-clamp-1 text-sm font-semibold text-foreground">{item.titulo}</p>
          <div className="mt-2.5 flex items-center gap-3">
            <AnimatedBar value={item.percent} className="flex-1" />
            <span className="text-xs tabular-nums text-muted">{item.percent}%</span>
          </div>
          {item.categoria && <p className="mt-2 text-[11px] uppercase tracking-wide text-subtle">{item.categoria}</p>}
        </div>
      </TiltCard>
    </Link>
  );
}
