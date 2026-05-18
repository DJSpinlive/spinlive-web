import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";

// Define constants directly in middleware since path aliases don't work here
const AUTH_COOKIE_NAMES = {
  token: "auth_token",
  refreshToken: "refresh_token",
} as const;

/**
 * Decode JWT without verifying signature (backend handles that)
 * Returns null if token is invalid
 */
function decodeToken(token: string): Record<string, unknown> | null {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

/**
 * Check if JWT token has expired
 */
function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  // exp is in seconds, current time in milliseconds
  return (decoded.exp as number) * 1000 < Date.now();
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get tokens from cookies
  const authToken = request.cookies.get(AUTH_COOKIE_NAMES.token)?.value;
  const refreshToken = request.cookies.get(
    AUTH_COOKIE_NAMES.refreshToken
  )?.value;

  /**
   * Route groups `(protectedRoutes)` omit the folder name — these URLs require auth.
   * Keep in sync with `src/app/(protectedRoutes)/...`
   */
  const protectedPrefixes = [
    "/home",
    "/live",
    "/profile",
    "/bookings",
    "/notifications",
    "/djs",
  ] as const;

  /** Covers `/login`, `/login/email-otp`, etc. */
  const authPrefixes = ["/login", "/signup"] as const;

  // Check if current path is a protected route
  const isProtectedRoute = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const isAuthRoute = authPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // Determine if user has valid session
  let hasValidSession = false;
  if (authToken) {
    if (!isTokenExpired(authToken)) {
      hasValidSession = true;
    } else if (refreshToken) {
      // Token expired but refresh_token exists - allow through
      // Re-auth will happen client-side
      hasValidSession = true;
    }
  }

  // Landing `/`: signed-in → home, otherwise login (parity with auth routes + protected gate)
  if (pathname === "/") {
    if (hasValidSession) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protected routes: require valid session
  if (isProtectedRoute && !hasValidSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && hasValidSession) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (api routes)
     * - public (public folder assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
