import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Header } from "@/components/layout/Header";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LinkedIn Job Finder v4 | Busca Inteligente",
  description: "Encontre as melhores vagas no LinkedIn usando Inteligência Artificial para otimizar seus filtros.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`} suppressHydrationWarning>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
