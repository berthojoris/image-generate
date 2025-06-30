import { NextRequest } from 'next/server'
import { authMiddleware } from './src/middleware/auth-middleware'

export function middleware(request: NextRequest) {
  return authMiddleware(request)
}

export const config = {
  matcher: ['/admin/:path*']
}