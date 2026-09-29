"use client";

import Link from "next/link";
import { useActionState } from "react";
import { criarConteudo, type NovoConteudoState } from "../actions";
import type { CategoriaAdmin, MentorAdmin } from "@/lib/conteudo";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 transition-colors focus:border-brand-blue-light/60 focus:outline-none";

const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-subtle";

const TIPOS: { value: string; label: string }[] = [
  { value: "lesson", label: "Aula" },
  { value: "course", label: "Curso" },
  { value: "live", label: "Live" },
  { value: "interview", label: "Entrevista" },
  { value: "webinar", label: "Webinar" },
  { value: "partner", label: "Parceiro" },
];

export function NovoConteudoForm({
  categorias,
  mentores,
}: {
  categorias: CategoriaAdmin[];
  mentores: MentorAdmin[];
}) {
  const [state, formAction, pending] = useActionState<NovoConteudoState, FormData>(criarConteudo, {});

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label className={labelClass} htmlFor="youtube_url">
          Link do vídeo no YouTube
        </label>
        <input
          id="youtube_url"
          name="youtube_url"
          type="text"
          required
          placeholder="https://www.youtube.com/watch?v=..."
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="title">
          Título
        </label>
        <input id="title" name="title" type="text" required className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="description">
          Descrição
        </label>
        <textarea id="description" name="description" rows={3} className={inputClass} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="category_slug">
            Categoria
          </label>
          <select id="category_slug" name="category_slug" required className={inputClass}>
            <option value="">Escolha...</option>
            {categorias.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="content_type">
            Tipo
          </label>
          <select id="content_type" name="content_type" required defaultValue="lesson" className={inputClass}>
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="mentor_id">
            Mentor (opcional)
          </label>
          <select id="mentor_id" name="mentor_id" className={inputClass}>
            <option value="">Nenhum</option>
            {mentores.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="mentor_nome_novo">
            ...ou nome de um mentor novo
          </label>
          <input
            id="mentor_nome_novo"
            name="mentor_nome_novo"
            type="text"
            placeholder="Só se não estiver na lista"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <span className={labelClass}>Quem pode ver</span>
        <div className="flex flex-col gap-2 text-sm text-foreground sm:flex-row sm:gap-6">
          <label className="flex items-center gap-2">
            <input type="radio" name="visibility" value="public" defaultChecked />
            Todo mundo (público)
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="visibility" value="associates" />
            Só quem está logado (associados)
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm text-foreground sm:flex-row sm:gap-6">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="publicar_agora" defaultChecked />
          Publicar agora
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" />
          Destacar na Home
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Criar conteúdo"}
        </button>
      </div>

      {state.error && (
        <p role="alert" className="text-xs text-brand-orange-light">
          {state.error}
        </p>
      )}
      {state.aviso && (
        <p className="text-xs text-brand-blue-light">
          {state.aviso}
          {state.slug && (
            <>
              {" "}
              <Link href={`/conteudos/${state.slug}`} className="underline">
                Ver conteúdo →
              </Link>
            </>
          )}
        </p>
      )}
    </form>
  );
}
