"use client";

import * as React from "react";
import Link from "next/link";
import { Github, Twitter, Linkedin, Mail, Sparkles } from "lucide-react";

const footerLinks = {
  resources: [
    { name: "OpenRouter API", href: "https://openrouter.ai", external: true },
    { name: "Gemini Models", href: "https://ai.google.dev/gemini-api", external: true },
    { name: "FLUX Models", href: "https://blackforestlabs.ai", external: true },
    { name: "Source Code", href: "#", external: true },
  ],
  social: [
    { name: "GitHub", href: "#", icon: Github },
    { name: "Twitter", href: "#", icon: Twitter },
    { name: "LinkedIn", href: "#", icon: Linkedin },
    { name: "Email", href: "mailto:contact@ai-generator.com", icon: Mail },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Brand and Description */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-violet-600 dark:text-violet-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                AI Image Generator
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Generate stunning AI images from text prompts using advanced models
              like Gemini 2.5 Flash and FLUX.1 Schnell. Powered by OpenRouter API.
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

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Resources
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Features
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="text-sm text-gray-600 dark:text-gray-400">
                • Free AI image generation
              </li>
              <li className="text-sm text-gray-600 dark:text-gray-400">
                • Multiple AI models
              </li>
              <li className="text-sm text-gray-600 dark:text-gray-400">
                • Image analysis
              </li>
              <li className="text-sm text-gray-600 dark:text-gray-400">
                • Download generated images
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} AI Image Generator. All rights reserved.
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 sm:mt-0">
              Powered by OpenRouter API • Built with Next.js
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}