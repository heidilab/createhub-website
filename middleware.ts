import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_MEMBER = ["/dashboard"];
const PROTECTED_ADMIN = ["/admin"];

// Middleware runs on the Edge — we can't use firebase-admin here.
// Strategy: Just check that session cookie *exists*. Full verification + role
// check happens in server components / route handlers using getSessionUser().
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("__session")?.value;

  const needsAuth =
    PROTECTED_MEMBER.some((p) => pathname.startsWith(p)) ||
    PROTECTED_ADMIN.some((p) => pathname.startsWith(p));

  if (needsAuth && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
