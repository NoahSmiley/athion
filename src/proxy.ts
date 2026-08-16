import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// Public pages and APIs. Unknown page routes are allowed through so Next can
// return a real 404; only the explicitly private control-plane pages are gated.
const PUBLIC_PATHS = new Set<string>([
  "/",
  "/login",
  "/signup",
  "/privacy",
  "/terms",
  "/reset-password",
  "/status",
]);

const PUBLIC_PREFIXES = [
  "/_next/",
  "/api/auth/",
  "/api/infra/status",
  "/api/health",
  "/api/prime/",
  "/fonts/",
  "/favicon",
  "/robots",
];

const PRIVATE_PREFIXES = ["/settings", "/invites", "/admin"];
const REDIRECT_HOSTS = new Set(["prime.athion.me", "labs.athion.me"]);

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      await jwtVerify(token, secret);
      isAuthenticated = true;
    } catch {
      // Invalid or expired token
    }
  }

  const { pathname } = request.nextUrl;

  // API routes: never redirect to HTML pages. Return JSON 401 if unauthenticated
  // and the path isn't in the public API allowlist.
  if (pathname.startsWith("/api/") && !isAuthenticated && !isPublic(pathname)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAuthenticated && PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    if (redirectParam) {
      try {
        const redirectUrl = new URL(redirectParam);
        if (redirectUrl.protocol === "https:" && REDIRECT_HOSTS.has(redirectUrl.hostname)) {
          return NextResponse.redirect(redirectUrl);
        }
      } catch {
        if (redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
          const url = request.nextUrl.clone();
          url.pathname = redirectParam;
          url.searchParams.delete("redirect");
          return NextResponse.redirect(url);
        }
      }
    }
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
