import type { Metadata, Viewport } from "next";
import "./globals.css";

/**
 * Migración a Next.js 15: mover viewport/themeColor/colorScheme a la exportación `viewport`
 * https://nextjs.org/docs/app/api-reference/functions/generate-viewport
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#8b5cf6",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: "FinanceApp - Gestión Financiera Personal",
  description:
    "Aplicación moderna para gestionar tus finanzas personales con estilo inspirado en Spotify",
  keywords: ["finanzas", "gestión financiera", "presupuesto", "transacciones", "cuentas"],
  authors: [{ name: "FinanceApp Team" }],
  robots: "index, follow",
  openGraph: {
    title: "FinanceApp - Gestión Financiera Personal",
    description: "Aplicación moderna para gestionar tus finanzas personales",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "FinanceApp - Gestión Financiera Personal",
    description: "Aplicación moderna para gestionar tus finanzas personales",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        {/* Load Google Fonts */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap"
        />

        {/* PWA and mobile optimization */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FinanceApp" />

        {/* Performance and security */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        {/* X-Frame-Options debe ir por cabecera HTTP; se elimina para evitar warnings en cliente */}
        {/* <meta httpEquiv="X-Frame-Options" content="DENY" /> */}
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body className="font-sans antialiased bg-background-primary text-text-primary overflow-x-hidden">
        {/* Loading fallback para JavaScript deshabilitado */}
        <noscript>
          <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">F</span>
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">JavaScript Requerido</h1>
              <p className="text-text-muted">
                FinanceApp requiere JavaScript para funcionar correctamente. Por favor, habilita
                JavaScript en tu navegador e intenta nuevamente.
              </p>
            </div>
          </div>
        </noscript>

        {/* Main application container */}
        <div id="root" className="min-h-screen">
          {children}
        </div>

        {/* Portal container for modals, tooltips, etc. */}
        <div id="portal-root" />

        {/* Performance monitoring script (solo en producción) */}
        {process.env.NODE_ENV === "production" && <script src="/performance-monitor.js" async />}
      </body>
    </html>
  );
}
