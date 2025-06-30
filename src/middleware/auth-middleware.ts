import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function authMiddleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  // Check if this is an admin route
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  
  if (isAdminRoute) {
    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
      loginUrl.searchParams.set('message', 'Please login to access admin area')
      return NextResponse.redirect(loginUrl)
    }

    // Check if user is admin
    if (token.role !== 'ADMIN') {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('message', 'Admin access required')
      return NextResponse.redirect(loginUrl)
    }

    // Check if admin session has expired (2 hours)
    if (token.loginTime) {
      const now = Date.now()
      const sessionDuration = now - (token.loginTime as number)
      const twoHours = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
      
      if (sessionDuration > twoHours) {
        // Session expired, redirect to login
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('message', 'Admin session expired. Please login again.')
        return NextResponse.redirect(loginUrl)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}