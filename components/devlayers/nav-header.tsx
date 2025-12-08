"use client"

import { cn } from "@/lib/utils"
import { Logo } from "./logo"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Bell, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface NavHeaderProps {
  variant?: "landing" | "app"
  className?: string
}

export function NavHeader({ variant = "landing", className }: NavHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (variant === "landing") {
    return (
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "border-b border-border/50 bg-background/80 backdrop-blur-lg",
          className,
        )}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="group">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Explore
            </Link>
            <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup" className="hidden sm:block">
              <Button size="sm" className="glow-sm">
                Get Started
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg">
            <nav className="flex flex-col p-4 space-y-3">
              <Link href="/explore" className="px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
                Explore
              </Link>
              <Link href="/features" className="px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
                Docs
              </Link>
              <Link href="/signup">
                <Button className="w-full mt-2">Get Started</Button>
              </Link>
            </nav>
          </div>
        )}
      </header>
    )
  }

  return (
    <header className={cn("sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm", className)}>
      <div className="h-14 px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search folders, posts, users..." className="pl-9 bg-secondary border-none h-9" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  )
}
