import { Suspense } from "react";
import Link from "next/link";
import { Search, Calendar, Eye, Clock } from "lucide-react";
import { ArticleCardSkeleton } from "@/components/ui/skeleton";

// Mock data - will be replaced with real database queries
const mockArticles = [
  {
    id: "1",
    title: "Getting Started with Next.js 15 and React 19",
    slug: "getting-started-nextjs-15-react-19",
    excerpt: "Learn how to build modern web applications with the latest features in Next.js 15 and React 19, including server components and improved performance.",
    headerImage: "/api/placeholder/600/300",
    views: 1234,
    readTime: 8,
    createdAt: new Date("2024-01-15"),
    author: {
      username: "johndoe",
      email: "john@example.com"
    },
    tags: ["Next.js", "React", "Web Development"]
  },
  {
    id: "2",
    title: "Building Scalable APIs with Prisma and SQLite",
    slug: "building-scalable-apis-prisma-sqlite",
    excerpt: "Discover best practices for creating robust database schemas and efficient queries using Prisma ORM with SQLite for your applications.",
    headerImage: "/api/placeholder/600/300",
    views: 856,
    readTime: 12,
    createdAt: new Date("2024-01-12"),
    author: {
      username: "janedoe",
      email: "jane@example.com"
    },
    tags: ["Prisma", "SQLite", "Database", "API"]
  },
  {
    id: "3",
    title: "Mastering Tailwind CSS 4: Advanced Techniques",
    slug: "mastering-tailwind-css-4-advanced-techniques",
    excerpt: "Explore advanced Tailwind CSS techniques including custom utilities, component patterns, and performance optimizations for large-scale projects.",
    headerImage: "/api/placeholder/600/300",
    views: 2103,
    readTime: 15,
    createdAt: new Date("2024-01-10"),
    author: {
      username: "alexsmith",
      email: "alex@example.com"
    },
    tags: ["Tailwind CSS", "CSS", "Frontend", "Design"]
  },
  {
    id: "4",
    title: "Authentication Best Practices with NextAuth.js",
    slug: "authentication-best-practices-nextauth",
    excerpt: "Implement secure authentication flows using NextAuth.js with multiple providers, session management, and security considerations.",
    headerImage: "/api/placeholder/600/300",
    views: 945,
    readTime: 10,
    createdAt: new Date("2024-01-08"),
    author: {
      username: "mikejohnson",
      email: "mike@example.com"
    },
    tags: ["Authentication", "NextAuth.js", "Security"]
  },
  {
    id: "5",
    title: "TypeScript Tips for React Developers",
    slug: "typescript-tips-react-developers",
    excerpt: "Level up your React development with advanced TypeScript patterns, type safety best practices, and common pitfalls to avoid.",
    headerImage: "/api/placeholder/600/300",
    views: 1567,
    readTime: 7,
    createdAt: new Date("2024-01-05"),
    author: {
      username: "sarahwilson",
      email: "sarah@example.com"
    },
    tags: ["TypeScript", "React", "Development"]
  },
  {
    id: "6",
    title: "Optimizing Performance in Modern Web Apps",
    slug: "optimizing-performance-modern-web-apps",
    excerpt: "Learn essential performance optimization techniques including code splitting, lazy loading, and caching strategies for faster web applications.",
    headerImage: "/api/placeholder/600/300",
    views: 789,
    readTime: 11,
    createdAt: new Date("2024-01-03"),
    author: {
      username: "davidbrown",
      email: "david@example.com"
    },
    tags: ["Performance", "Optimization", "Web Development"]
  }
];

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

function ArticleCard({ article }: { article: typeof mockArticles[0] }) {
  return (
    <article className="group relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <span className="text-sm font-medium">Featured Image</span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <Calendar className="h-3 w-3" />
            <time dateTime={article.createdAt.toISOString()}>
              {formatDate(article.createdAt)}
            </time>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>{article.readTime} min read</span>
            <span>•</span>
            <Eye className="h-3 w-3" />
            <span>{article.views.toLocaleString()} views</span>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {article.title}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {article.excerpt}
          </p>
          
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
              {article.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                >
                  {tag}
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

function Pagination() {
  return (
    <div className="flex items-center justify-between mt-12">
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Showing <span className="font-medium">1</span> to <span className="font-medium">6</span> of{' '}
        <span className="font-medium">24</span> results
      </div>
      
      <div className="flex items-center gap-2">
        <button
          disabled
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700">
          1
        </button>
        
        <button className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          2
        </button>
        
        <button className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          3
        </button>
        
        <span className="px-3 py-2 text-sm text-gray-500">...</span>
        
        <button className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          4
        </button>
        
        <button className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          Next
        </button>
      </div>
    </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </Suspense>
      
      <Pagination />
    </div>
  );
}