import Link from "next/link";
import { ArrowRight, BookOpen, Users, Zap, Star } from "lucide-react";
import { ArticleCardSkeleton } from "@/components/ui/skeleton";

const features = [
  {
    icon: BookOpen,
    title: "Rich Content",
    description: "Create beautiful articles with our powerful WYSIWYG editor and markdown support."
  },
  {
    icon: Users,
    title: "Community",
    description: "Engage with readers through comments, discussions, and social interactions."
  },
  {
    icon: Zap,
    title: "Fast & Modern",
    description: "Built with Next.js 15 and React 19 for optimal performance and user experience."
  },
  {
    icon: Star,
    title: "SEO Optimized",
    description: "Built-in SEO features to help your content reach a wider audience."
  },
];

const stats = [
  { label: "Articles Published", value: "1,234" },
  { label: "Active Writers", value: "567" },
  { label: "Monthly Readers", value: "89K" },
  { label: "Comments", value: "12.3K" },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BlogSpace
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              A modern blog platform where ideas come to life. Share your thoughts,
              connect with readers, and build your community with our powerful and
              intuitive blogging tools.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/articles"
                className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
              >
                Explore Articles
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Start Writing <ArrowRight className="ml-1 inline h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to blog
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Powerful features designed to help you create, share, and grow your audience.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Articles Preview */}
      <section className="bg-white dark:bg-gray-900 py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Latest Articles
              </h2>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                Discover the newest content from our community
              </p>
            </div>
            <Link
              href="/articles"
              className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View all articles <ArrowRight className="ml-1 inline h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder for articles - will be replaced with real data later */}
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 dark:bg-blue-700">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Ready to start your blogging journey?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
              Join thousands of writers who trust BlogSpace to share their stories
              and connect with their audience.
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-6">
              <Link
                href="/auth/signup"
                className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
              >
                Get Started for Free
              </Link>
              <Link
                href="/about"
                className="text-sm font-semibold leading-6 text-white hover:text-blue-100 transition-colors"
              >
                Learn more <ArrowRight className="ml-1 inline h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
