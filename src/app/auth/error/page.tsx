'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    const errorMessages: Record<string, { title: string; description: string }> = {
      Configuration: {
        title: 'Server Configuration Error',
        description: 'There is a problem with the server configuration. Please contact support.',
      },
      AccessDenied: {
        title: 'Access Denied',
        description: 'You do not have permission to sign in with this account.',
      },
      Verification: {
        title: 'Verification Error',
        description: 'The verification token has expired or has already been used.',
      },
      Default: {
        title: 'Authentication Error',
        description: 'An error occurred during authentication. Please try again.',
      },
      CredentialsSignin: {
        title: 'Invalid Credentials',
        description: 'The email or password you entered is incorrect.',
      },
      OAuthSignin: {
        title: 'OAuth Sign In Error',
        description: 'An error occurred while signing in with your OAuth provider.',
      },
      OAuthCallback: {
        title: 'OAuth Callback Error',
        description: 'An error occurred during the OAuth callback process.',
      },
      OAuthCreateAccount: {
        title: 'OAuth Account Creation Error',
        description: 'Could not create an account with your OAuth provider.',
      },
      EmailCreateAccount: {
        title: 'Email Account Creation Error',
        description: 'Could not create an account with your email.',
      },
      Callback: {
        title: 'Callback Error',
        description: 'An error occurred during the authentication callback.',
      },
      OAuthAccountNotLinked: {
        title: 'Account Not Linked',
        description: 'This account is not linked to your OAuth provider. Please sign in with the same provider you used originally.',
      },
      EmailSignin: {
        title: 'Email Sign In Error',
        description: 'Could not send sign in email. Please check your email address.',
      },
      CredentialsCallback: {
        title: 'Credentials Callback Error',
        description: 'An error occurred during credentials authentication.',
      },
      SessionRequired: {
        title: 'Session Required',
        description: 'You must be signed in to access this page.',
      },
    }

    return errorMessages[error || 'Default'] || errorMessages.Default
  }

  const { title, description } = getErrorMessage(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        
        <div className="bg-card rounded-lg shadow-lg border p-8 space-y-6">
          <div className="space-y-4">
            {error === 'OAuthAccountNotLinked' && (
              <div className="p-4 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">
                  <strong>Tip:</strong> If you previously signed in with a different method (email/password or another OAuth provider), 
                  please use that same method to sign in.
                </p>
              </div>
            )}
            
            {error === 'AccessDenied' && (
              <div className="p-4 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">
                  Your account may be pending approval or has been restricted. 
                  Please contact support if you believe this is an error.
                </p>
              </div>
            )}
            
            <div className="flex flex-col space-y-3">
              <Link href="/auth/login">
                <Button className="w-full">
                  Try Again
                </Button>
              </Link>
              
              {error === 'CredentialsSignin' && (
                <Link href="/auth/forgot-password">
                  <Button variant="outline" className="w-full">
                    Forgot Password?
                  </Button>
                </Link>
              )}
              
              <Link href="/auth/register">
                <Button variant="outline" className="w-full">
                  Create New Account
                </Button>
              </Link>
            </div>
            
            <div className="text-center pt-4">
              <Link
                href="/"
                className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="text-center">
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground transition-colors">
                Technical Details
              </summary>
              <div className="mt-2 p-2 bg-muted/50 rounded text-left font-mono">
                Error Code: {error}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}