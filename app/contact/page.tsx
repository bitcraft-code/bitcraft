import type { Metadata } from "next";
import { Suspense } from "react";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "BITCRAFT | Contato",
  description: "Fale connosco. Conte-nos o seu projeto e vamos construir juntos.",
  openGraph: {
    title: "BITCRAFT | Contato",
    description: "Fale connosco. Conte-nos o seu projeto e vamos construir juntos.",
    url: "https://bitcraft.dev.br/contact",
    siteName: "BITCRAFT",
    locale: "pt_BR",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <Suspense fallback={<main style={{ background: "#0a192f", minHeight: "100dvh" }} />}>
      <ContactPageClient />
    </Suspense>
  );
}
