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
  title: "BlogSpace - Modern Blog Platform",
  description: "A modern blog platform built with Next.js, featuring beautiful design and powerful content management.",
  keywords: ["blog", "nextjs", "react", "typescript", "tailwind"],
  authors: [{ name: "BlogSpace Team" }],
  creator: "BlogSpace",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://blogspace.com",
    title: "BlogSpace - Modern Blog Platform",
    description: "A modern blog platform built with Next.js, featuring beautiful design and powerful content management.",
    siteName: "BlogSpace",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlogSpace - Modern Blog Platform",
    description: "A modern blog platform built with Next.js, featuring beautiful design and powerful content management.",
    creator: "@blogspace",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
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
