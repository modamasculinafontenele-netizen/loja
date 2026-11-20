import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fontenele Moda Masculina | Moda & Gestão",
  description: "Catálogo digital e sistema integrado de vendas e estoque.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
