import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "JudulAI — Asisten AI Kelayakan Judul Skripsi",
    template: "%s | JudulAI",
  },
  description:
    "Asisten AI internal untuk membantu Kaprodi menilai keselarasan judul skripsi dengan isi Bab 1.",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}