import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Users, FileText, MessageSquare, Eye } from 'lucide-react'
import { db } from '@/lib/db'

async function AnalyticsData() {
  // Get current date ranges
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Fetch analytics data
  const [totalUsers, totalArticles, totalComments, totalViews] = await Promise.all([
    db.user.count(),
    db.article.count(),
    db.comment.count(),
    db.article.aggregate({ _sum: { views: true } })
  ])

  // Monthly comparisons
  const [usersThisMonth, usersLastMonth] = await Promise.all([
    db.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    db.user.count({ 
      where: { 
        createdAt: { 
          gte: startOfLastMonth,
          lte: endOfLastMonth
        } 
      } 
    })
  ])

  const [articlesThisMonth, articlesLastMonth] = await Promise.all([
    db.article.count({ where: { createdAt: { gte: startOfMonth } } }),
    db.article.count({ 
      where: { 
        createdAt: { 
          gte: startOfLastMonth,
          lte: endOfLastMonth
        } 
      } 
    })
  ])

  // Recent activity
  const recentArticles = await db.article.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true, username: true } },
      _count: { select: { comments: true } }
    }
  })

  const topArticles = await db.article.findMany({
    take: 5,
    orderBy: { views: 'desc' },
    include: {
      author: { select: { name: true, username: true } },
      _count: { select: { comments: true } }
    }
  })

  // Calculate growth percentages
  const userGrowth = usersLastMonth > 0 ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100 : 0
  const articleGrowth = articlesLastMonth > 0 ? ((articlesThisMonth - articlesLastMonth) / articlesLastMonth) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {userGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={userGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(userGrowth).toFixed(1)}%
              </span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArticles.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {articleGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={articleGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(articleGrowth).toFixed(1)}%
              </span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalArticles > 0 ? (totalComments / totalArticles).toFixed(1) : 0} avg per article
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalViews._sum.views || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalArticles > 0 ? ((totalViews._sum.views || 0) / totalArticles).toFixed(0) : 0} avg per article
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Articles</CardTitle>
            <CardDescription>Latest published content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentArticles.map((article) => (
                <div key={article.id} className="flex items-start justify-between space-x-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {article.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {article.author?.name || 'Unknown'} • {new Date(article.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Badge variant={article.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {article.status}
                    </Badge>
                    <span>{article.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Articles */}
        <Card>
          <CardHeader>
            <CardTitle>Top Articles</CardTitle>
            <CardDescription>Most viewed content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topArticles.map((article, index) => (
                <div key={article.id} className="flex items-start justify-between space-x-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {article.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        by {article.author?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-xs text-gray-500">
                    <span className="font-medium">{article.views} views</span>
                    <span>{article._count.comments} comments</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Activity</CardTitle>
          <CardDescription>Content and user activity this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{usersThisMonth}</div>
              <p className="text-sm text-gray-500">New Users</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{articlesThisMonth}</div>
              <p className="text-sm text-gray-500">New Articles</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((articlesThisMonth / new Date().getDate()) * 30)}
              </div>
              <p className="text-sm text-gray-500">Projected Monthly Articles</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your blog's performance and user engagement.
        </p>
      </div>

      {/* Analytics Data */}
      <Suspense fallback={<LoadingSkeleton />}>
        <AnalyticsData />
      </Suspense>
    </div>
  )
}