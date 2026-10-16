"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Confetti } from "@/components/motion/Confetti";
import { toast } from "@/components/motion/toast";
import { registrarEvento } from "@/lib/eventos";
import { atualizarProgresso } from "@/lib/progresso";

const INTERVALO_PROGRESSO_MS = 10_000;

interface YTPlayer {
  getCurrentTime(): number;
  getDuration(): number;
  seekTo(segundos: number, permitirAvanco: boolean): void;
  destroy(): void;
}

interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}

interface YTNamespace {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      host?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onStateChange?: (e: YTPlayerEvent) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiCarregando: Promise<YTNamespace> | null = null;

function carregarApiYoutube(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiCarregando) return apiCarregando;

  apiCarregando = new Promise((resolve) => {
    const anterior = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      anterior?.();
      resolve(window.YT!);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  });
  return apiCarregando;
}

/**
 * Player instrumentado: grava content_progress (posição/percentual) a cada
 * 10s enquanto toca, e os eventos-chave video_start/pause/complete. Usa a
 * YouTube IFrame API (não um <iframe src=...> estático) porque só ela expõe
 * o estado de reprodução e getCurrentTime().
 *
 * Experiência: se o aluno já tinha começado (e não terminou), o vídeo abre
 * no ponto onde parou, com um aviso "Retomando de mm:ss" e a opção de
 * recomeçar; ao concluir, solta confete e mostra um aviso de parabéns.
 */
export function YoutubePlayer({
  videoId,
  contentId,
  title,
  retomarDe = 0,
}: {
  videoId: string;
  contentId: string;
  title: string;
  /** Segundo onde o aluno parou (0 = começar do início). Só use se o conteúdo ainda não foi concluído. */
  retomarDe?: number;
}) {
  const [aviso, setAviso] = useState(retomarDe >= 10);
  const [confete, setConfete] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const iniciadoRef = useRef(false);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelado = false;

    carregarApiYoutube().then((YT) => {
      if (cancelado || !containerRef.current) return;

      playerRef.current = new YT.Player(containerRef.current, {
        videoId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          ...(retomarDe >= 10 ? { start: Math.floor(retomarDe) } : {}),
        },
        events: {
          onStateChange: (e) => {
            const player = e.target;
            const posicao = player.getCurrentTime();
            const duracao = player.getDuration();

            if (e.data === YT.PlayerState.PLAYING) {
              if (!iniciadoRef.current) {
                iniciadoRef.current = true;
                registrarEvento("video_start", { contentId });
                atualizarProgresso(contentId, posicao, duracao, { iniciar: true });
              }
              if (intervaloRef.current) clearInterval(intervaloRef.current);
              intervaloRef.current = setInterval(() => {
                atualizarProgresso(contentId, player.getCurrentTime(), player.getDuration());
              }, INTERVALO_PROGRESSO_MS);
            } else if (e.data === YT.PlayerState.PAUSED) {
              if (intervaloRef.current) clearInterval(intervaloRef.current);
              registrarEvento("video_pause", { contentId, detalhe: { segundos: Math.round(posicao) } });
              atualizarProgresso(contentId, posicao, duracao);
            } else if (e.data === YT.PlayerState.ENDED) {
              if (intervaloRef.current) clearInterval(intervaloRef.current);
              registrarEvento("video_complete", { contentId });
              atualizarProgresso(contentId, duracao, duracao, { completo: true });
              setConfete((n) => n + 1);
              toast("Conteúdo concluído! Parabéns pelo avanço 🎉", "sucesso", 6000);
            }
          },
        },
      });
    });

    return () => {
      cancelado = true;
      if (intervaloRef.current) clearInterval(intervaloRef.current);
      playerRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, contentId]);

  // O aviso de retomada some sozinho depois de alguns segundos.
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(false), 8000);
    return () => clearTimeout(t);
  }, [aviso]);

  const mm = String(Math.floor(retomarDe / 60)).padStart(1, "0");
  const ss = String(Math.floor(retomarDe % 60)).padStart(2, "0");

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} title={title} className="h-full w-full" />
      <Confetti disparo={confete} />
      <AnimatePresence>
        {aviso && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="absolute left-3 top-3 z-10 flex items-center gap-3 rounded-full border border-white/15 bg-black/70 py-1.5 pl-4 pr-1.5 text-xs text-white backdrop-blur"
          >
            <span>
              Retomando de <strong className="tabular-nums">{mm}:{ss}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                playerRef.current?.seekTo(0, true);
                setAviso(false);
              }}
              className="rounded-full bg-white/15 px-3 py-1 font-semibold transition-colors hover:bg-white/25"
            >
              Recomeçar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
