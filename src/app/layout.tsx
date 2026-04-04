import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ФРЕЙМВОРК 444 | Архитектура Идеального Сайта",
  description:
    "Увеличение производства в 10 раз за счет ИИ-слоя и профессиональной инфраструктуры. AI-driven разработка, высоконагруженные системы, автоматические воронки продаж.",
  keywords: [
    "фреймворк 444",
    "AI разработка",
    "веб-разработка",
    "Next.js",
    "ИИ-агенты",
  ],
  openGraph: {
    title: "ФРЕЙМВОРК 444 | Архитектура Идеального Сайта",
    description:
      "Увеличение производства в 10 раз за счет ИИ-слоя и профессиональной инфраструктуры.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <div className="scanline-overlay" />
        {children}
      </body>
    </html>
  );
}
