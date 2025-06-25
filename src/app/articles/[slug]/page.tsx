import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { Calendar, Eye, Clock, Share2, Twitter, Facebook, Linkedin, Link2, ArrowLeft, User, Tag } from "lucide-react";
import { CommentSection } from "@/components/ui/comment-section";
import { ArticleEditButton } from "@/components/ui/article-edit-button";
import "highlight.js/styles/github-dark.css";

// Mock data - will be replaced with real database queries
const mockArticles = [
  {
    id: "1",
    title: "Getting Started with Next.js 15 and React 19",
    slug: "getting-started-nextjs-15-react-19",
    content: `# Getting Started with Next.js 15 and React 19

Next.js 15 brings exciting new features and improvements that make building modern web applications even more powerful and efficient. Combined with React 19, developers now have access to cutting-edge tools for creating exceptional user experiences.

## What's New in Next.js 15

Next.js 15 introduces several groundbreaking features:

### 1. Enhanced App Router

The App Router has been significantly improved with better performance and new capabilities:

\`\`\`typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
\`\`\`

### 2. Server Components by Default

Server Components are now the default, providing better performance and SEO:

\`\`\`tsx
// This is a Server Component by default
export default async function HomePage() {
  const data = await fetch('https://api.example.com/data');
  const posts = await data.json();
  
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
\`\`\`

### 3. Improved Performance

Next.js 15 includes several performance optimizations:

- **Faster builds**: Up to 30% faster build times
- **Better caching**: Improved caching strategies
- **Optimized bundling**: Smaller bundle sizes

## React 19 Features

React 19 brings powerful new features that work seamlessly with Next.js:

### 1. Actions

Actions provide a new way to handle form submissions and mutations:

\`\`\`tsx
function ContactForm() {
  async function submitForm(formData: FormData) {
    'use server';
    
    const name = formData.get('name');
    const email = formData.get('email');
    
    // Handle form submission
    await saveContact({ name, email });
  }
  
  return (
    <form action={submitForm}>
      <input name="name" placeholder="Your name" />
      <input name="email" type="email" placeholder="Your email" />
      <button type="submit">Submit</button>
    </form>
  );
}
\`\`\`

### 2. use() Hook

The new \`use()\` hook allows you to read promises and context in components:

\`\`\`tsx
import { use } from 'react';

function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
\`\`\`

## Getting Started

To create a new Next.js 15 project with React 19:

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

## Best Practices

1. **Use Server Components**: Leverage server components for better performance
2. **Optimize Images**: Use Next.js Image component for automatic optimization
3. **Implement Caching**: Use Next.js caching strategies effectively
4. **Type Safety**: Use TypeScript for better development experience

## Conclusion

Next.js 15 and React 19 represent a significant step forward in web development. The combination of these technologies provides developers with powerful tools to build fast, scalable, and maintainable applications.

Start exploring these new features today and see how they can improve your development workflow and application performance.",
    excerpt: "Learn how to build modern web applications with the latest features in Next.js 15 and React 19, including server components and improved performance.",
    headerImage: "/api/placeholder/1200/600",
    views: 1234,
    readTime: 8,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    author: {
      id: "1",
      username: "johndoe",
      email: "john@example.com"
    },
    tags: ["Next.js", "React", "Web Development", "TypeScript"]
  },
  {
    id: "2",
    title: "Building Scalable APIs with Prisma and SQLite",
    slug: "building-scalable-apis-prisma-sqlite",
    content: `# Building Scalable APIs with Prisma and SQLite

Prisma is a next-generation ORM that makes database access easy and type-safe. Combined with SQLite, it provides an excellent foundation for building scalable APIs.

## Why Prisma + SQLite?

This combination offers several advantages:

- **Type Safety**: Prisma generates TypeScript types from your schema
- **Zero Configuration**: SQLite requires no setup
- **Performance**: Excellent performance for most applications
- **Simplicity**: Easy to develop and deploy

## Setting Up Prisma

First, install Prisma:

\`\`\`bash
npm install prisma @prisma/client
npx prisma init --datasource-provider sqlite
\`\`\`

## Database Schema

Define your schema in \`prisma/schema.prisma\`:

\`\`\`prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
}
\`\`\`

## API Routes

Create API routes using Prisma:

\`\`\`typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, authorId } = await request.json();
    
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId
      },
      include: {
        author: {
          select: {
            username: true,
            email: true
          }
        }
      }
    });
    
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
\`\`\`

## Best Practices

1. **Use Transactions**: For complex operations
2. **Implement Pagination**: For large datasets
3. **Add Validation**: Use Zod for input validation
4. **Error Handling**: Implement proper error handling
5. **Connection Pooling**: Configure connection limits

## Conclusion

Prisma and SQLite provide a powerful combination for building scalable APIs. The type safety and ease of use make it an excellent choice for modern applications.",
    excerpt: "Discover best practices for creating robust database schemas and efficient queries using Prisma ORM with SQLite for your applications.",
    headerImage: "/api/placeholder/1200/600",
    views: 856,
    readTime: 12,
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
    author: {
      id: "2",
      username: "janedoe",
      email: "jane@example.com"
    },
    tags: ["Prisma", "SQLite", "Database", "API", "TypeScript"]
  }
];

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/articles/${slug}`;
  const text = `Check out this article: ${title}`;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Share:</span>
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
        aria-label="Share on Twitter"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      </a>
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
        aria-label="Share on Facebook"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>
      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-600 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
        aria-label="Share on LinkedIn"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>
    </div>
  );
}

function RelatedArticles({ currentSlug }: { currentSlug: string }) {
  // Filter out current article and get 3 related articles
  const relatedArticles = mockArticles
    .filter(article => article.slug !== currentSlug)
    .slice(0, 3);

  return (
    <section className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Related Articles
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedArticles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="group block bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <span className="text-sm font-medium">Featured Image</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                {article.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                <span>{article.readTime} min read</span>
                <span>•</span>
                <Eye className="h-3 w-3" />
                <span>{article.views.toLocaleString()} views</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function ArticlePage({ params }: ArticlePageProps) {
  // Find the article by slug
  const article = mockArticles.find(a => a.slug === params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Image */}
      <div className="relative h-64 md:h-96 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center text-gray-600 dark:text-gray-300">
          <span className="text-lg font-medium">Featured Image</span>
        </div>
        
        {/* Back Button */}
        <Link
          href="/articles"
          className="absolute top-4 left-4 p-2 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {article.author.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {article.author.username}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <time dateTime={article.createdAt.toISOString()}>
                        {formatDate(article.createdAt)}
                      </time>
                      {article.updatedAt && article.updatedAt > article.createdAt && (
                        <>
                          <span>•</span>
                          <span>Updated {formatDate(article.updatedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{article.readTime} min read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{article.views.toLocaleString()} views</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ArticleEditButton articleSlug={article.slug} authorId={article.author.id} />
                  <ShareButtons title={article.title} slug={article.slug} />
                </div>
              </div>
            </div>
          </header>

          {/* Article Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown
              rehypePlugins={[rehypeHighlight]}
              components={{
                // Custom components for better styling
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {children}
                  </p>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-900 dark:text-gray-100">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className={className}>
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto mb-6">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300 my-6">
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700 dark:text-gray-300">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700 dark:text-gray-300">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">
                    {children}
                  </li>
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </article>

          {/* Related Articles */}
          <RelatedArticles currentSlug={article.slug} />
        </div>
        </div>
      </div>

      {/* Comment Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CommentSection 
          articleId={article.id}
          currentUser={{
            id: "current-user",
            name: "Current User",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
          }}
        />
      </div>
    </div>
  );
}

// Generate static params for static generation
export async function generateStaticParams() {
  return mockArticles.map((article) => ({
    slug: article.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ArticlePageProps) {
  const article = mockArticles.find(a => a.slug === params.slug);
  
  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.createdAt.toISOString(),
      modifiedTime: article.updatedAt?.toISOString(),
      authors: [article.author.username],
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
  };
}