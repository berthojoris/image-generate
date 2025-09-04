import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/providers/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LoadingBar } from "@/components/ui/loading-bar";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Image Generator - Powered by OpenRouter",
  description: "Generate stunning AI images from text prompts using advanced models like Gemini 2.5 Flash and FLUX.1 Schnell.",
  keywords: ["ai", "image generation", "nextjs", "react", "typescript", "tailwind", "openrouter", "gemini", "flux"],
  authors: [{ name: "AI Image Generator Team" }],
  creator: "AI Image Generator",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ai-image-generator.com",
    title: "AI Image Generator - Powered by OpenRouter",
    description: "Generate stunning AI images from text prompts using advanced models like Gemini 2.5 Flash and FLUX.1 Schnell.",
    siteName: "AI Image Generator",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Image Generator - Powered by OpenRouter",
    description: "Generate stunning AI images from text prompts using advanced models like Gemini 2.5 Flash and FLUX.1 Schnell.",
    creator: "@aigenerator",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <LoadingBar />
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
