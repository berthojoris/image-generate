'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WysiwygEditor } from './wysiwyg-editor'
import { MarkdownEditor, MarkdownCheatSheet } from './markdown-editor'
import { Eye, Edit, Code, Type, HelpCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type EditorType = 'wysiwyg' | 'markdown'

interface EditorSelectorProps {
  content?: string
  onChange?: (content: string) => void
  onSave?: (content: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
  defaultEditor?: EditorType
  autoSave?: boolean
  autoSaveInterval?: number
}

export function EditorSelector({
  content = '',
  onChange,
  onSave,
  placeholder,
  className,
  readOnly = false,
  defaultEditor = 'wysiwyg',
  autoSave = false,
  autoSaveInterval = 30000
}: EditorSelectorProps) {
  const [selectedEditor, setSelectedEditor] = useState<EditorType>(defaultEditor)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const editorOptions = [
    {
      id: 'wysiwyg' as EditorType,
      name: 'WYSIWYG Editor',
      description: 'Rich text editor with visual formatting',
      icon: Type,
      features: [
        'Visual formatting toolbar',
        'Real-time preview',
        'Easy to use for beginners',
        'Rich media support',
        'Table editing'
      ]
    },
    {
      id: 'markdown' as EditorType,
      name: 'Markdown Editor',
      description: 'Write in Markdown with live preview',
      icon: Code,
      features: [
        'Markdown syntax support',
        'Split view editing',
        'Syntax highlighting',
        'Faster for experienced users',
        'Portable format'
      ]
    }
  ]

  return (
    <div className={cn('space-y-4', className)}>
      {/* Editor Selection */}
      {!readOnly && (
        <div className="flex items-center justify-between">
          <Tabs value={selectedEditor} onValueChange={(value) => setSelectedEditor(value as EditorType)}>
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="wysiwyg" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                WYSIWYG
              </TabsTrigger>
              <TabsTrigger value="markdown" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Markdown
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editor Help</DialogTitle>
                <DialogDescription>
                  Choose the editor that works best for you
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {editorOptions.map((editor) => {
                  const Icon = editor.icon
                  return (
                    <Card key={editor.id} className={cn(
                      'cursor-pointer transition-colors',
                      selectedEditor === editor.id && 'ring-2 ring-blue-500'
                    )}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          {editor.name}
                        </CardTitle>
                        <CardDescription>{editor.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {editor.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {selectedEditor === 'markdown' && (
                <div className="mt-6">
                  <MarkdownCheatSheet />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Editor Component */}
      <div className="border rounded-lg overflow-hidden">
        {selectedEditor === 'wysiwyg' ? (
          <WysiwygEditor
            content={content}
            onChange={onChange}
            onSave={onSave}
            placeholder={placeholder || 'Start writing your article...'}
            readOnly={readOnly}
            autoSave={autoSave}
            autoSaveInterval={autoSaveInterval}
          />
        ) : (
          <MarkdownEditor
            content={content}
            onChange={onChange}
            onSave={onSave}
            placeholder={placeholder || 'Start writing your article in Markdown...'}
            readOnly={readOnly}
            autoSave={autoSave}
            autoSaveInterval={autoSaveInterval}
          />
        )}
      </div>

      {/* Editor Tips */}
      {!readOnly && (
        <div className="text-xs text-gray-500 space-y-1">
          {selectedEditor === 'wysiwyg' ? (
            <div>
              <p>💡 <strong>Tip:</strong> Use the toolbar buttons or keyboard shortcuts for quick formatting.</p>
              <p>🔗 <strong>Links:</strong> Select text and click the link button to add hyperlinks.</p>
              <p>🖼️ <strong>Images:</strong> Click the image button to insert images from URLs.</p>
            </div>
          ) : (
            <div>
              <p>💡 <strong>Tip:</strong> Use the Edit/Preview tabs to see your formatted content.</p>
              <p>📝 <strong>Syntax:</strong> Click the Help button to see Markdown syntax examples.</p>
              <p>⚡ <strong>Speed:</strong> Markdown is faster once you learn the syntax!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Export individual editors for direct use
export { WysiwygEditor, MarkdownEditor, MarkdownCheatSheet }