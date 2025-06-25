import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED'])
})

// PATCH /api/admin/users/[id]/status - Update user status
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
    const { status } = updateStatusSchema.parse(body)

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Prevent self-suspension
    if (session.user.id === params.id && status === 'SUSPENDED') {
      return NextResponse.json(
        { message: 'You cannot suspend your own account' },
        { status: 400 }
      )
    }

    // Update user status
    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: {
        status,
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
      message: `User ${status.toLowerCase()} successfully`,
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating user status:', error)
    
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