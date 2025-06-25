'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Edit } from 'lucide-react'

interface ArticleEditButtonProps {
  articleSlug: string
  authorId: string
}

export function ArticleEditButton({ articleSlug, authorId }: ArticleEditButtonProps) {
  const { data: session } = useSession()

  // Only show edit button if user is the author
  if (!session?.user?.id || session.user.id !== authorId) {
    return null
  }

  return (
    <Link
      href={`/articles/${articleSlug}/edit`}
      className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
    >
      <Edit className="h-4 w-4" />
      <span>Edit Article</span>
    </Link>
  )
}