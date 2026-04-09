import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Space_Grotesk, Caveat } from "next/font/google";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BITCRAFT",
  description: "BITCRAFT: fábrica de software, IA e agência de marketing.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} ${caveat.variable} antialiased`}>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
