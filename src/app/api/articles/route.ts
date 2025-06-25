import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().max(500, 'Excerpt too long').optional(),
  content: z.string().min(1, 'Content is required'),
  featuredImage: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT')
})

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  tag: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  author: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createArticleSchema.parse(body)

    // Check if slug already exists
    const existingArticle = await db.article.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingArticle) {
      // Generate a unique slug by appending a number
      let counter = 1
      let newSlug = `${validatedData.slug}-${counter}`
      
      while (await db.article.findUnique({ where: { slug: newSlug } })) {
        counter++
        newSlug = `${validatedData.slug}-${counter}`
      }
      
      validatedData.slug = newSlug
    }

    // Create the article
    const article = await db.article.create({
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        excerpt: validatedData.excerpt || '',
        content: validatedData.content,
        featuredImage: validatedData.featuredImage || null,
        status: validatedData.status,
        authorId: session.user.id,
        publishedAt: validatedData.status === 'PUBLISHED' ? new Date() : null,
        tags: {
          connectOrCreate: validatedData.tags.map(tagName => ({
            where: { name: tagName },
            create: {
              name: tagName,
              slug: tagName.toLowerCase().replace(/\s+/g, '-')
            }
          }))
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        tags: true,
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      }
    })

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))
    
    const page = parseInt(query.page)
    const limit = parseInt(query.limit)
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    // Only show published articles for non-authenticated users
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      where.status = 'PUBLISHED'
    } else if (query.status) {
      where.status = query.status
    }
    
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { excerpt: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } }
      ]
    }
    
    if (query.tag) {
      where.tags = {
        some: {
          name: { equals: query.tag, mode: 'insensitive' }
        }
      }
    }
    
    if (query.author) {
      where.author = {
        OR: [
          { name: { contains: query.author, mode: 'insensitive' } },
          { email: { contains: query.author, mode: 'insensitive' } }
        ]
      }
    }

    // Get articles with pagination
    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          tags: true,
          _count: {
            select: {
              comments: true,
              likes: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.article.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid query parameters', errors: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}