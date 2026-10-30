import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/transaction',
  '/budgets',
  '/goals',
  '/bills',
  '/investments',
  '/reports',
  '/predictions',
  '/ai',
  '/settings',
  '/universe',
];

// Routes only for unauthenticated users
const AUTH_ONLY = ['/login', '/signup'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({
    request: { headers: req.headers },
  });

  const pathname = req.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY.some((p) => pathname.startsWith(p));

  if (!isProtected && !isAuthOnly) return res;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  // If Supabase is not properly configured, skip auth checks (dev fallback)
  if (
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl.includes('placeholder') ||
    supabaseKey.includes('placeholder')
  ) {
    return res;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options } as any);
          res.cookies.set({ name, value, ...options } as any);
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options } as any);
          res.cookies.set({ name, value: '', ...options } as any);
        },
      },
    });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (isProtected && !session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAuthOnly && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  } catch {
    // Auth check failed — pass through rather than hard-blocking
    return res;
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/transaction/:path*',
    '/budgets/:path*',
    '/goals/:path*',
    '/bills/:path*',
    '/investments/:path*',
    '/reports/:path*',
    '/predictions/:path*',
    '/ai/:path*',
    '/settings/:path*',
    '/universe/:path*',
    '/login',
    '/signup',
  ],
};
