import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { passwordResetSchema } from '@/lib/validations'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedFields = passwordResetSchema.safeParse(body)
    
    if (!validatedFields.success) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      )
    }
    
    const { email } = validatedFields.data
    
    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
    })
    
    // Always return success to prevent email enumeration
    // But only send email if user actually exists
    if (user && user.status !== 'BANNED') {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now
      
      // Save reset token to database
      await db.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      })
      
      // In a real application, you would send an email here
      // For now, we'll just log the reset link
      const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`
      
      console.log('Password reset requested for:', email)
      console.log('Reset URL:', resetUrl)
      
      // TODO: Implement email sending
      // await sendPasswordResetEmail(user.email, resetUrl)
    }
    
    return NextResponse.json(
      {
        message: 'If an account with that email exists, we\'ve sent you a password reset link.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Password reset error:', error)
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}