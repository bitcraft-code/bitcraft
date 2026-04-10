import type { Metadata } from "next";
import AgencyPageClient from "./AgencyPageClient";

export const metadata: Metadata = {
  title: "BITCRAFT Agency | Marketing que Converte",
  description: "Estratégia de marketing digital que combina criatividade e dados para crescer o seu negócio.",
  openGraph: {
    title: "BITCRAFT Agency | Marketing que Converte",
    description: "Estratégia de marketing digital que combina criatividade e dados para crescer o seu negócio.",
    url: "https://bitcraft.dev.br/agency",
    siteName: "BITCRAFT",
    locale: "pt_BR",
    type: "website",
  },
};

export default function AgencyPage() {
  return <AgencyPageClient />;
}
