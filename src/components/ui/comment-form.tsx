"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Smile, Eye, EyeOff, Bold, Italic, Code, Link2, List, Quote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CommentFormProps {
  articleId: string;
  parentCommentId?: string;
  currentUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
  onSubmit: (content: string, parentId?: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  submitLabel?: string;
}

const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
  '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
  '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
  '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏',
  '🙌', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
  '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
  '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌈', '☀️', '🌤️'
];

const MARKDOWN_SHORTCUTS = [
  { icon: Bold, label: 'Bold', syntax: '**text**', shortcut: 'Ctrl+B' },
  { icon: Italic, label: 'Italic', syntax: '*text*', shortcut: 'Ctrl+I' },
  { icon: Code, label: 'Code', syntax: '`code`', shortcut: 'Ctrl+`' },
  { icon: Link2, label: 'Link', syntax: '[text](url)', shortcut: 'Ctrl+K' },
  { icon: List, label: 'List', syntax: '- item', shortcut: 'Ctrl+L' },
  { icon: Quote, label: 'Quote', syntax: '> quote', shortcut: 'Ctrl+Q' },
];

export function CommentForm({
  articleId,
  parentCommentId,
  currentUser,
  onSubmit,
  onCancel,
  placeholder = "Write a comment...",
  submitLabel = "Post Comment"
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to post a comment.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim(), parentCommentId);
      setContent('');
      setIsPreview(false);
      toast({
        title: "Success",
        description: "Your comment has been posted.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertMarkdown = (syntax: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = '';
    if (syntax.includes('text')) {
      newText = syntax.replace('text', selectedText || 'text');
    } else if (syntax.includes('url')) {
      newText = syntax.replace('text', selectedText || 'link text').replace('url', 'https://example.com');
    } else {
      newText = syntax;
    }
    
    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
    
    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + newText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + emoji + content.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + emoji.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
    
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertMarkdown('**text**');
          break;
        case 'i':
          e.preventDefault();
          insertMarkdown('*text*');
          break;
        case '`':
          e.preventDefault();
          insertMarkdown('`code`');
          break;
        case 'k':
          e.preventDefault();
          insertMarkdown('[text](url)');
          break;
        case 'l':
          e.preventDefault();
          insertMarkdown('- item');
          break;
        case 'q':
          e.preventDefault();
          insertMarkdown('> quote');
          break;
        case 'Enter':
          e.preventDefault();
          handleSubmit(e);
          break;
      }
    }
  };

  const renderPreview = () => {
    if (!content.trim()) {
      return <div className="text-gray-500 dark:text-gray-400 italic">Nothing to preview</div>;
    }
    
    // Simple markdown rendering for preview
    let html = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic">$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(\n|^)((?:<li>.*<\/li>\n?)+)/g, '$1<ul class="list-disc list-inside">$2</ul>')
      .replace(/\n/g, '<br>');
    
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  if (!currentUser) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-3">
          Please log in to post a comment.
        </p>
        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
          <AvatarFallback className="text-xs">
            {currentUser.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1">
                {MARKDOWN_SHORTCUTS.map((shortcut) => {
                  const Icon = shortcut.icon;
                  return (
                    <button
                      key={shortcut.label}
                      type="button"
                      onClick={() => insertMarkdown(shortcut.syntax)}
                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      title={`${shortcut.label} (${shortcut.shortcut})`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
                
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Add emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  
                  {showEmojiPicker && (
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 z-10 w-64 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-8 gap-1">
                        {EMOJI_LIST.map((emoji, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => insertEmoji(emoji)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {isPreview ? 'Edit' : 'Preview'}
              </button>
            </div>
            
            {/* Content Area */}
            <div className="p-3">
              {isPreview ? (
                <div className="min-h-[100px] text-sm text-gray-700 dark:text-gray-300">
                  {renderPreview()}
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="w-full min-h-[100px] resize-none border-none outline-none bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isSubmitting}
                />
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Supports markdown. Use Ctrl+Enter to submit.
            </div>
            
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={!content.trim() || isSubmitting}
              >
                {isSubmitting ? 'Posting...' : submitLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}