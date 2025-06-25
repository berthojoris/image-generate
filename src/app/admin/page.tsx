import { Suspense } from 'react'
import Link from 'next/link'
import { 
  FileText, 
  Users, 
  MessageSquare, 
  Eye, 
  Plus,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/db'

// Stats components
async function DashboardStats() {
  const [articlesCount, usersCount, commentsCount, totalViews] = await Promise.all([
    db.article.count(),
    db.user.count(),
    db.comment.count(),
    db.articleView.count()
  ])

  const stats = [
    {
      title: 'Total Articles',
      value: articlesCount,
      icon: FileText,
      description: 'Published articles',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Total Users',
      value: usersCount,
      icon: Users,
      description: 'Registered users',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Total Comments',
      value: commentsCount,
      icon: MessageSquare,
      description: 'User comments',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Total Views',
      value: totalViews,
      icon: Eye,
      description: 'Article views',
      color: 'text-orange-600 dark:text-orange-400'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function RecentArticles() {
  const articles = await db.article.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: { name: true, username: true }
      },
      _count: {
        select: { comments: true }
      }
    }
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Articles</CardTitle>
            <CardDescription>Latest published articles</CardDescription>
          </div>
          <Link href="/admin/articles">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {articles.map((article) => (
            <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{article.title}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">
                    by {article.author?.name || 'Unknown'}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {article.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{article.views}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{article._count.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

async function RecentUsers() {
  const users = await db.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      status: true,
      createdAt: true
    }
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Newly registered users</CardDescription>
          </div>
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{user.name || 'No name'}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">@{user.username}</span>
                  <Badge 
                    variant={user.role === 'ADMIN' ? 'default' : 'secondary'} 
                    className="text-xs"
                  >
                    {user.role}
                  </Badge>
                  <Badge 
                    variant={user.status === 'ACTIVE' ? 'default' : 'destructive'} 
                    className="text-xs"
                  >
                    {user.status}
                  </Badge>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome to the admin dashboard. Here's an overview of your blog.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/admin/articles/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <Suspense fallback={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      }>
        <DashboardStats />
      </Suspense>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/articles/new">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Create Article
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<LoadingCard />}>
          <RecentArticles />
        </Suspense>
        <Suspense fallback={<LoadingCard />}>
          <RecentUsers />
        </Suspense>
      </div>
    </div>
  )
}