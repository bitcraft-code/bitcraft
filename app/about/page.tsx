import type { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";

export const metadata: Metadata = {
  title: "BITCRAFT | Quem Somos",
  description: "Conheça a Bitcraft: engenheiros e criativos que constroem e crescem produtos digitais.",
  openGraph: {
    title: "BITCRAFT | Quem Somos",
    description: "Conheça a Bitcraft: engenheiros e criativos que constroem e crescem produtos digitais.",
    url: "https://bitcraft.dev.br/about",
    siteName: "BITCRAFT",
    locale: "pt_BR",
    type: "website",
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
