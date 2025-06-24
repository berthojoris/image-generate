import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import bcrypt from 'bcryptjs'
import { db } from './db'
import { userLoginSchema } from './validations'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const validatedFields = userLoginSchema.safeParse(credentials)
        if (!validatedFields.success) {
          return null
        }

        const { email, password } = validatedFields.data

        const user = await db.user.findUnique({
          where: { email },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        if (user.status === 'BANNED') {
          throw new Error('Account has been banned')
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          image: user.image,
          role: user.role,
          status: user.status,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role
        token.status = user.status
        token.username = user.username
      }

      // Handle session update
      if (trigger === 'update' && session) {
        token.username = session.username
        token.image = session.image
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.status = token.status as string
        session.user.username = token.username as string
      }

      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          const existingUser = await db.user.findUnique({
            where: { email: user.email! },
          })

          if (existingUser) {
            if (existingUser.status === 'BANNED') {
              return false
            }
            return true
          }

          // Create username from email or profile
          let username = user.email!.split('@')[0]
          if (profile?.login) {
            username = profile.login as string
          }

          // Ensure username is unique
          const existingUsername = await db.user.findUnique({
            where: { username },
          })

          if (existingUsername) {
            username = `${username}_${Date.now()}`
          }

          // Create new user
          await db.user.create({
            data: {
              email: user.email!,
              username,
              image: user.image,
              role: 'USER',
              status: 'ACTIVE',
            },
          })

          return true
        } catch (error) {
          console.error('Error during OAuth sign in:', error)
          return false
        }
      }

      return true
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        console.log(`New user signed up: ${user.email}`)
      }
    },
  },
}

// Helper function to get server session
export async function getServerSession() {
  const { getServerSession } = await import('next-auth')
  return getServerSession(authOptions)
}

// Helper function to check if user is authenticated
export async function requireAuth() {
  const session = await getServerSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session
}

// Helper function to check if user has required role
export async function requireRole(requiredRole: 'USER' | 'EDITOR' | 'ADMIN') {
  const session = await requireAuth()
  const roleHierarchy = { USER: 0, EDITOR: 1, ADMIN: 2 }
  
  if (roleHierarchy[session.user.role as keyof typeof roleHierarchy] < roleHierarchy[requiredRole]) {
    throw new Error('Insufficient permissions')
  }
  
  return session
}