import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PlacaLogo, type MarcaId } from "@/components/marca/PlacaLogo";

const rede: { marca: MarcaId; href: string }[] = [
  { marca: "monitor", href: "https://monitor.aceleramatcon.com.br" },
  { marca: "erp", href: "https://site.astromatcon.com.br" },
  { marca: "tech", href: "https://www.grupoacellera.com.br" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-background py-10">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <div className="flex flex-col items-center gap-3 lg:items-start">
            <a href="https://www.grupoacellera.com.br" target="_blank" rel="noopener noreferrer" className="block transition-opacity hover:opacity-80">
              <Image src="/brand/grupo-acellera-logo.png" alt="Grupo Acellera" width={1604} height={472} className="h-10 w-auto" />
            </a>
            <p className="text-sm font-semibold text-white">
              Acelera <span className="text-brand-orange">Academy</span>
            </p>
            <p className="text-xs text-subtle">Um produto Acelera Matcon</p>
          </div>

          <div className="flex flex-col items-center gap-2 lg:items-end">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-subtle">Também na rede Acelera</p>
            <ul className="flex items-center gap-3">
              {rede.map((r) => (
                <li key={r.marca}>
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transition-transform duration-300 hover:-translate-y-1 hover:scale-105"
                  >
                    <PlacaLogo marca={r.marca} className="h-14 w-20 rounded-xl p-2" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 border-t border-white/5 pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
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
        </div>
      </Container>
    </footer>
  );
}
