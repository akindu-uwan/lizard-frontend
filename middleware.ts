import { NextRequest, NextResponse } from "next/server";

export function middleware(_req: NextRequest) {
  // Don't block /admin routes here.
  // Auth is handled client-side by /admin page via authApi.checkStatus().
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
