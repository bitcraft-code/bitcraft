"use client";

import dynamic from "next/dynamic";

const HomeContent = dynamic(() => import("@/components/HomeContent"), {
  ssr: false,
  loading: () => (
    <main
      className="relative min-h-[100dvh] flex flex-col"
      style={{ background: "#0a192f" }}
    />
  ),
});

export default function Page() {
  return <HomeContent />;
}
