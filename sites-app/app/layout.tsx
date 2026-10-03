import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Арабикос — арабский для понимания Корана",
  description: "Уроки по 10 слов, предложения из изученного и интервальное повторение.",
  other: {
    "codex-preview": "development",
  },
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
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Golos+Text:wght@400;450;500;600;700&family=Lora:wght@400;500;600&display=swap" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
