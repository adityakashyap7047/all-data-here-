import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = [
  '/',
  '/pricing',
  '/features',
  '/status',
  '/portfolio',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/api/auth',
  '/api/webhooks',
];

const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

const dashboardRoutes = ['/dashboard'];
const adminRoutes = ['/admin'];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));
  const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));
  const isDashboardRoute = dashboardRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));
  const isAdminRoute = adminRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));

  const session = await auth();

  if (isAuthRoute && session?.user) {
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (isDashboardRoute && !session?.user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute) {
    if (!session?.user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = session.user.role;
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'BILLING'];

    if (!allowedRoles.includes(userRole)) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    if (session.user.twoFactorEnabled === false && ['SUPER_ADMIN', 'ADMIN'].includes(userRole)) {
      const settingsUrl = new URL('/dashboard/settings#security', request.url);
      settingsUrl.searchParams.set('require2fa', 'true');
      return NextResponse.redirect(settingsUrl);
    }
  }

  if (pathname.startsWith('/api/v1/')) {
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
        { status: 401 }
      );
    }

    if (pathname.startsWith('/api/v1/admin/')) {
      const userRole = session.user.role;
      const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'BILLING'];

      if (!allowedRoles.includes(userRole)) {
        return NextResponse.json(
          { error: { code: 'FORBIDDEN', message: 'Admin access required.' } },
          { status: 403 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};