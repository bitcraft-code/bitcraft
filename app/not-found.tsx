import type { Metadata } from "next";
import NotFoundClient from "@/components/NotFoundClient";

export const metadata: Metadata = {
  title: "BITCRAFT | 404",
  description: "Página não encontrada.",
};

export default function NotFound() {
  return <NotFoundClient />;
}
