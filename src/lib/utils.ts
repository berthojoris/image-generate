import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import slugify from "slugify"
import readingTime from "reading-time"
import React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"`!:@]/g,
  })
}

export function calculateReadingTime(content: string): number {
  const stats = readingTime(content)
  return Math.ceil(stats.minutes)
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  return formatDate(dateObj)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function extractExcerpt(content: string, maxLength: number = 160): string {
  // Remove markdown syntax and HTML tags
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim()

  return truncateText(plainText, maxLength)
}

export function generateMetaDescription(content: string): string {
  return extractExcerpt(content, 155) // SEO optimal length
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Function to safely render HTML content as React elements
export function renderHtmlContent(htmlString: string): React.ReactNode {
  if (!htmlString) return null
  
  // Simple HTML to React conversion for basic tags
  const parts = htmlString.split(/(<\/?[^>]+>)/)
  const elements: React.ReactNode[] = []
  let key = 0
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    
    if (part.startsWith('<') && part.endsWith('>')) {
      const tagMatch = part.match(/<\/?([a-zA-Z]+)[^>]*>/)
      if (tagMatch) {
        const tagName = tagMatch[1].toLowerCase()
        const isClosing = part.startsWith('</')
        
        if (!isClosing) {
          // Find the closing tag
          let content = ''
          let j = i + 1
          let depth = 1
          
          while (j < parts.length && depth > 0) {
            if (parts[j].startsWith('<') && parts[j].endsWith('>')) {
              const nextTagMatch = parts[j].match(/<\/?([a-zA-Z]+)[^>]*>/)
              if (nextTagMatch && nextTagMatch[1].toLowerCase() === tagName) {
                if (parts[j].startsWith('</')) {
                  depth--
                } else {
                  depth++
                }
              }
            }
            
            if (depth > 0) {
              content += parts[j]
            }
            j++
          }
          
          // Create React element based on tag
          switch (tagName) {
            case 'p':
              elements.push(React.createElement('span', { key: key++ }, renderHtmlContent(content)))
              break
            case 'b':
            case 'strong':
              elements.push(React.createElement('strong', { key: key++ }, renderHtmlContent(content)))
              break
            case 'i':
            case 'em':
              elements.push(React.createElement('em', { key: key++ }, renderHtmlContent(content)))
              break
            case 'br':
              elements.push(React.createElement('br', { key: key++ }))
              break
            default:
              elements.push(renderHtmlContent(content))
          }
          
          // Skip to after the closing tag
          i = j - 1
        }
      }
    } else if (part.trim()) {
      // Regular text content
      elements.push(part)
    }
  }
  
  return elements.length === 1 ? elements[0] : React.createElement(React.Fragment, {}, ...elements)
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}