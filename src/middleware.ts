import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// Routes a logged-out visitor is allowed to see. Everything else redirects to /request-access.
const PUBLIC_PATHS = new Set<string>([
  "/",
  "/about",
  "/process",
  "/login",
  "/signup",
  "/request-access",
  "/privacy",
  "/terms",
  "/reset-password",
]);

const PUBLIC_PREFIXES = [
  "/application/",  // applicants tracking their status (gated by knowing the UUID)
  "/_next/",
  "/api/auth/",     // login, logout, signup, me — auth must work without a session
  "/api/access-requests", // submit application
  "/api/opendock/updates/",  // Tauri auto-updater — called by the app, no cookie
  "/api/opendock/releases",  // public release feed (covers /api/opendock/releases and /latest)
  "/opendock",      // /opendock landing + /opendock/download + /opendock/releases
  "/status",        // public status page (status.athion.me + /status)
  "/api/infra/status", // status data feed
  "/api/health",    // liveness probe
  "/fonts/",
  "/favicon",
  "/robots",
  "/sitemap",
];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
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

  // Protect admin routes — must be logged in (admin role check happens server-side in page)
  if (!isAuthenticated && pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Gate everything except the public allowlist for logged-out visitors
  if (!isAuthenticated && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/request-access";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  if (isAuthenticated && (pathname === "/login" || pathname === "/signup" || pathname === "/request-access")) {
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    if (redirectParam) {
      try {
        const redirectUrl = new URL(redirectParam);
        if (redirectUrl.hostname.endsWith(".athion.me")) {
          return NextResponse.redirect(redirectUrl);
        }
      } catch {
        const url = request.nextUrl.clone();
        url.pathname = redirectParam;
        url.searchParams.delete("redirect");
        return NextResponse.redirect(url);
      }
    }
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on (almost) everything; let isPublic() decide.
  // Skip image-optim & static assets to avoid overhead.
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
