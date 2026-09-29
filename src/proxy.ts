import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Proxy (o antigo middleware, renomeado no Next 16).
 *
 * Duas responsabilidades:
 *  1. Renovar o token do Supabase e devolver os cookies atualizados na resposta.
 *     Sem isso a sessão expira sozinha e o usuário é deslogado sem motivo.
 *  2. Barrar /minha-area para quem não está autenticado, preservando o destino
 *     em ?redirect= para voltar depois do login.
 *
 * O catálogo continua público: nada aqui bloqueia /, /conteudos ou /categorias.
 */
const ROTAS_PROTEGIDAS = ["/minha-area", "/equipe", "/admin", "/atividade"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser valida o token no Supabase; getSession apenas leria o cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const protegida = ROTAS_PROTEGIDAS.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`),
  );

  if (!user && protegida) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Quem já tem sessão não precisa de login nem de cadastro.
  if (user && (pathname === "/login" || pathname === "/cadastro")) {
    const url = request.nextUrl.clone();
    url.pathname = "/minha-area";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Fora: estáticos, imagens otimizadas, favicon e arquivos de mídia.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
