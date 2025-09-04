import { z } from 'zod'

// Image generation validation schemas
export const imageGenerationSchema = z.object({
  prompt: z
    .string()
    .min(1, 'Prompt is required')
    .max(1000, 'Prompt must be less than 1000 characters'),
  imageUrl: z.string().url().optional(),
  model: z.string().min(1, 'Model selection is required'),
})

// File upload validation schema for images
export const imageUploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(10 * 1024 * 1024), // 10MB default for images
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
})

// API response validation schema
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
})

// Type exports for use in components
export type ImageGeneration = z.infer<typeof imageGenerationSchema>
export type ImageUpload = z.infer<typeof imageUploadSchema>
export type ApiResponse = z.infer<typeof apiResponseSchema>