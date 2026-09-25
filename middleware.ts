import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const pathname = nextUrl.pathname;

  const isFarmerRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/farmer");
  const isAdminRoute = pathname.startsWith("/admin");
  const isVetRoute = pathname.startsWith("/vet");
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  // Redirect authenticated users away from /login or /register
  if (isAuthRoute && isLoggedIn) {
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
    if (role === "VET") {
      return NextResponse.redirect(new URL("/vet", nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Farmer route protection: requires FARMER (or ADMIN / SUPER_ADMIN)
  if (isFarmerRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(pathname + nextUrl.search);
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
      );
    }
    if (role !== "FARMER" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  // Admin route protection: requires ADMIN or SUPER_ADMIN
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(pathname + nextUrl.search);
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
      );
    }
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  // Vet route protection: requires VET
  if (isVetRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(pathname + nextUrl.search);
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
      );
    }
    if (role !== "VET") {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
