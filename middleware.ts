import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/projects',
  '/about',
  '/terms',
  '/privacy',
  '/contact',
];

// Paths that require specific roles
const rolePaths = {
  '/dashboard/admin': ['ADMIN'],
  '/dashboard/seller': ['SELLER', 'ADMIN'],
  '/dashboard/buyer': ['BUYER', 'SELLER', 'ADMIN'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  // Allow API routes to handle their own auth
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get('auth_token')?.value;

  // No token - redirect to login
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Verify token
  const payload = await verifyToken(token);

  // Invalid token - redirect to login
  if (!payload) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Check role-based access
  for (const [path, allowedRoles] of Object.entries(rolePaths)) {
    if (pathname.startsWith(path)) {
      if (!allowedRoles.includes(payload.role)) {
        // Redirect to appropriate dashboard based on role
        if (payload.role === 'ADMIN') {
          return NextResponse.redirect(new URL('/dashboard/admin', request.url));
        } else if (payload.role === 'SELLER') {
          return NextResponse.redirect(new URL('/dashboard/seller', request.url));
        } else {
          return NextResponse.redirect(new URL('/dashboard/buyer', request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
