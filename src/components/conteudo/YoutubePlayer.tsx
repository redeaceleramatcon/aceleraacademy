"use client";

import { useEffect, useRef } from "react";
import { registrarEvento } from "@/lib/eventos";
import { atualizarProgresso } from "@/lib/progresso";

const INTERVALO_PROGRESSO_MS = 10_000;

interface YTPlayer {
  getCurrentTime(): number;
  getDuration(): number;
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
 */
export function YoutubePlayer({
  videoId,
  contentId,
  title,
}: {
  videoId: string;
  contentId: string;
  title: string;
}) {
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
        playerVars: { modestbranding: 1, rel: 0, iv_load_policy: 3 },
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

  return <div ref={containerRef} title={title} className="h-full w-full" />;
}
