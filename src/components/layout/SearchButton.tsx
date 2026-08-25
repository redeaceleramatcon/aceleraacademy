"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function SearchButton({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const [open, setOpen] = useState(variant === "mobile");
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    if (value) {
      router.push(`/conteudos?q=${encodeURIComponent(value)}`);
      if (variant === "desktop") setOpen(false);
    }
  }

  if (variant === "mobile") {
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

  return (
    <form onSubmit={handleSubmit} className="hidden items-center sm:flex">
      <div
        className={cn(
          "flex items-center overflow-hidden rounded-full border transition-all duration-300",
          open ? "w-56 border-white/20 bg-white/5 px-3" : "w-9 border-transparent"
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Buscar"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center text-white/80 transition-colors hover:text-white"
        >
          <SearchIcon className="h-4 w-4" />
        </button>
        {open && (
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar conteúdos..."
            className="w-full bg-transparent py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
        )}
      </div>
    </form>
  );
}
