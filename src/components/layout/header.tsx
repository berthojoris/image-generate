"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, LogOut } from "lucide-react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const navigation = [
];

export function Header() {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = 'authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border backdrop-blur-md shadow-sm" style={{backgroundColor: 'var(--header-bg)'}}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">
                AI Image Generator
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu.Root className="hidden md:flex">
            <NavigationMenu.List className="flex items-center space-x-6">
              {navigation.map((item) => (
                <NavigationMenu.Item key={item.name}>
                  <NavigationMenu.Link asChild>
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.name}
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
              ))}
            </NavigationMenu.List>
          </NavigationMenu.Root>

          {/* Right side - Theme toggle and Logout button */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>

          </div>
        </div>

      </div>
    </header>
  );
}