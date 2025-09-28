import { NextResponse } from 'next/server';
export const config = { matcher: ['/form', '/form/:path*'] };
export function middleware(req) {
  const url = req.nextUrl.clone();
  url.pathname = '/feedback';     // conserva ?store=...
  return NextResponse.redirect(url);
}

