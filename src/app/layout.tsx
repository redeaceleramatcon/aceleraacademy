import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RastreioAtividade } from "@/components/RastreioAtividade";
import { BackToTop } from "@/components/motion/BackToTop";
import { CursorGlow } from "@/components/motion/CursorGlow";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { Toaster } from "@/components/motion/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Acelera Academy",
  description: "Plataforma de conteúdos da Acelera Matcon",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <RastreioAtividade />
        <MotionProvider>
          <ScrollProgress />
          <CursorGlow />
          {children}
          <Toaster />
          <BackToTop />
        </MotionProvider>
      </body>
    </html>
  );
}
