import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  console.log(pathname);
  if (pathname === "/dashboards") {
    const dashboardId = searchParams.get("dashboardId");
    if (dashboardId) {
      return NextResponse.redirect(
        new URL(`/dashboards/view/${dashboardId}`, req.url)
      );
    }
  }

  return NextResponse.next();
}
