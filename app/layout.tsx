import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Controle de Paletes",
description: "Gestão e rastreabilidade de paletes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* MENU SUPERIOR */}
        <nav style={{ padding: "12px", borderBottom: "1px solid #e5e7eb" }}>
          <Link href="/" style={{ marginRight: "16px" }}>
            Início
          </Link>

          <Link href="/historico">
            Histórico
          </Link>
        </nav>

        {/* CONTEÚDO */}
        <main style={{ padding: "16px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
