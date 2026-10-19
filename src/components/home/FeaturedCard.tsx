import Image from "next/image";
import Link from "next/link";
import { TypeBadge } from "@/components/ui/Badge";
import { PlayIcon } from "@/components/icons";
import { TiltCard } from "@/components/motion/TiltCard";
import { CardAcoes } from "@/components/home/CardAcoes";
import { aoClicarCard, type PropsCardSelecionavel } from "@/components/home/cardProps";
import { cn } from "@/lib/utils";
import type { ContentItem } from "@/types/content";

export function FeaturedCard({
  item,
  className,
  selecionado,
  aoSelecionar,
}: { item: ContentItem; className?: string } & PropsCardSelecionavel) {
  return (
    <Link
      href={`/conteudos/${item.slug}`}
      data-slug={item.slug}
      onClick={aoClicarCard(aoSelecionar)}
      aria-expanded={aoSelecionar ? !!selecionado : undefined}
      className={cn("group block", className)}
    >
      <TiltCard
        selecionado={selecionado}
        className="relative overflow-hidden rounded-2xl bg-surface ring-1 ring-white/5 transition-[box-shadow,--tw-ring-color] duration-300 hover:ring-white/10 hover:shadow-elevated"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 80vw, 360px"
            className="card-img object-cover [filter:saturate(0.92)_contrast(1.04)_brightness(0.96)]"
          />
          <div className="absolute inset-0 bg-brand-blue-dark/15 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <TypeBadge type={item.type} className="absolute left-3 top-3" />
          {aoSelecionar ? (
            <CardAcoes uuid={item.uuid} titulo={item.title} fixo={selecionado} className="right-3 top-3" />
          ) : (
          <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-orange group-hover:opacity-100">
            <PlayIcon className="h-3.5 w-3.5 translate-x-0.5" />
          </span>
          )}
        </div>

        <div className="p-4">
          <p className="line-clamp-1 text-base font-semibold text-foreground">{item.title}</p>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{item.description}</p>
          {(item.mentor || item.duration) && (
            <div className="mt-3 flex items-center justify-between text-xs text-subtle">
              {item.mentor && <span>{item.mentor}</span>}
              {item.duration && <span className="ml-auto">{item.duration}</span>}
            </div>
          )}
        </div>
      </TiltCard>
    </Link>
  );
}
