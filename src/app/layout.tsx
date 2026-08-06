import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
);

export const metadata: Metadata = {
  metadataBase,
  title: "Meu Mês",
  description:
    "Seu dinheiro, em movimento. Acompanhe gastos, cartões, metas e o ritmo do mês em uma experiência financeira visual.",
  manifest: "/manifest.json",
  applicationName: "Meu Mês",
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Meu Mês",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Meu Mês",
    description: "Seu dinheiro, em movimento.",
    images: [
      {
        url: "/og.png",
        width: 1748,
        height: 909,
        alt: "Meu Mês — Seu dinheiro, em movimento.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meu Mês",
    description: "Seu dinheiro, em movimento.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#181c19",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-hidden bg-[var(--background)] text-[var(--app-ink)]">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
