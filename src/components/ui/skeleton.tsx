import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-700", className)}
      {...props}
    />
  );
}

// Article Card Skeleton
function ArticleCardSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
      <Skeleton className="h-48 w-full" /> {/* Header image */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" /> {/* Title */}
        <Skeleton className="h-4 w-full" /> {/* Excerpt line 1 */}
        <Skeleton className="h-4 w-2/3" /> {/* Excerpt line 2 */}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded-full" /> {/* Avatar */}
          <Skeleton className="h-4 w-20" /> {/* Author name */}
        </div>
        <Skeleton className="h-4 w-16" /> {/* Date */}
      </div>
      <div className="flex items-center justify-between text-sm">
        <Skeleton className="h-4 w-12" /> {/* Read time */}
        <Skeleton className="h-4 w-16" /> {/* View count */}
      </div>
    </div>
  );
}

// Article Detail Skeleton
function ArticleDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" /> {/* Title */}
        <div className="flex items-center space-x-4">
          <Skeleton className="h-6 w-6 rounded-full" /> {/* Avatar */}
          <Skeleton className="h-4 w-32" /> {/* Author */}
          <Skeleton className="h-4 w-24" /> {/* Date */}
          <Skeleton className="h-4 w-20" /> {/* Read time */}
        </div>
      </div>
      <Skeleton className="h-64 w-full" /> {/* Header image */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
    </div>
  );
}

// Comment Skeleton
function CommentSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded-full" /> {/* Avatar */}
        <Skeleton className="h-4 w-24" /> {/* Username */}
        <Skeleton className="h-4 w-16" /> {/* Date */}
      </div>
      <div className="space-y-2 ml-10">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// Navigation Skeleton
function NavigationSkeleton() {
  return (
    <div className="flex items-center justify-between p-4">
      <Skeleton className="h-8 w-32" /> {/* Logo */}
      <div className="flex items-center space-x-4">
        <Skeleton className="h-6 w-16" /> {/* Nav item */}
        <Skeleton className="h-6 w-16" /> {/* Nav item */}
        <Skeleton className="h-6 w-20" /> {/* Nav item */}
        <Skeleton className="h-8 w-8 rounded-full" /> {/* Theme toggle */}
      </div>
    </div>
  );
}

export { 
  Skeleton, 
  ArticleCardSkeleton, 
  ArticleDetailSkeleton, 
  CommentSkeleton, 
  NavigationSkeleton 
};