import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN'])
})

// PATCH /api/admin/users/[id]/role - Update user role
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole('ADMIN')
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { role } = updateRoleSchema.parse(body)

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Prevent self-demotion from admin
    if (session.user.id === params.id && role === 'USER' && existingUser.role === 'ADMIN') {
      return NextResponse.json(
        { message: 'You cannot remove your own admin privileges' },
        { status: 400 }
      )
    }

    // Update user role
    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: {
        role,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        status: true
      }
    })

    return NextResponse.json({
      message: `User role updated to ${role}`,
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    
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