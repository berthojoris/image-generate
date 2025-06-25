import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  tags: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
})

// GET /api/admin/articles/[id] - Get article by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole('ADMIN')
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const article = await db.article.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { id: true, name: true, username: true, email: true }
        },
        category: true,
        tags: true,
        _count: {
          select: { comments: true }
        }
      }
    })

    if (!article) {
      return NextResponse.json({ message: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/articles/[id] - Update article
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
    const validatedData = updateArticleSchema.parse(body)

    // Check if article exists
    const existingArticle = await db.article.findUnique({
      where: { id: params.id }
    })

    if (!existingArticle) {
      return NextResponse.json({ message: 'Article not found' }, { status: 404 })
    }

    // Generate slug from title if title changed
    let slug = existingArticle.slug
    if (validatedData.title !== existingArticle.title) {
      const baseSlug = validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      // Check if slug exists (excluding current article)
      const existingSlug = await db.article.findFirst({
        where: {
          slug: baseSlug,
          id: { not: params.id }
        }
      })
      
      if (existingSlug) {
        slug = `${baseSlug}-${Date.now()}`
      } else {
        slug = baseSlug
      }
    }

    // Update article
    const updatedArticle = await db.article.update({
      where: { id: params.id },
      data: {
        title: validatedData.title,
        slug,
        content: validatedData.content,
        excerpt: validatedData.excerpt,
        status: validatedData.status,
        categoryId: validatedData.categoryId,
        updatedAt: new Date(),
        // Handle tags if provided
        ...(validatedData.tags && {
          tags: {
            deleteMany: {},
            create: validatedData.tags.map(tag => ({
              tag: {
                connectOrCreate: {
                  where: { name: tag },
                  create: { name: tag, slug: tag.toLowerCase().replace(/\s+/g, '-') }
                }
              }
            }))
          }
        })
      },
      include: {
        author: {
          select: { name: true, username: true }
        },
        category: true,
        tags: {
          include: { tag: true }
        }
      }
    })

    return NextResponse.json({
      message: 'Article updated successfully',
      article: updatedArticle
    })
  } catch (error) {
    console.error('Error updating article:', error)
    
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

// DELETE /api/admin/articles/[id] - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole('ADMIN')
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Check if article exists
    const existingArticle = await db.article.findUnique({
      where: { id: params.id }
    })

    if (!existingArticle) {
      return NextResponse.json({ message: 'Article not found' }, { status: 404 })
    }

    // Delete article (this will cascade delete comments and tags due to foreign key constraints)
    await db.article.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Article deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}