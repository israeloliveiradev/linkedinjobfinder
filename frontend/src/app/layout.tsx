import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Header } from "@/components/layout/Header";
import { Providers } from "./providers";
import { WhatsAppSupport } from "@/components/layout/WhatsAppSupport";
import Script from "next/script";
 
const inter = Inter({ subsets: ["latin"] });
 
export const metadata: Metadata = {
  title: "vagas.rankia.cloud | Localizador de Vagas de Elite",
  description: "Mapeie e encontre as melhores vagas no LinkedIn de forma cirúrgica e direta.",
};
 
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`} suppressHydrationWarning>
        {/* Google Analytics Integration */}
        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
        <Providers>
          <Header />
          {children}
          <WhatsAppSupport />
        </Providers>
      </body>
    </html>
  );
}
