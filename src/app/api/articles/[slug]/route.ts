import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  slug: z.string().min(1, 'Slug is required').optional(),
  excerpt: z.string().max(500, 'Excerpt too long').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  featuredImage: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional()
})

interface RouteParams {
  params: {
    slug: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const article = await db.article.findUnique({
      where: { slug: params.slug },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            image: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            comments: true,

          }
        }
      }
    })

    if (!article) {
      return NextResponse.json(
        { message: 'Article not found' },
        { status: 404 }
      )
    }

    // Check if user can view this article
    const session = await getServerSession(authOptions)
    
    // If article is draft, only author can view it
    if (article.status === 'DRAFT' && article.authorId !== session?.user?.id) {
      return NextResponse.json(
        { message: 'Article not found' },
        { status: 404 }
      )
    }

    // Increment view count for published articles
    if (article.status === 'PUBLISHED') {
      await db.article.update({
        where: { id: article.id },
        data: { views: { increment: 1 } }
      })
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

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find the article
    const existingArticle = await db.article.findUnique({
      where: { slug: params.slug },
      include: { author: true }
    })

    if (!existingArticle) {
      return NextResponse.json(
        { message: 'Article not found' },
        { status: 404 }
      )
    }

    // Check if user is the author
    if (existingArticle.authorId !== session.user.id) {
      return NextResponse.json(
        { message: 'Forbidden: You can only edit your own articles' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateArticleSchema.parse(body)

    // If slug is being changed, check if new slug already exists
    if (validatedData.slug && validatedData.slug !== existingArticle.slug) {
      const slugExists = await db.article.findUnique({
        where: { slug: validatedData.slug }
      })

      if (slugExists) {
        // Generate a unique slug by appending a number
        let counter = 1
        let newSlug = `${validatedData.slug}-${counter}`
        
        while (await db.article.findUnique({ where: { slug: newSlug } })) {
          counter++
          newSlug = `${validatedData.slug}-${counter}`
        }
        
        validatedData.slug = newSlug
      }
    }

    // Prepare update data
    const updateData: any = {
      ...validatedData,
      updatedAt: new Date()
    }

    // Handle status change to published
    if (validatedData.status === 'PUBLISHED' && existingArticle.status === 'DRAFT') {
      updateData.publishedAt = new Date()
    }

    // Handle tags
    if (validatedData.tags) {
      // First delete all existing tag connections
      await db.articleTag.deleteMany({
        where: { articleId: existingArticle.id }
      })
      
      // Then create new tag connections
      updateData.tags = {
        create: validatedData.tags.map(tagName => ({
          tag: {
            connectOrCreate: {
              where: { name: tagName },
              create: {
                name: tagName,
                slug: tagName.toLowerCase().replace(/\s+/g, '-')
              }
            }
          }
        }))
      }
    }

    // Update the article
    const updatedArticle = await db.article.update({
      where: { id: existingArticle.id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            image: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      }
    })

    return NextResponse.json(updatedArticle)
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find the article
    const existingArticle = await db.article.findUnique({
      where: { slug: params.slug },
      include: { author: true }
    })

    if (!existingArticle) {
      return NextResponse.json(
        { message: 'Article not found' },
        { status: 404 }
      )
    }

    // Check if user is the author or admin
    const isAuthor = existingArticle.authorId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { message: 'Forbidden: You can only delete your own articles' },
        { status: 403 }
      )
    }

    // Delete the article (this will cascade delete comments and likes)
    await db.article.delete({
      where: { id: existingArticle.id }
    })

    return NextResponse.json(
      { message: 'Article deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}