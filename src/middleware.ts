import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

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

  // Protect dashboard routes
  if (!isAuthenticated && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Protect download routes — require login to download Flux
  if (!isAuthenticated && request.nextUrl.pathname.startsWith("/download")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  if (
    isAuthenticated &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/signup")
  ) {
    // Preserve redirect param — if it's an athion.me subdomain, honor it
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    if (redirectParam) {
      try {
        const redirectUrl = new URL(redirectParam);
        if (redirectUrl.hostname.endsWith(".athion.me")) {
          return NextResponse.redirect(redirectUrl);
        }
      } catch {
        // Not a full URL — treat as a path
        const url = request.nextUrl.clone();
        url.pathname = redirectParam;
        url.searchParams.delete("redirect");
        return NextResponse.redirect(url);
      }
    }
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/download/:path*", "/login", "/signup"],
};
