import { Suspense } from "react";
import Link from "next/link";
import { Search, Calendar, Eye, Clock } from "lucide-react";
import { ArticleCardSkeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/db";
import { renderHtmlContent } from '@/lib/utils';

// Type for article with author and tags
type ArticleWithDetails = {
  id: string;
  title: string;
  slug: string;
  content: string;
  headerImage: string | null;
  published: boolean;
  featured: boolean;
  readTime: number | null;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: {
    id: string;
    username: string;
    email: string;
    image: string | null;
  };
  tags: {
    tag: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      color: string | null;
    };
  }[];
  _count: {
    comments: number;
  };
};

// Function to get excerpt from content
function getExcerpt(content: string, maxLength: number = 150): string {
  const plainText = content.replace(/<[^>]*>/g, '').replace(/[#*`]/g, '');
  return plainText.length > maxLength
    ? plainText.substring(0, maxLength).trim() + '...'
    : plainText;
}

// Function to fetch articles from database
async function getArticles(): Promise<ArticleWithDetails[]> {
  try {
    const articles = await db.article.findMany({
      where: {
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return articles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

function ArticleCard({ article }: { article: ArticleWithDetails }) {
  const excerpt = getExcerpt(article.content);
  const readTime = article.readTime || 5;

  return (
    <article className="group relative bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="aspect-video bg-muted relative overflow-hidden">
          {article.headerImage ? (
            <img
              src={article.headerImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <span className="text-sm font-medium">Featured Image</span>
              </div>
            </>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Calendar className="h-3 w-3" />
            <time dateTime={article.createdAt.toISOString()}>
              {formatDate(article.createdAt)}
            </time>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>{readTime} min read</span>
            <span>•</span>
            <Eye className="h-3 w-3" />
            <span>{article._count.comments} comments</span>
          </div>

          <h2 className="text-xl font-bold text-card-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h2>

          <div className="text-muted-foreground mb-4 line-clamp-3">
            {renderHtmlContent(excerpt)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {article.author.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-foreground">
                {article.author.username}
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {article.tags.slice(0, 2).map((tagRelation, index) => (
                <span
                  key={tagRelation.tag.id}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    index === 0
                      ? 'bg-primary/10 text-primary'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {tagRelation.tag.name}
                </span>
              ))}
              {article.tags.length > 2 && (
                <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">
                  +{article.tags.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

function ArticleFilters() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <select className="px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent">
          <option value="">All Categories</option>
          <option value="nextjs">Next.js</option>
          <option value="react">React</option>
          <option value="typescript">TypeScript</option>
          <option value="css">CSS</option>
        </select>

        <select className="px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="popular">Most Popular</option>
          <option value="views">Most Viewed</option>
        </select>
      </div>
    </div>
  );
}

function Pagination({ total, currentPage = 1, perPage = 6 }: { total: number; currentPage?: number; perPage?: number }) {
  const totalPages = Math.ceil(total / perPage);
  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, total);

  return (
    <div className="flex items-center justify-between mt-12">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{total}</span> results
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-muted-foreground bg-background border border-input rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:text-accent-foreground"
        >
          Previous
        </button>

        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const page = i + 1;
          return (
            <button
              key={page}
              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                page === currentPage
                  ? 'text-white bg-blue-600 border border-blue-600'
                  : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-muted-foreground bg-background border border-input rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:text-accent-foreground"
        >
          Next
        </button>
      </div>
    </div>
  );
}

async function ArticlesList() {
  const articles = await getArticles();

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-foreground mb-2">
          No articles found
        </h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      <Pagination total={articles.length} />
    </>
  );
}

export default function ArticlesPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Articles
        </h1>
        <p className="text-muted-foreground mb-8">
          Discover insights, tutorials, and stories from our community of writers.
        </p>
      </div>

      <ArticleFilters />

      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      }>
        <ArticlesList />
      </Suspense>
    </div>
  );
}