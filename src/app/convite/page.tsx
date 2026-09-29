import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { DefinirSenhaForm } from "./DefinirSenhaForm";

/**
 * Página de pouso de todo link de e-mail que estabelece sessão via hash
 * (#access_token=...) — convite (Fase 4/"interno") e recuperação de senha
 * futuramente. O Supabase confirma o token no próprio domínio dele e manda
 * o navegador pra cá já com os tokens; antes desta página existir, o link
 * não tinha onde cair (por isso "clicou mas não funcionou").
 */
export default function ConvitePage() {
  return (
    <>
      <Header />
      <main className="pt-24 sm:pt-28">
        <Container className="pb-16 pt-2 sm:pt-4">
          <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-surface p-8">
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">Bem-vindo(a) à Academy</h1>
            <p className="mt-2 text-sm text-muted">Defina sua senha para acessar a plataforma.</p>
            <DefinirSenhaForm />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
