import type { Metadata } from "next";
import SoftwarePageClient from "./SoftwarePageClient";

export const metadata: Metadata = {
  title: "BITCRAFT Software | Engenharia de Alta Performance",
  description: "Desenvolvemos software com arquitetura sólida, entrega ágil e foco em performance.",
  openGraph: {
    title: "BITCRAFT Software | Engenharia de Alta Performance",
    description: "Desenvolvemos software com arquitetura sólida, entrega ágil e foco em performance.",
    url: "https://bitcraft.dev.br/software",
    siteName: "BITCRAFT",
    locale: "pt_BR",
    type: "website",
  },
};

export default function SoftwarePage() {
  return <SoftwarePageClient />;
}
