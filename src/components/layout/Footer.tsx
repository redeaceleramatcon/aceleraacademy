import Link from "next/link";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background py-10">
      <Container className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-sm font-semibold text-white">
            Acelera <span className="text-brand-orange">Academy</span>
          </p>
          <p className="mt-1 text-xs text-subtle">Um produto Acelera Matcon</p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted">
          <Link href="#" className="transition-colors hover:text-foreground">
            Política de privacidade
          </Link>
          <Link href="#" className="transition-colors hover:text-foreground">
            Termos
          </Link>
          <Link href="#" className="transition-colors hover:text-foreground">
            Suporte
          </Link>
        </nav>

        <p className="text-xs text-subtle">
          © {new Date().getFullYear()} Acelera Matcon. Todos os direitos reservados.
        </p>
      </Container>
    </footer>
  );
}
