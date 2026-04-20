import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "./lib/auth-server";

const publicRoutes = ["/", "/auth"];

export async function proxy(request: NextRequest) {
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  if (await isAuthenticated()) {
    if (isPublicRoute) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  } else {
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
