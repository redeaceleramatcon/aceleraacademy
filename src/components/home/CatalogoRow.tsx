"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ContentCard } from "@/components/home/ContentCard";
import { FeaturedCard } from "@/components/home/FeaturedCard";
import { LiveCard } from "@/components/home/LiveCard";
import { ChevronRightIcon, PlayIcon } from "@/components/icons";
import { BotaoMinhaLista } from "@/components/lista/MinhaListaProvider";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { TypeBadge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import type { ContentItem } from "@/types/content";

type Variante = "card" | "featured" | "live";

const classeCard: Record<Variante, string> = {
  card: "w-[260px] shrink-0 sm:w-[280px]",
  featured: "w-[300px] shrink-0 sm:w-[360px]",
  live: "w-[280px] shrink-0 sm:w-[320px]",
};

export type ProgressoPorSlug = Record<string, { percent: number; completo: boolean }>;

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Fileira estilo "plataforma de streaming": clicar num card NÃO abre outra página, abre um painel de detalhes
 * embaixo da fileira (imagem grande, título, descrição, Iniciar e Minha lista) com uma setinha laranja
 * apontando para o card escolhido. Clicar de novo, no X ou apertar Esc fecha. Ctrl/⌘+clique abre o conteúdo
 * normalmente.
 */
export function CatalogoRow({
  titulo,
  href,
  itens,
  variante = "card",
  progresso,
}: {
  titulo: string;
  href?: string;
  itens: ContentItem[];
  variante?: Variante;
  progresso?: ProgressoPorSlug;
}) {
  const [sel, setSel] = useState<string | null>(null);
  const [setaX, setSetaX] = useState(40);
  const areaRef = useRef<HTMLDivElement>(null);

  const item = itens.find((i) => i.slug === sel) ?? null;

  /** Centro do card escolhido, em relação à área da fileira (onde fica a setinha). */
  const medir = useCallback((slug: string | null) => {
    const area = areaRef.current;
    if (!area || !slug) return;
    const card = area.querySelector<HTMLElement>(`[data-slug="${slug}"]`);
    if (!card) return;
    const a = area.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    setSetaX(Math.min(Math.max(c.left + c.width / 2 - a.left, 28), a.width - 28));
  }, []);

  // Enquanto há card aberto: a setinha acompanha a rolagem da fileira e o redimensionamento; Esc fecha.
  useEffect(() => {
    if (!sel) return;
    const fila = areaRef.current?.querySelector<HTMLElement>(".fila-cards");
    const aoMover = () => medir(sel);
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && setSel(null);
    fila?.addEventListener("scroll", aoMover, { passive: true });
    window.addEventListener("resize", aoMover);
    window.addEventListener("keydown", aoTeclar);
    return () => {
      fila?.removeEventListener("scroll", aoMover);
      window.removeEventListener("resize", aoMover);
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [sel, medir]);

  function selecionar(slug: string) {
    if (sel === slug) {
      setSel(null);
      return;
    }
    setSel(slug);
    medir(slug);
    // leva o card escolhido para o centro da fileira (a rolagem suave atualiza a setinha pelo listener acima)
    areaRef.current
      ?.querySelector<HTMLElement>(`[data-slug="${slug}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  const Card = variante === "featured" ? FeaturedCard : variante === "live" ? LiveCard : ContentCard;

  return (
    <section className="py-6 sm:py-8">
      <Container>
        <Reveal className="mb-4 flex items-center justify-between sm:mb-5" y={16}>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{titulo}</h2>
          {href && (
            <Link
              href={href}
              className="group flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-brand-orange-light"
            >
              Ver todos
              <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </Reveal>

        <div ref={areaRef} className="relative">
          <Stagger
            stagger={0.08}
            className="fila-cards scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 pt-3 sm:-mx-6 sm:gap-5 sm:px-6 lg:-mx-10 lg:px-10"
          >
            {itens.map((it) => (
              <Card
                key={it.slug}
                item={it}
                className={classeCard[variante]}
                selecionado={sel === it.slug}
                aoSelecionar={() => selecionar(it.slug)}
              />
            ))}
          </Stagger>

          <AnimatePresence initial={false}>
            {item && (
              <motion.div
                key="painel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="relative pt-3">
                  {/* setinha laranja apontando para o card aberto */}
                  <motion.span
                    aria-hidden
                    className="absolute top-0 z-10 h-0 w-0 -translate-x-1/2 border-x-[13px] border-b-[13px] border-x-transparent border-b-brand-orange"
                    initial={{ left: setaX }}
                    animate={{ left: setaX }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <AnimatePresence mode="wait" initial={false}>
                    <PainelDetalhe
                      key={item.slug}
                      item={item}
                      status={progresso?.[item.slug]}
                      aoFechar={() => setSel(null)}
                    />
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}

function PainelDetalhe({
  item,
  status,
  aoFechar,
}: {
  item: ContentItem;
  status?: { percent: number; completo: boolean };
  aoFechar: () => void;
}) {
  const rotuloBotao = status?.completo ? "Assistir de novo" : status && status.percent > 0 ? "Continuar" : "Iniciar";
  const rotuloStatus = status?.completo ? "Concluído" : status && status.percent > 0 ? `${status.percent}% assistido` : "Disponível";
  const subtitulo = [item.categoryName, item.mentor && `com ${item.mentor}`].filter(Boolean).join(" · ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: EASE }}
      className="relative grid overflow-hidden rounded-2xl border border-white/10 bg-surface-elevated shadow-elevated md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
    >
      <div className="relative aspect-video md:aspect-auto md:min-h-[280px]">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, 480px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-surface-elevated/70 max-md:bg-gradient-to-t" />
      </div>

      <div className="flex flex-col p-6 sm:p-8">
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar detalhes"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-brand-orange/70 text-lg leading-none text-brand-orange-light transition-all hover:rotate-90 hover:bg-brand-orange hover:text-white"
        >
          ×
        </button>

        <h3 className="pr-12 text-2xl font-bold tracking-tight text-foreground">{item.title}</h3>
        {subtitulo && <p className="mt-1 text-sm text-muted">{subtitulo}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <TypeBadge type={item.type} />
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-foreground">
            <span className={`h-2 w-2 rounded-full ${status?.completo ? "bg-emerald-400" : "bg-brand-orange"}`} />
            {rotuloStatus}
          </span>
          {item.duration && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-foreground">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-brand-orange-light" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              {item.duration}
            </span>
          )}
        </div>

        {item.description && (
          <p className="mt-4 line-clamp-5 text-sm leading-relaxed text-muted">{item.description}</p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
          <Link
            href={`/conteudos/${item.slug}`}
            className="btn-shine inline-flex items-center gap-2 rounded-lg bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/20 transition-all hover:bg-brand-orange-light hover:shadow-brand-orange/40"
          >
            <PlayIcon className="h-4 w-4" />
            {rotuloBotao}
          </Link>
          <BotaoMinhaLista uuid={item.uuid} titulo={item.title} />
        </div>
      </div>
    </motion.div>
  );
}
