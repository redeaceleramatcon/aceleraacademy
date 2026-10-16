"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { buscarRapido, type ResultadoBusca } from "@/app/busca/actions";
import { SearchIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface Opcao {
  id: string;
  titulo: string;
  detalhe?: string;
  href: string;
  imagem?: string;
  grupo: "Conteúdos" | "Categorias" | "Buscar";
}

const VAZIO: ResultadoBusca = { conteudos: [], categorias: [] };

/**
 * Busca rápida em tela cheia (Ctrl+K / ⌘K): resultados ao vivo enquanto digita, navegação por setas,
 * Enter abre, Esc fecha. O botão da barra superior só abre esta janela.
 */
export function CommandPalette() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [termo, setTermo] = useState("");
  const [dados, setDados] = useState<ResultadoBusca>(VAZIO);
  const [carregando, setCarregando] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const pedido = useRef(0);

  // atalho global
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAberto((v) => !v);
      }
      if (e.key === "Escape") setAberto(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // busca com atraso (debounce) e descarte de respostas atrasadas
  useEffect(() => {
    if (!aberto) return;
    const id = ++pedido.current;
    const t = setTimeout(async () => {
      setCarregando(true);
      try {
        const r = await buscarRapido(termo);
        if (id === pedido.current) {
          setDados(r);
          setAtivo(0);
        }
      } finally {
        if (id === pedido.current) setCarregando(false);
      }
    }, termo ? 180 : 0);
    return () => clearTimeout(t);
  }, [termo, aberto]);

  const fechar = useCallback(() => {
    setAberto(false);
    setTermo("");
  }, []);

  const opcoes: Opcao[] = [
    ...dados.conteudos.map<Opcao>((c) => ({
      id: `c-${c.slug}`,
      titulo: c.titulo,
      detalhe: [c.categoria, c.tipo].filter(Boolean).join(" · "),
      href: `/conteudos/${c.slug}`,
      imagem: c.imagem,
      grupo: "Conteúdos",
    })),
    ...dados.categorias.map<Opcao>((c) => ({
      id: `k-${c.slug}`,
      titulo: c.nome,
      detalhe: "Categoria",
      href: `/categorias/${c.slug}`,
      grupo: "Categorias",
    })),
    ...(termo.trim()
      ? [{ id: "todos", titulo: `Ver todos os resultados para "${termo.trim()}"`, href: `/conteudos?q=${encodeURIComponent(termo.trim())}`, grupo: "Buscar" as const }]
      : []),
  ];

  function aoTeclar(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAtivo((i) => Math.min(opcoes.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAtivo((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && opcoes[ativo]) {
      e.preventDefault();
      router.push(opcoes[ativo].href);
      fechar();
    }
  }

  let ultimoGrupo = "";

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label="Buscar (Ctrl+K)"
        className="hidden h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-3 pr-2 text-sm text-white/70 transition-colors hover:border-white/25 hover:text-white sm:flex"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="hidden md:inline">Buscar</span>
        <kbd className="hidden rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white/50 md:inline">
          Ctrl K
        </kbd>
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={fechar} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Buscar conteúdos"
              initial={{ opacity: 0, y: -24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-elevated"
              onKeyDown={aoTeclar}
            >
              <div className="flex items-center gap-3 border-b border-white/10 px-4">
                <SearchIcon className="h-5 w-5 flex-shrink-0 text-white/50" />
                <input
                  autoFocus
                  value={termo}
                  onChange={(e) => setTermo(e.target.value)}
                  placeholder="Buscar conteúdos, categorias..."
                  className="w-full bg-transparent py-4 text-base text-white placeholder:text-white/35 focus:outline-none"
                />
                <motion.span
                  aria-hidden
                  animate={{ opacity: carregando ? 1 : 0, rotate: 360 }}
                  transition={{ rotate: { repeat: Infinity, duration: 0.8, ease: "linear" }, opacity: { duration: 0.15 } }}
                  className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-white/20 border-t-brand-orange"
                />
                <kbd className="rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white/50">Esc</kbd>
              </div>

              <ul className="max-h-[52vh] overflow-y-auto p-2">
                {opcoes.length === 0 && !carregando && (
                  <li className="px-3 py-8 text-center text-sm text-muted">Nada encontrado para essa busca.</li>
                )}
                {opcoes.map((o, i) => {
                  const novoGrupo = o.grupo !== ultimoGrupo;
                  ultimoGrupo = o.grupo;
                  return (
                    <li key={o.id}>
                      {novoGrupo && (
                        <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-subtle first:pt-1">
                          {o.grupo === "Conteúdos" && !termo ? "Recentes" : o.grupo}
                        </p>
                      )}
                      <motion.button
                        type="button"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(i, 8) * 0.025 }}
                        onMouseEnter={() => setAtivo(i)}
                        onClick={() => {
                          router.push(o.href);
                          fechar();
                        }}
                        className={cn(
                          "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                          ativo === i ? "text-white" : "text-white/75",
                        )}
                      >
                        {ativo === i && (
                          <motion.span
                            layoutId="paleta-ativo"
                            className="absolute inset-0 rounded-xl bg-white/10"
                            transition={{ type: "spring", stiffness: 500, damping: 38 }}
                          />
                        )}
                        {o.imagem ? (
                          <span className="relative h-9 w-16 flex-shrink-0 overflow-hidden rounded-md bg-surface-elevated">
                            <Image src={o.imagem} alt="" fill sizes="64px" className="object-cover" />
                          </span>
                        ) : (
                          <span className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-brand-blue-light/15 text-brand-blue-light">
                            <SearchIcon className="h-4 w-4" />
                          </span>
                        )}
                        <span className="relative min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{o.titulo}</span>
                          {o.detalhe && <span className="block truncate text-xs text-subtle">{o.detalhe}</span>}
                        </span>
                        {ativo === i && <span className="relative text-xs text-subtle">↵</span>}
                      </motion.button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
