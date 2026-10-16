"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/icons";
import { CommandPalette } from "@/components/layout/CommandPalette";

/**
 * Desktop: botão que abre a busca rápida (Ctrl+K). Celular: campo de busca direto no menu,
 * que leva para a listagem filtrada.
 */
export function SearchButton({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  return variant === "mobile" ? <BuscaMobile /> : <CommandPalette />;
}

function BuscaMobile() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    if (value) router.push(`/conteudos?q=${encodeURIComponent(value)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3"
    >
      <SearchIcon className="h-4 w-4 flex-shrink-0 text-white/50" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar conteúdos..."
        className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none"
      />
    </form>
  );
}
