import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

// TODO: 意味理解

export const proxy = (request: NextRequest) => {
  const session = request.cookies.get(SESSION_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  // 認証が必要なパス
  const protectedPaths = ["/"];

  // 認証不要なパス
  const publicPaths = ["/login", "/signup"];

  // ログイン済みユーザーが認証ページにアクセスした場合、ホームへリダイレクト
  if (session && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 未ログインユーザーが保護されたページにアクセスした場合、ログインページへリダイレクト
  if (!session && protectedPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
