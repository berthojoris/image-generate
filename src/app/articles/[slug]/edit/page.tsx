'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EditorSelector } from '@/components/editor/editor-selector'
import { toast } from 'sonner'
import { Save, Eye, Send, X, Plus, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string
  status: 'DRAFT' | 'PUBLISHED'
  tags: { id: string; name: string; slug: string }[]
  author: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface ArticleFormData {
  title: string
  excerpt: string
  content: string
  tags: string[]
  status: 'DRAFT' | 'PUBLISHED'
  featuredImage?: string
}

interface EditPageProps {
  params: {
    slug: string
  }
}

export default function EditArticlePage({ params }: EditPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [tagInput, setTagInput] = useState('')
  
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    excerpt: '',
    content: '',
    tags: [],
    status: 'DRAFT'
  })

  // Fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${params.slug}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Article not found')
            router.push('/articles')
            return
          }
          throw new Error('Failed to fetch article')
        }
        
        const articleData = await response.json()
        setArticle(articleData)
        
        // Populate form data
        setFormData({
          title: articleData.title,
          excerpt: articleData.excerpt || '',
          content: articleData.content,
          tags: articleData.tags.map((tag: any) => tag.name),
          status: articleData.status,
          featuredImage: articleData.featuredImage || ''
        })
      } catch (error) {
        console.error('Error fetching article:', error)
        toast.error('Failed to load article')
        router.push('/articles')
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticle()
  }, [params.slug, router])

  // Check authorization
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    
    if (article && session?.user?.id && article.author.id !== session.user.id) {
      toast.error('You are not authorized to edit this article')
      router.push(`/articles/${params.slug}`)
      return
    }
  }, [status, article, session, params.slug, router])

  const handleInputChange = (field: keyof ArticleFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const updateArticle = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!article) return
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (!formData.content.trim()) {
      toast.error('Please add some content')
      return
    }

    setIsSaving(true)

    try {
      const slug = formData.title !== article.title ? generateSlug(formData.title) : article.slug
      
      const response = await fetch(`/api/articles/${article.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          slug,
          status
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update article')
      }

      const updatedArticle = await response.json()
      
      toast.success(
        status === 'PUBLISHED' 
          ? 'Article published successfully!' 
          : 'Article updated successfully!'
      )
      
      // Redirect to the article (with potentially new slug)
      router.push(`/articles/${updatedArticle.slug}`)
    } catch (error) {
      console.error('Error updating article:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update article')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAutoSave = async (content: string) => {
    if (!article || !formData.title.trim()) return
    
    // Auto-save logic here
    console.log('Auto-saving...', { title: formData.title, content })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/articles/${article.slug}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Article
              </Button>
            </Link>
            
            <div>
              <h1 className="text-3xl font-bold">Edit Article</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Last updated: {new Date(article.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => updateArticle('DRAFT')}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            
            <Button
              onClick={() => updateArticle('PUBLISHED')}
              disabled={isSaving || !formData.title.trim() || !formData.content.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSaving ? 'Publishing...' : 'Update & Publish'}
            </Button>
          </div>
        </div>

        {/* Article Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <Card>
              <CardHeader>
                <CardTitle>Article Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter your article title..."
                    className="text-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder="Brief description of your article..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featured-image">Featured Image URL</Label>
                  <Input
                    id="featured-image"
                    value={formData.featuredImage || ''}
                    onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Content *</CardTitle>
              </CardHeader>
              <CardContent>
                <EditorSelector
                  content={formData.content}
                  onChange={(content) => handleInputChange('content', content)}
                  onSave={handleAutoSave}
                  autoSave={true}
                  autoSaveInterval={30000}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Options */}
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'DRAFT' | 'PUBLISHED') => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Created: {new Date(article.createdAt).toLocaleDateString()}</p>
                  <p>Updated: {new Date(article.updatedAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tags">Add Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter a tag..."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTag}
                      disabled={!tagInput.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="space-y-2">
                    <Label>Current Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview */}
            {formData.featuredImage && (
              <Card>
                <CardHeader>
                  <CardTitle>Featured Image Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={formData.featuredImage}
                    alt="Featured image preview"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}