"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, User, LogOut, Settings, PenTool, Edit } from "lucide-react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Articles", href: "/articles" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border backdrop-blur-md shadow-sm" style={{backgroundColor: 'var(--header-bg)'}}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <PenTool className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">
                BlogSpace
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

          {/* Right side - Write, Theme toggle and Auth */}
          <div className="flex items-center space-x-4">
            {session && (
              <Link
                href="/write"
                className="hidden sm:flex items-center space-x-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Write</span>
              </Link>
            )}
            <ThemeToggle />
            
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : session ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center space-x-2 rounded-full bg-secondary p-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                    <span className="hidden sm:block">
                      {session.user?.name || session.user?.email}
                    </span>
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[200px] rounded-md border border-border bg-popover p-1 shadow-lg"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/write"
                        className="flex items-center space-x-2 rounded-sm px-3 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground sm:hidden"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Write Article</span>
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 rounded-sm px-3 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenu.Item>
                    {(session.user as any)?.role === "ADMIN" && (
                      <DropdownMenu.Item asChild>
                        <Link
                          href="/admin"
                          className="flex items-center space-x-2 rounded-sm px-3 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                          <PenTool className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Separator className="my-1 h-px bg-border" />
                    <DropdownMenu.Item
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 rounded-sm px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {session && (
                <Link
                  href="/write"
                  className="block px-3 py-2 text-base font-medium text-primary hover:bg-primary/10 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Write Article
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}