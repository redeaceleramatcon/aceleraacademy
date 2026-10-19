import Image from "next/image";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PlayIcon } from "@/components/icons";
import { TiltCard } from "@/components/motion/TiltCard";
import { CardAcoes } from "@/components/home/CardAcoes";
import { aoClicarCard, type PropsCardSelecionavel } from "@/components/home/cardProps";
import { cn } from "@/lib/utils";
import type { ContentItem } from "@/types/content";

export function ContentCard({
  item,
  className,
  selecionado,
  aoSelecionar,
}: { item: ContentItem; className?: string } & PropsCardSelecionavel) {
  const meta = [item.mentor, item.duration].filter(Boolean).join(" · ");

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
        className="relative aspect-video overflow-hidden rounded-xl bg-surface ring-1 ring-white/5 transition-[box-shadow,--tw-ring-color] duration-300 ease-out hover:ring-white/10 hover:shadow-elevated"
      >
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 70vw, 280px"
          className="card-img object-cover [filter:saturate(0.92)_contrast(1.04)_brightness(0.96)]"
        />
        <div className="absolute inset-0 bg-brand-blue-dark/15 mix-blend-multiply" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-80 transition-all duration-300 group-hover:via-black/30 group-hover:opacity-100" />

        {aoSelecionar ? (
          <CardAcoes uuid={item.uuid} titulo={item.title} fixo={selecionado} />
        ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="relative flex h-12 w-12 scale-50 items-center justify-center rounded-full bg-white/95 text-background shadow-lg transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-100">
            <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-white/60 [animation-duration:1.4s]" />
            <span aria-hidden className="absolute -inset-2 animate-ping rounded-full border border-white/40 [animation-delay:0.5s] [animation-duration:1.8s]" />
            <PlayIcon className="relative h-4 w-4 translate-x-0.5" />
          </span>
        </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3 pb-4">
          <p className="line-clamp-1 text-sm font-semibold text-white transition-transform duration-300 group-hover:-translate-y-0.5">{item.title}</p>
          {meta && <p className="mt-0.5 line-clamp-1 text-xs text-white/60">{meta}</p>}
          {item.description && (
            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr]">
              <p className="overflow-hidden text-[11px] leading-snug text-white/75">
                <span className="mt-1.5 line-clamp-2 translate-y-2 opacity-0 transition-all duration-300 delay-75 group-hover:translate-y-0 group-hover:opacity-100">
                  {item.description}
                </span>
              </p>
            </div>
          )}
        </div>

        {typeof item.progress === "number" && (
          <ProgressBar
            value={item.progress}
            variant="flush"
            className="absolute inset-x-0 bottom-0"
          />
        )}
      </TiltCard>
    </Link>
  );
}
