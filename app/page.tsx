import type { Metadata } from "next";
import HomeContent from "@/components/HomeContent";

export const metadata: Metadata = {
  title: "BITCRAFT | Onde Código Encontra Crescimento",
  description: "A maioria constrói. Poucos crescem. A Bitcraft faz os dois. Engenharia que entrega e marketing que converte.",
  openGraph: {
    title: "BITCRAFT | Onde Código Encontra Crescimento",
    description: "A maioria constrói. Poucos crescem. A Bitcraft faz os dois.",
    url: "https://bitcraft.dev.br",
    siteName: "BITCRAFT",
    locale: "pt_BR",
    alternateLocale: ["en_US"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BITCRAFT | Onde Código Encontra Crescimento",
    description: "A maioria constrói. Poucos crescem. A Bitcraft faz os dois.",
  },
};

export default function Page() {
  return <HomeContent />;
}
