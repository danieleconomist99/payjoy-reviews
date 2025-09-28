import { NextResponse } from 'next/server';

export const config = { matcher: ['/form'] };

export function middleware(req) {
  const url = req.nextUrl.clone();
  url.pathname = '/feedback';      // conserva automáticamente los query params
  return NextResponse.redirect(url);
}
