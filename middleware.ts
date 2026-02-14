import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/siswa', '/admin'];

// Routes only for guests (not logged in)
const guestOnlyRoutes = ['/login', '/register'];

// Routes that require specific roles
const adminRoutes = ['/admin'];
const siswaRoutes = ['/siswa'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get token from cookies
    const token = request.cookies.get('token')?.value;

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isGuestOnlyRoute = guestOnlyRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    const isSiswaRoute = siswaRoutes.some(route => pathname.startsWith(route));

    // If no token and trying to access protected route -> redirect to login
    if (!token && isProtectedRoute) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If has token and trying to access guest-only route -> redirect based on role
    if (token && isGuestOnlyRoute) {
        // Decode JWT to get role (basic decode, not verification - that's done by backend)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const role = payload.role;

            if (role === 'ADMIN') {
                return NextResponse.redirect(new URL('/admin', request.url));
            } else {
                return NextResponse.redirect(new URL('/siswa', request.url));
            }
        } catch {
            // Invalid token, let them access login/register
            return NextResponse.next();
        }
    }

    // Role-based access control
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const role = payload.role;

            // Admin trying to access siswa routes
            if (role === 'ADMIN' && isSiswaRoute) {
                return NextResponse.redirect(new URL('/admin', request.url));
            }

            // Siswa trying to access admin routes
            if (role === 'SISWA' && isAdminRoute) {
                return NextResponse.redirect(new URL('/siswa', request.url));
            }
        } catch {
            // Invalid token, redirect to login
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
};
