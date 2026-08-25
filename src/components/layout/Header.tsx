"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { MenuIcon, CloseIcon } from "@/components/icons";
import { SearchButton } from "@/components/layout/SearchButton";
import { UserMenu } from "@/components/layout/UserMenu";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/conteudos", label: "Conteúdos" },
  { href: "/categorias/vendas", label: "Categorias" },
  { href: "/minha-area", label: "Minha área" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || mobileOpen
          ? "border-b border-white/5 bg-background/85 backdrop-blur-md"
          : "bg-gradient-to-b from-brand-blue-dark/70 to-transparent"
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between sm:h-20">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                Acelera <span className="text-brand-orange">Academy</span>
              </span>
            </Link>
            <nav className="hidden items-center gap-6 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-white/70 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <SearchButton />
            <UserMenu />
            <button
              onClick={() => setMobileOpen((value) => !value)}
              className="flex h-9 w-9 items-center justify-center text-white lg:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </Container>

      {mobileOpen && (
        <div className="border-t border-white/5 bg-background/95 backdrop-blur-md lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            <div className="mb-2">
              <SearchButton variant="mobile" />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </Container>
        </div>
      )}
    </header>
  );
}
