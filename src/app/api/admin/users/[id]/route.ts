import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  role: z.enum(['USER', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
})

// GET /api/admin/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole('ADMIN')
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            articles: true,
            comments: true
          }
        },
        articles: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            views: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Remove sensitive information
    const { passwordHash, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole('ADMIN')
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Check for duplicate email or username (excluding current user)
    if (validatedData.email !== existingUser.email) {
      const existingEmail = await db.user.findFirst({
        where: {
          email: validatedData.email,
          id: { not: params.id }
        }
      })
      
      if (existingEmail) {
        return NextResponse.json(
          { message: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    if (validatedData.username !== existingUser.username) {
      const existingUsername = await db.user.findFirst({
        where: {
          username: validatedData.username,
          id: { not: params.id }
        }
      })
      
      if (existingUsername) {
        return NextResponse.json(
          { message: 'Username already exists' },
          { status: 400 }
        )
      }
    }

    // Prevent self-demotion from admin
    if (session.user.id === params.id && validatedData.role === 'USER' && existingUser.role === 'ADMIN') {
      return NextResponse.json(
        { message: 'You cannot remove your own admin privileges' },
        { status: 400 }
      )
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        username: validatedData.username,
        ...(validatedData.role && { role: validatedData.role }),
        ...(validatedData.status && { status: validatedData.status }),
        updatedAt: new Date(),
      }
    })

    // Remove sensitive information
    const { passwordHash, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      message: 'User updated successfully',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Error updating user:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole('ADMIN')
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Prevent self-deletion
    if (session.user.id === params.id) {
      return NextResponse.json(
        { message: 'You cannot delete your own account' },
        { status: 400 }
      )
    }

    // Delete user (this will cascade delete articles and comments due to foreign key constraints)
    await db.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}