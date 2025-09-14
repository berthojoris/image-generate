# Project Specifications: AI Image Generator

This document outlines the key specifications, technologies, and project needs for the "AI Image Generator" project.

## 1. Project Overview

The project is an application focused on AI image generation. It aims to provide user authentication and interactive features, alongside modern UI/UX.

## 2. Core Technologies

*   **Framework:** Next.js (v15.3.4) - A React framework for building full-stack web applications.
*   **Language:** TypeScript (v5) - For type-safe and scalable code.
*   **Styling:**
    *   Tailwind CSS (v4) - A utility-first CSS framework for rapid UI development.
    *   PostCSS - For transforming CSS with JavaScript plugins.
    *   `tailwindcss-animate` - For animating Tailwind CSS classes.
*   **Database:**
    *   SQLite (for development) - A file-based database.
    *   Prisma ORM (`prisma-client-js`) - A modern database toolkit for type-safe database access.
*   **Authentication:** NextAuth.js - For flexible authentication in Next.js applications, supporting various providers (Credentials, Google, GitHub).
*   **Validation:** Zod - A TypeScript-first schema declaration and validation library.
*   **UI Components:**
    *   Radix UI - A set of unstyled, accessible UI components (Dropdown Menu, Label, Navigation Menu, Select, Separator, Toast).
    *   Lucide React - A collection of customizable SVG icons.
    *   Sonner - An opinionated toast component for React.
*   **Linting:** ESLint - For identifying and reporting on patterns in JavaScript code, configured with Next.js and TypeScript specific rules.
*   **Font:** Geist - A new font family optimized for Vercel.

## 3. Key Features

### 3.1 AI Image Generation
*   **API Endpoint:** Dedicated API route (`/api/generate-image`) for handling image generation requests.
*   **Integration:** Appears to integrate with OpenRouter for AI model access (`/api/test-openrouter`).

### 3.2 General Features
*   **Authentication:**
    *   User registration, login, logout.
    *   Password reset flow.
    *   OAuth integration (Google, GitHub).
    *   Session management.
*   **User Interface:**
    *   Responsive layout.
    *   Light/Dark theme toggle with persistence.
    *   Header/navigation bar with authentication status.
    *   Footer component.
    *   Loading skeleton components.
    *   Toast notification system.
    *   Loading system bar for AJAX call progress.
*   **Admin Dashboard:**
    *   Protected routes for administrators.
    *   Overview dashboard with key metrics, recent activity, monthly growth statistics.
    *   Site configuration, user registration settings, maintenance mode toggle.
    *   *Note: Blog-specific metrics like "popular articles" have been removed.*

## 4. Project Needs & Future Enhancements (Pending Tasks)

*   **SEO Optimizations:** Meta tags, sitemap generation.
*   **Performance Optimizations:** Image optimization, lazy loading, code splitting.
*   **Testing:** Unit tests for critical components, integration tests for main flows, end-to-end tests for key functionalities (user registration, image generation).
*   **Deployment:** Docker configuration, CI/CD pipeline, database backup strategy.

## 5. Project Structure Highlights

*   **Next.js App Router:** Utilizes the `app` directory for routing and server components.
*   **API Routes:** `src/app/api/` for backend functionalities (e.g., `generate-image`, `login`, `models`, `test-openrouter`).
*   **Components:** `src/components/` organized into `layout` (header, footer) and `ui` (reusable UI elements like buttons, cards, inputs).
*   **Hooks:** `src/hooks/` for custom React hooks (e.g., `use-toast`).
*   **Libraries/Utilities:** `src/lib/` for shared logic (e.g., `models.ts`, `utils.ts`, `validations.ts`).
*   **Providers:** `src/providers/` for context providers (e.g., `providers.tsx`, `theme-provider.tsx`).
*   **Prisma:** `prisma/` directory contains the database schema and development database.