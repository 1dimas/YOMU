import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Routes that require authentication
const protectedRoutes = ['/siswa', '/admin'];

// Routes only for guests (not logged in)
const guestOnlyRoutes = ['/login', '/register'];

// Routes that require specific roles
const adminRoutes = ['/admin'];
const siswaRoutes = ['/siswa'];

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return new TextEncoder().encode(secret);
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get token from cookies
    const token = request.cookies.get('token')?.value;

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isGuestOnlyRoute = guestOnlyRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    const isSiswaRoute = siswaRoutes.some(route => pathname.startsWith(route));

    // Short-circuit: no token + protected route → login immediately
    if (!token && isProtectedRoute) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Short-circuit: no token + guest route → allow through
    if (!token) {
        return NextResponse.next();
    }

    // Verify JWT via jose (Edge Runtime safe — no network call)
    let role: string | null = null;
    let isTokenValid = false;

    try {
        const { payload } = await jwtVerify(token, getJwtSecret());
        role = payload.role as string;
        isTokenValid = true;
    } catch {
        // Token expired or tampered
        isTokenValid = false;
    }

    // Invalid token + trying to access protected route → clear cookie + redirect to login
    if (!isTokenValid && isProtectedRoute) {
        const loginUrl = new URL('/login', request.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('token');
        return response;
    }

    // Valid token + guest-only route → redirect based on role
    if (isTokenValid && isGuestOnlyRoute) {
        if (role === 'ADMIN') {
            return NextResponse.redirect(new URL('/admin', request.url));
        } else {
            return NextResponse.redirect(new URL('/siswa', request.url));
        }
    }

    // Role-based access control
    if (isTokenValid) {
        if (role === 'ADMIN' && isSiswaRoute) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
        if (role === 'SISWA' && isAdminRoute) {
            return NextResponse.redirect(new URL('/siswa', request.url));
        }
    }

    return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
};
