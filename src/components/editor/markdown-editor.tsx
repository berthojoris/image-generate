'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Eye,
  Edit,
  Save
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownEditorProps {
  content?: string
  onChange?: (content: string) => void
  onSave?: (content: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
  showToolbar?: boolean
  autoSave?: boolean
  autoSaveInterval?: number
}

export function MarkdownEditor({
  content = '',
  onChange,
  onSave,
  placeholder = 'Start writing your article in Markdown...',
  className,
  readOnly = false,
  showToolbar = true,
  autoSave = false,
  autoSaveInterval = 30000
}: MarkdownEditorProps) {
  const [markdown, setMarkdown] = useState(content)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [wordCount, setWordCount] = useState(0)
  const [readTime, setReadTime] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Update content when prop changes
  useEffect(() => {
    setMarkdown(content)
  }, [content])

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !onSave) return

    const interval = setInterval(() => {
      if (markdown.trim()) {
        onSave(markdown)
        setLastSaved(new Date())
      }
    }, autoSaveInterval)

    return () => clearInterval(interval)
  }, [autoSave, autoSaveInterval, markdown, onSave])

  const handleContentChange = useCallback((value: string) => {
    setMarkdown(value)
    
    // Update word count and read time
    const text = value.replace(/[#*`_~\[\]()]/g, '').trim()
    const words = text.split(/\s+/).filter(word => word.length > 0).length
    setWordCount(words)
    setReadTime(Math.ceil(words / 200))
    
    onChange?.(value)
  }, [onChange])

  const insertMarkdown = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = markdown.substring(start, end)
    const textToInsert = selectedText || placeholder
    
    const newText = markdown.substring(0, start) + before + textToInsert + after + markdown.substring(end)
    
    handleContentChange(newText)
    
    // Set cursor position
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }, [markdown, handleContentChange])

  const handleSave = useCallback(() => {
    if (!onSave) return
    
    onSave(markdown)
    setLastSaved(new Date())
  }, [markdown, onSave])

  const toolbarButtons = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => insertMarkdown('**', '**', 'bold text')
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => insertMarkdown('*', '*', 'italic text')
    },
    {
      icon: Strikethrough,
      label: 'Strikethrough',
      action: () => insertMarkdown('~~', '~~', 'strikethrough text')
    },
    {
      icon: Code,
      label: 'Inline Code',
      action: () => insertMarkdown('`', '`', 'code')
    },
    {
      icon: Heading1,
      label: 'Heading 1',
      action: () => insertMarkdown('# ', '', 'Heading 1')
    },
    {
      icon: Heading2,
      label: 'Heading 2',
      action: () => insertMarkdown('## ', '', 'Heading 2')
    },
    {
      icon: Heading3,
      label: 'Heading 3',
      action: () => insertMarkdown('### ', '', 'Heading 3')
    },
    {
      icon: List,
      label: 'Bullet List',
      action: () => insertMarkdown('- ', '', 'List item')
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => insertMarkdown('1. ', '', 'List item')
    },
    {
      icon: Quote,
      label: 'Quote',
      action: () => insertMarkdown('> ', '', 'Quote text')
    },
    {
      icon: LinkIcon,
      label: 'Link',
      action: () => insertMarkdown('[', '](https://example.com)', 'link text')
    },
    {
      icon: ImageIcon,
      label: 'Image',
      action: () => insertMarkdown('![', '](https://example.com/image.jpg)', 'alt text')
    }
  ]

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {showToolbar && (
        <div className="border-b bg-gray-50 dark:bg-gray-800 p-2">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1 mb-2">
            {toolbarButtons.map((button, index) => {
              const Icon = button.icon
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={button.action}
                  className="h-8 w-8 p-0"
                  title={button.label}
                  disabled={readOnly}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              )
            })}
            
            {onSave && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="h-8 px-3 ml-2"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>{wordCount} words</span>
              <span>{readTime} min read</span>
              {lastSaved && (
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Editor/Preview Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="mt-0">
          <Textarea
            value={markdown}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[400px] border-0 resize-none focus:ring-0 font-mono text-sm"
            readOnly={readOnly}
          />
        </TabsContent>
        
        <TabsContent value="preview" className="mt-0">
          <div className="p-4 min-h-[400px] overflow-auto">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none"
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
                img: ({ src, alt }) => (
                  <img src={src} alt={alt} className="rounded-lg max-w-full h-auto" />
                ),
                a: ({ href, children }) => (
                  <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                table: ({ children }) => (
                  <table className="border-collapse border border-gray-300 w-full">
                    {children}
                  </table>
                ),
                th: ({ children }) => (
                  <th className="border border-gray-300 bg-gray-50 font-semibold p-2 text-left">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-gray-300 p-2">
                    {children}
                  </td>
                )
              }}
            >
              {markdown || '*Nothing to preview*'}
            </ReactMarkdown>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Markdown cheat sheet component
export function MarkdownCheatSheet() {
  const examples = [
    { syntax: '# Heading 1', description: 'Large heading' },
    { syntax: '## Heading 2', description: 'Medium heading' },
    { syntax: '### Heading 3', description: 'Small heading' },
    { syntax: '**bold text**', description: 'Bold text' },
    { syntax: '*italic text*', description: 'Italic text' },
    { syntax: '~~strikethrough~~', description: 'Strikethrough text' },
    { syntax: '`inline code`', description: 'Inline code' },
    { syntax: '```\ncode block\n```', description: 'Code block' },
    { syntax: '- List item', description: 'Bullet list' },
    { syntax: '1. List item', description: 'Numbered list' },
    { syntax: '> Quote text', description: 'Blockquote' },
    { syntax: '[Link text](URL)', description: 'Link' },
    { syntax: '![Alt text](image-url)', description: 'Image' },
    { syntax: '| Col 1 | Col 2 |\n|-------|-------|\n| Data  | Data  |', description: 'Table' }
  ]

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Markdown Cheat Sheet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {examples.map((example, index) => (
            <div key={index} className="space-y-1">
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block">
                {example.syntax}
              </code>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {example.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}