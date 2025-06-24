# Blog Project Task List

## Project Planning
- [x] Create detailed implementation plan
- [x] Define technology stack and architecture
- [x] Set up project structure guidelines
- [x] Document memory optimization strategies

## Relevant Files
- `IMPLEMENTATION_PLAN.md` - Comprehensive implementation guide
- `.trae/rules/project_rules.md` - Project rules and requirements
- `TASKS.md` - This task tracking file
- `prisma/schema.prisma` - Database schema with all tables
- `src/lib/db.ts` - Prisma client configuration
- `src/lib/auth.ts` - NextAuth.js configuration
- `src/lib/utils.ts` - Utility functions
- `src/lib/validations.ts` - Zod validation schemas
- `.env.example` - Environment variables template
- `package.json` - Updated with all required dependencies

## Database Setup (SQLite)
- [x] Set up SQLite database connection
- [x] Create `articles` table with fields: id, title, slug, content, header_image, views, created_at, updated_at
- [x] Create `users` table with fields: id, username, email, password_hash, role, status, created_at
- [x] Create `comments` table with fields: id, article_id, user_id, content, created_at
- [x] Create `article_views` table for tracking views: id, article_id, user_id, viewed_at
- [x] Set up Prisma ORM with comprehensive schema
- [x] Configure NextAuth.js with Prisma adapter
- [x] Create database utility functions
- [x] Set up validation schemas with Zod
- [x] Configure authentication providers (Credentials, Google, GitHub)

## Core UI Components
- [x] Create responsive layout component with theme toggle
- [x] Design header/navigation bar with auth status
- [x] Create footer component
- [x] Build loading skeleton components
- [x] Implement toast notification system
- [x] Implement loading system bar using js for progress when ajax call to server
- [ ] For every loading data or element on website, use nextjs React Suspense loading.js

## Article Features
- [ ] Article listing page with pagination (10 articles per page)
- [ ] Article card component with:
  - [ ] Featured image
  - [ ] Title/excerpt
  - [ ] View count
  - [ ] Date
  - [ ] Read time estimate
- [ ] Article detail page with:
  - [ ] Proper markdown rendering
  - [ ] Syntax highlighting for code blocks
  - [ ] Responsive images
  - [ ] View counter
  - [ ] Share buttons

## Comment System
- [ ] Comment section below articles
- [ ] Comment form with:
  - [ ] Emoji picker integration
  - [ ] Markdown support
  - [ ] Preview mode
- [ ] Nested comment replies
- [ ] Comment moderation controls (for admin)

## Authentication
- [ ] User registration form
- [ ] Login/logout functionality
- [ ] Password reset flow
- [ ] OAuth integration (Google/GitHub)
- [ ] Session management

## Admin Dashboard
- [ ] Admin layout with protected routes
- [ ] Article management:
  - [ ] Create/edit form with WYSIWYG editor
  - [ ] Live preview functionality
  - [ ] Slug editing before publish
  - [ ] Slug on title and use this for url path when open article detail
  - [ ] Image upload for headers
  - [ ] Draft/published states
- [ ] User management:
  - [ ] User listing with search
  - [ ] Ban/unban functionality
  - [ ] Role management
- [ ] Analytics:
  - [ ] Views per article
  - [ ] Popular articles
  - [ ] Recent comments

## WYSIWYG Editor Implementation
- [ ] Integrate editor (TipTap or similar)
- [ ] Configure toolbar with:
  - [ ] Text formatting
  - [ ] Headers
  - [ ] Lists
  - [ ] Code blocks
  - [ ] Image upload
  - [ ] Tables
  - [ ] Markdown shortcuts
- [ ] Implement draft saving
- [ ] Add word count/read time estimation

## Theme System
- [x] Implement light/dark theme toggle
- [x] Create theme context/provider
- [x] Design system for:
  - [x] Colors
  - [x] Typography
  - [x] Spacing
  - [x] Shadows
- [x] Persist theme preference in localStorage

## Additional Features
- [ ] Search functionality
- [ ] Article tags/categories
- [ ] Related articles section
- [ ] RSS feed generation
- [ ] SEO optimizations (meta tags, sitemap)
- [ ] Performance optimizations:
  - [ ] Image optimization
  - [ ] Lazy loading
  - [ ] Code splitting

## Testing
- [ ] Unit tests for critical components
- [ ] Integration tests for main flows
- [ ] End-to-end tests for:
  - [ ] Article creation
  - [ ] Commenting
  - [ ] User registration

## Deployment
- [ ] Docker configuration
- [ ] CI/CD pipeline
- [ ] Database backup strategy