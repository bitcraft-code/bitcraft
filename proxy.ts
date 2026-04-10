import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LOCALES = ["pt", "en"];
const LOCALE_COOKIE = "bitcraft_locale";

export function proxy(req: NextRequest): NextResponse {
  const res = NextResponse.next();

  if (req.cookies.has(LOCALE_COOKIE)) return res;

  const acceptLanguage = req.headers.get("accept-language") ?? "";
  const preferred = acceptLanguage.split(",")[0].split("-")[0].toLowerCase();
  const locale = SUPPORTED_LOCALES.includes(preferred) ? preferred : "pt";

  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return res;
}

export const config = {
  matcher: ["/((?!_next|api|favicon\\.ico|.*\\.svg).*)"],
};
