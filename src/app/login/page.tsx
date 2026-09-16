import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: destino } = await searchParams;
  const user = await getSessionUser();
  if (user) redirect(destino && destino.startsWith("/") ? destino : "/minha-area");

  const redirectTo = destino && destino.startsWith("/") && !destino.startsWith("//")
    ? destino
    : "/minha-area";

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden py-16">
      {/* Mesma atmosfera do Hero: azul institucional descendo para o fundo. */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-blue-dark/70 via-background to-background" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <Container className="relative">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white">
              Acelera <span className="text-brand-orange">Academy</span>
            </span>
          </Link>

          <div className="mt-8 rounded-2xl border border-white/10 bg-surface/80 p-6 backdrop-blur-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange-light">
              Área do associado
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Entrar na Academy
            </h1>
            <p className="mt-2 text-sm text-muted">
              Use o e-mail e a senha cadastrados na Rede Acelera Matcon.
            </p>

            <LoginForm redirectTo={redirectTo} />
          </div>

          <p className="mt-6 text-center text-xs text-subtle">
            Ainda não tem acesso? Fale com a equipe da Rede Acelera Matcon.
          </p>
          <p className="mt-2 text-center text-xs text-subtle">
            <Link href="/conteudos" className="transition-colors hover:text-brand-orange-light">
              Voltar para o catálogo
            </Link>
          </p>
        </div>
      </Container>
    </main>
  );
}
