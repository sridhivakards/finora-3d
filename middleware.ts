import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Pass through immediately to ensure zero latency and prevent 504 timeouts at the edge
  return NextResponse.next({
    request: { headers: req.headers },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
