"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const NAV = [
  { label: "Software", href: "/software" },
  { label: "Agency", href: "/agency" },
  { label: "Contact", href: "#" },
];

export default function SiteHeader({ activePath }: { activePath?: string }) {
  const [headerMouse, setHeaderMouse] = useState({ x: 0, y: 0, hover: false });
  const [navSpotlight, setNavSpotlight] = useState<{ idx: number | null; x: number; y: number }>({ idx: null, x: 0, y: 0 });
  const lastTouchAt = useRef(0);
  const wasTouched = () => Date.now() - lastTouchAt.current < 600;
  const onTouchBegin = (setter: (x: number, y: number) => void) => (e: React.TouchEvent) => {
    lastTouchAt.current = Date.now();
    const touch = e.touches[0];
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setter(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="absolute top-0 left-0 right-0 z-20 flex justify-center px-4 pt-5"
    >
      <motion.div
        className="relative flex items-center justify-between w-full max-w-5xl px-4 py-2 sm:px-5 sm:py-2.5 md:px-7 md:py-3 rounded-full"
        style={{
          background: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
        onMouseMove={(e) => {
          if (wasTouched()) return;
          const rect = e.currentTarget.getBoundingClientRect();
          setHeaderMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top, hover: true });
        }}
        onMouseLeave={() => { if (!wasTouched()) setHeaderMouse((p) => ({ ...p, hover: false })); }}
        onTouchStart={onTouchBegin((x, y) => setHeaderMouse({ hover: true, x, y }))}
        onTouchEnd={() => setHeaderMouse((p) => ({ ...p, hover: false }))}
        onTouchCancel={() => setHeaderMouse((p) => ({ ...p, hover: false }))}
      >
        {/* Fill spotlight */}
        <span className="absolute inset-0 rounded-full pointer-events-none overflow-hidden" style={{ opacity: headerMouse.hover ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle 200px at ${headerMouse.x}px ${headerMouse.y}px, rgba(255,255,255,0.08), transparent 70%)` }} />
        {/* Border spotlight */}
        <span className="absolute inset-0 rounded-full pointer-events-none" style={{ opacity: headerMouse.hover ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle 120px at ${headerMouse.x}px ${headerMouse.y}px, rgba(255,255,255,1), transparent 70%)`, WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", maskComposite: "exclude", padding: "2px" }} />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 md:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" stroke="#ffffff">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <span className="font-bold text-sm tracking-wide text-white">Bitcraft</span>
        </Link>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-0.5">
          {NAV.map((item, i) => {
            const isActive = activePath === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 md:px-5 rounded-full text-sm font-medium transition-colors duration-200"
                style={{ color: isActive ? "#ffffff" : "rgba(255,255,255,0.65)", background: isActive ? "rgba(255,255,255,0.10)" : "transparent" }}
                onMouseMove={(e) => {
                  if (wasTouched()) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  setNavSpotlight({ idx: i, x: e.clientX - rect.left, y: e.clientY - rect.top });
                  (e.currentTarget as HTMLAnchorElement).style.color = "#ffffff";
                  if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  if (wasTouched()) return;
                  setNavSpotlight((p) => ({ ...p, idx: null }));
                  (e.currentTarget as HTMLAnchorElement).style.color = isActive ? "#ffffff" : "rgba(255,255,255,0.65)";
                  (e.currentTarget as HTMLAnchorElement).style.background = isActive ? "rgba(255,255,255,0.10)" : "transparent";
                }}
                onTouchStart={onTouchBegin((x, y) => setNavSpotlight({ idx: i, x, y }))}
                onTouchEnd={(e) => {
                  setNavSpotlight((p) => ({ ...p, idx: null }));
                  (e.currentTarget as HTMLAnchorElement).style.color = isActive ? "#ffffff" : "rgba(255,255,255,0.65)";
                }}
                onTouchCancel={(e) => {
                  setNavSpotlight((p) => ({ ...p, idx: null }));
                  (e.currentTarget as HTMLAnchorElement).style.color = isActive ? "#ffffff" : "rgba(255,255,255,0.65)";
                }}
              >
                {/* Fill spotlight */}
                <span className="absolute inset-0 rounded-full pointer-events-none overflow-hidden" style={{ opacity: navSpotlight.idx === i ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle 60px at ${navSpotlight.x}px ${navSpotlight.y}px, rgba(255,255,255,0.10), transparent 70%)` }} />
                {/* Border spotlight */}
                <span className="absolute inset-0 rounded-full pointer-events-none" style={{ opacity: navSpotlight.idx === i ? 1 : 0, transition: "opacity 0.3s ease", background: `radial-gradient(circle 60px at ${navSpotlight.x}px ${navSpotlight.y}px, rgba(255,255,255,1), transparent 70%)`, WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", maskComposite: "exclude", padding: "1.5px" }} />
                {item.label}
              </a>
            );
          })}
        </nav>
      </motion.div>
    </motion.header>
  );
}
