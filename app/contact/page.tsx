import { Suspense } from "react";
import ContactPageClient from "./ContactPageClient";

export default function ContactPage() {
  return (
    <Suspense fallback={<main style={{ background: "#0a192f", minHeight: "100dvh" }} />}>
      <ContactPageClient />
    </Suspense>
  );
}
