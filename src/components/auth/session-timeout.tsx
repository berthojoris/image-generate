'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function SessionTimeout() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Check if user is admin and session exists
    if (session?.user && (session.user as any).role === 'ADMIN') {
      const checkSessionExpiry = async () => {
        try {
          // Force session refresh to trigger JWT callback validation
          const response = await fetch('/api/auth/session', {
            cache: 'no-store'
          })
          
          if (!response.ok) {
            throw new Error('Session check failed')
          }
          
          const data = await response.json()
          
          // If session is null/empty, it means JWT callback returned null (expired)
          if (!data || !data.user) {
            await signOut({ 
              callbackUrl: '/auth/login?message=Admin session expired after 2 hours. Please login again.',
              redirect: true 
            })
          }
        } catch (error) {
          console.error('Session check error:', error)
          // On error, also sign out to be safe
          await signOut({ 
            callbackUrl: '/auth/login?message=Session expired. Please login again.',
            redirect: true 
          })
        }
      }

      // Check session every 2 minutes for more responsive logout
      intervalRef.current = setInterval(checkSessionExpiry, 2 * 60 * 1000)

      // Also check immediately
      checkSessionExpiry()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [session, status, router])

  return null // This component doesn't render anything
}