"use client";

import * as React from "react";
import Link from "next/link";
import { Github, Twitter, Linkedin, Mail, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";

const footerLinks = {
  company: [
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
  resources: [
    { name: "Articles", href: "/articles" },
    { name: "Categories", href: "/categories" },
    { name: "Tags", href: "/tags" },
    { name: "RSS Feed", href: "/rss.xml" },
  ],
  social: [
    { name: "GitHub", href: "#", icon: Github },
    { name: "Twitter", href: "#", icon: Twitter },
    { name: "LinkedIn", href: "#", icon: Linkedin },
    { name: "Email", href: "mailto:contact@blogspace.com", icon: Mail },
  ],
};

export function Footer() {
  const [email, setEmail] = React.useState("");
  const [isSubscribing, setIsSubscribing] = React.useState(false);
  const [subscribed, setSubscribed] = React.useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    
    try {
      // TODO: Implement newsletter subscription API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSubscribed(true);
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription failed:", error);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Brand and Description */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <PenTool className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                BlogSpace
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              A modern blog platform built with Next.js, featuring beautiful design,
              powerful content management, and seamless user experience.
            </p>
            <div className="mt-6 flex space-x-4">
              {footerLinks.social.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    <span className="sr-only">{item.name}</span>
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Resources
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Stay Updated
            </h3>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Subscribe to our newsletter for the latest articles and updates.
            </p>
            {subscribed ? (
              <div className="mt-4 rounded-md bg-green-50 p-3 dark:bg-green-900/20">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✓ Successfully subscribed to our newsletter!
                </p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="mt-4">
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={cn(
                      "flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm",
                      "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                      "dark:border-gray-600 dark:bg-gray-800 dark:text-white",
                      "dark:focus:border-blue-400 dark:focus:ring-blue-400"
                    )}
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className={cn(
                      "rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white",
                      "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-900"
                    )}
                  >
                    {isSubscribing ? "Subscribing..." : "Subscribe"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} BlogSpace. All rights reserved.
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 sm:mt-0">
              Built with ❤️ using Next.js and Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}