import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Space_Grotesk, Caveat } from "next/font/google";
import { cookies } from "next/headers";
import PageTransition from "@/components/PageTransition";
import { I18nProvider } from "@/components/I18nProvider";
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
  metadataBase: new URL("https://bitcraft.dev.br"),
  openGraph: {
    title: "BITCRAFT",
    description: "BITCRAFT: fábrica de software, IA e agência de marketing.",
    siteName: "BITCRAFT",
    url: "https://bitcraft.dev.br",
    locale: "pt_BR",
    alternateLocale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BITCRAFT",
    description: "BITCRAFT: fábrica de software, IA e agência de marketing.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.svg",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("bitcraft_locale")?.value ?? "pt";

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} ${caveat.variable} antialiased`}>
        <I18nProvider initialLocale={locale}>
          <PageTransition>{children}</PageTransition>
        </I18nProvider>
      </body>
    </html>
  );
}
