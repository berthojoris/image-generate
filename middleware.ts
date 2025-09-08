import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip middleware for API routes, static files, etc.
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.includes('/static/') ||
    request.nextUrl.pathname.includes('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get('authenticated')?.value

  // Protect the root path and any other pages except login
  if (request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/page')) {
    if (!token || token !== 'true') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect to home if authenticated and on login page
  if (token === 'true' && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)',
  ],
}