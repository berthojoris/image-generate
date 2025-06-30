import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { Calendar, Eye, Clock, Share2, Twitter, Facebook, Linkedin, Link2, ArrowLeft, User, Tag } from "lucide-react";
import { CommentSection } from "@/components/ui/comment-section";
import { ArticleEditButton } from "@/components/ui/article-edit-button";
import { db } from "@/lib/db";
import { renderHtmlContent } from "@/lib/utils";
import "highlight.js/styles/github-dark.css";

// Function to get article by slug from database
async function getArticleBySlug(slug: string) {
  try {
    const article = await db.article.findFirst({
      where: {
        slug: slug,
        published: true
      },
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
            comments: true
          }
        }
      }
    });
    
    return article;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

// Function to get related articles
async function getRelatedArticles(currentSlug: string, limit: number = 3) {
  try {
    const articles = await db.article.findMany({
      where: {
        slug: { not: currentSlug },
        published: true
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            image: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    
    return articles;
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
}

interface ArticlePageProps {
  params: {
    slug: string;
  };
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

async function RelatedArticles({ currentSlug }: { currentSlug: string }) {
  const relatedArticles = await getRelatedArticles(currentSlug, 3);

  if (relatedArticles.length === 0) {
    return null;
  }

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
              <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {renderHtmlContent(article.excerpt)}
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                <span>{article.readTime || 5} min read</span>
                <span>•</span>
                <Eye className="h-3 w-3" />
                <span>{(article.views || 0).toLocaleString()} views</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  // Find the article by slug
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

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
              {article.tags.map((articleTag) => (
                <span
                  key={articleTag.tag.id}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                >
                  <Tag className="h-3 w-3" />
                  {articleTag.tag.name}
                </span>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {article.title}
            </h1>
            
            {article.excerpt && (
              <div className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {renderHtmlContent(article.excerpt)}
              </div>
            )}
            
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
                      <time dateTime={new Date(article.createdAt).toISOString()}>
                        {new Date(article.createdAt).toLocaleDateString()}
                      </time>
                      {article.updatedAt && new Date(article.updatedAt) > new Date(article.createdAt) && (
                        <>
                          <span>•</span>
                          <span>Updated {new Date(article.updatedAt).toLocaleDateString()}</span>
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
                    <span>{article.readTime || 5} min read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{(article.views || 0).toLocaleString()} views</span>
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
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
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
  try {
    const articles = await db.article.findMany({
      where: { published: true },
      select: { slug: true }
    });
    
    return articles.map((article) => ({
      slug: article.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  
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
      publishedTime: new Date(article.createdAt).toISOString(),
      modifiedTime: article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
      authors: [article.author.username],
      tags: article.tags.map(t => t.tag.name),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
  };
}