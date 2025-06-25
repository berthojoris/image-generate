import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { userRegistrationSchema } from '@/lib/validations'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedFields = userRegistrationSchema.safeParse(body)
    
    if (!validatedFields.success) {
      const errors = validatedFields.error.errors
      return NextResponse.json(
        { 
          message: 'Validation failed', 
          errors: errors.map(err => ({ field: err.path[0], message: err.message })) 
        },
        { status: 400 }
      )
    }
    
    const { username, email, password } = validatedFields.data
    
    // Check if user already exists with this email
    const existingUserByEmail = await db.user.findUnique({
      where: { email },
    })
    
    if (existingUserByEmail) {
      return NextResponse.json(
        { 
          message: 'A user with this email already exists',
          field: 'email'
        },
        { status: 400 }
      )
    }
    
    // Check if username is already taken
    const existingUserByUsername = await db.user.findUnique({
      where: { username },
    })
    
    if (existingUserByUsername) {
      return NextResponse.json(
        { 
          message: 'This username is already taken',
          field: 'username'
        },
        { status: 400 }
      )
    }
    
    // Hash the password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)
    
    // Create the user
    const user = await db.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: 'USER',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })
    
    return NextResponse.json(
      {
        message: 'User created successfully',
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      if (error.message.includes('email')) {
        return NextResponse.json(
          { 
            message: 'A user with this email already exists',
            field: 'email'
          },
          { status: 400 }
        )
      }
      if (error.message.includes('username')) {
        return NextResponse.json(
          { 
            message: 'This username is already taken',
            field: 'username'
          },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}