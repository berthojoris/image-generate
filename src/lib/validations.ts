import { z } from 'zod'

// User validation schemas
export const userRegistrationSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const userProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  image: z.string().url().optional().or(z.literal('')),
})

export const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(1, 'Password is required'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Article validation schemas
export const articleCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z
    .string()
    .max(300, 'Excerpt must be less than 300 characters')
    .optional(),
  headerImage: z.string().url().optional().or(z.literal('')),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
})

export const articleUpdateSchema = articleCreateSchema.extend({
  id: z.string().cuid(),
})

export const articleSlugSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
})

// Comment validation schemas
export const commentCreateSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment content is required')
    .max(1000, 'Comment must be less than 1000 characters'),
  articleId: z.string().cuid(),
  parentId: z.string().cuid().optional(),
})

export const commentUpdateSchema = z.object({
  id: z.string().cuid(),
  content: z
    .string()
    .min(1, 'Comment content is required')
    .max(1000, 'Comment must be less than 1000 characters'),
})

// Tag validation schemas
export const tagCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name must be less than 50 characters'),
  description: z
    .string()
    .max(200, 'Description must be less than 200 characters')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color')
    .optional(),
})

export const tagUpdateSchema = tagCreateSchema.extend({
  id: z.string().cuid(),
})

// Newsletter validation schema
export const newsletterSubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Search validation schema
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query must be less than 100 characters'),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
})

// Pagination validation schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  sortBy: z.enum(['createdAt', 'updatedAt', 'views', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Admin validation schemas
export const userRoleUpdateSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(['USER', 'EDITOR', 'ADMIN']),
})

export const userStatusUpdateSchema = z.object({
  userId: z.string().cuid(),
  status: z.enum(['ACTIVE', 'BANNED', 'PENDING']),
})

// File upload validation schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp']),
})

// Type exports for use in components
export type UserRegistration = z.infer<typeof userRegistrationSchema>
export type UserLogin = z.infer<typeof userLoginSchema>
export type UserProfile = z.infer<typeof userProfileSchema>
export type PasswordReset = z.infer<typeof passwordResetSchema>
export type PasswordChange = z.infer<typeof passwordChangeSchema>
export type ArticleCreate = z.infer<typeof articleCreateSchema>
export type ArticleUpdate = z.infer<typeof articleUpdateSchema>
export type ArticleSlug = z.infer<typeof articleSlugSchema>
export type CommentCreate = z.infer<typeof commentCreateSchema>
export type CommentUpdate = z.infer<typeof commentUpdateSchema>
export type TagCreate = z.infer<typeof tagCreateSchema>
export type TagUpdate = z.infer<typeof tagUpdateSchema>
export type NewsletterSubscribe = z.infer<typeof newsletterSubscribeSchema>
export type Search = z.infer<typeof searchSchema>
export type Pagination = z.infer<typeof paginationSchema>
export type UserRoleUpdate = z.infer<typeof userRoleUpdateSchema>
export type UserStatusUpdate = z.infer<typeof userStatusUpdateSchema>
export type FileUpload = z.infer<typeof fileUploadSchema>