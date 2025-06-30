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
    <article className="group relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
          {article.headerImage ? (
            <img
              src={article.headerImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <span className="text-sm font-medium">Featured Image</span>
              </div>
            </>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
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

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {article.title}
          </h2>

          <div className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {renderHtmlContent(excerpt)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {article.author.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {article.author.username}
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {article.tags.slice(0, 2).map((tagRelation) => (
                <span
                  key={tagRelation.tag.id}
                  className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                >
                  {tagRelation.tag.name}
                </span>
              ))}
              {article.tags.length > 2 && (
                <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="">All Categories</option>
          <option value="nextjs">Next.js</option>
          <option value="react">React</option>
          <option value="typescript">TypeScript</option>
          <option value="css">CSS</option>
        </select>

        <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{total}</span> results
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
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
          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No articles found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          There are no published articles yet. Check back later!
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          All Articles
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
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