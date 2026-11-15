import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleI18n = createMiddleware(routing);

const PROTECTED_ADMIN_ROUTES = [
  "/dashboard",
  "/orders",
  "/products",
  "/add-product",
  "/categories",
  "/inventory",
  "/customers",
  "/delivery",
  "/coupons",
  "/profile",
  "/khata",
  "/whatsapp",
];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Determine current locale (defaults to es)
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;
  const currentLocale = localeCookie === "en" ? "en" : "es";

  // Check if target is an admin-protected route
  const strippedPath = pathname.replace(/^\/(es|en)(\/|$)/, "/");
  const isAdminRoute = PROTECTED_ADMIN_ROUTES.some(
    (route) => strippedPath === route || strippedPath.startsWith(`${route}/`)
  );

  if (isAdminRoute) {
    const hasAdminSession = request.cookies.get("sb_admin_session")?.value === "true";
    if (!hasAdminSession) {
      const signinUrl = new URL(`/${currentLocale}/signin`, request.url);
      signinUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signinUrl);
    }
  }

  // If the visitor has not explicitly selected a language preference (no cookie),
  // enforce Spanish as the primary default for Spain.
  if (!request.cookies.has("NEXT_LOCALE")) {
    request.headers.set("accept-language", "es-ES,es;q=0.9");
  }

  return handleI18n(request);
}

export const config = {
  matcher: ["/((?!api/|_next|_vercel|.*\\..*).*)"],
};
