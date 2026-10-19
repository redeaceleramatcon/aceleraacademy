"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";

const MAX_LADO = 1600;

/**
 * Reduz a imagem escolhida (celulares e câmeras geram arquivos de vários MB) para no máximo 1600 px de
 * largura/altura, em JPEG qualidade 90. Imagens que já são leves e pequenas seguem como estão.
 */
async function reduzirImagem(arquivo: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(arquivo);
    const maior = Math.max(bitmap.width, bitmap.height);
    if (maior <= MAX_LADO && arquivo.size <= 900 * 1024) return arquivo;

    const escala = Math.min(1, MAX_LADO / maior);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    const ctx = canvas.getContext("2d");
    if (!ctx) return arquivo;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.9));
    if (!blob || blob.size >= arquivo.size) return arquivo;
    return new File([blob], arquivo.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return arquivo; // se o navegador não conseguir ler/reduzir, envia o original (o servidor valida o tamanho)
  }
}

/**
 * Seletor de capa: mostra a prévia (16:9, como no catálogo) e coloca a imagem já reduzida dentro do campo
 * de arquivo do formulário, então o envio funciona como qualquer `<form action>`.
 */
export function CapaUploader({
  name = "capa",
  capaAtual,
  textoVazio = "Sem capa própria: será usada a miniatura do YouTube.",
  compacto = false,
  className,
}: {
  name?: string;
  /** Capa que o vídeo tem hoje (aparece até escolher outra). */
  capaAtual?: string | null;
  textoVazio?: string;
  compacto?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");

  async function aoEscolher(e: ChangeEvent<HTMLInputElement>) {
    const original = e.target.files?.[0];
    if (!original) {
      setPrevia(null);
      setAviso("");
      return;
    }
    if (!/^image\/(jpeg|png|webp)$/.test(original.type)) {
      setAviso("Use uma imagem JPG, PNG ou WebP.");
      setPrevia(null);
      e.target.value = "";
      return;
    }
    const final = await reduzirImagem(original);
    const dt = new DataTransfer();
    dt.items.add(final);
    if (inputRef.current) inputRef.current.files = dt.files;
    setPrevia((antiga) => {
      if (antiga) URL.revokeObjectURL(antiga);
      return URL.createObjectURL(final);
    });
    setAviso(`${final.name} · ${Math.max(1, Math.round(final.size / 1024))} KB`);
  }

  const imagem = previa ?? capaAtual ?? null;

  return (
    <div className={cn("flex items-center gap-4", compacto ? "" : "flex-col items-stretch sm:flex-row sm:items-start", className)}>
      <div
        className={cn(
          "relative aspect-video shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5",
          compacto ? "w-36" : "w-full sm:w-56",
        )}
      >
        {imagem ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagem} alt="Prévia da capa" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center px-3 text-center text-[11px] leading-snug text-subtle">
            {textoVazio}
          </span>
        )}
        {previa && (
          <span className="absolute left-1.5 top-1.5 rounded bg-brand-orange px-1.5 py-0.5 text-[10px] font-semibold text-white">
            Nova
          </span>
        )}
      </div>

      <div className="min-w-0">
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/jpeg,image/png,image/webp"
          onChange={aoEscolher}
          className="block w-full max-w-xs text-xs text-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-white/20 file:bg-white/5 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:border-brand-blue-light/60 hover:file:bg-brand-blue-light/10"
        />
        <p className="mt-1.5 text-[11px] text-subtle">{aviso || "JPG, PNG ou WebP, na proporção 16:9 (ex.: 1280×720)."}</p>
      </div>
    </div>
  );
}
