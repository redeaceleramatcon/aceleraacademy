import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    // O Next guarda as imagens otimizadas por 4 h por padrão; com 5 min, uma capa nova do YouTube não demora horas para aparecer.
    minimumCacheTTL: 300,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      // Capas enviadas pela própria Academy (bucket público "capas" do Supabase Storage).
      ...(supabaseHost
        ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
    ],
  },
  experimental: {
    // O envio de capa vai junto do formulário (padrão do Next é 1 MB). A tela já reduz a imagem antes de enviar;
    // o teto da Vercel para o corpo de uma requisição é 4,5 MB.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
