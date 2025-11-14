import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Protect /dashboard and all nested routes
  const isProtected = pathname.startsWith('/dashboard');
  const authed = req.cookies.get('auth')?.value === 'true';

  if (isProtected) {
    if (!authed) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set(
        'from',
        pathname + (searchParams.size ? `?${searchParams.toString()}` : ''),
      );
      return NextResponse.redirect(url);
    }
  }

  // If already authenticated, do not allow visiting /login
  if (pathname === '/login' && authed) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
