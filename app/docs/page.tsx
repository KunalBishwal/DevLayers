"use client"

import { NavHeader } from "@/components/devlayers/nav-header"
import { Logo } from "@/components/devlayers/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  BookOpen,
  Folder,
  PenSquare,
  Share2,
  Download,
  Settings,
  Code,
  Zap,
  ChevronRight,
  Github,
  Twitter,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

const docCategories = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "Learn the basics and create your first folder",
    articles: ["Quick Start Guide", "Creating Your First Folder", "Understanding the Dashboard", "Account Setup"],
  },
  {
    icon: Folder,
    title: "Folders & Organization",
    description: "Master the art of organizing your dev journey",
    articles: [
      "Learning Folders vs Project Folders",
      "Folder Templates",
      "Linking Related Folders",
      "Archiving & Restoring",
    ],
  },
  {
    icon: PenSquare,
    title: "Daily Logging",
    description: "Write effective daily logs that track your progress",
    articles: [
      "Writing Great Daily Logs",
      "Rich Text & Code Snippets",
      "Adding Images & Attachments",
      "Using Tags Effectively",
    ],
  },
  {
    icon: Share2,
    title: "Sharing & Collaboration",
    description: "Share your journey and inspire others",
    articles: ["Making Folders Public", "Privacy Settings", "Following Developers", "Building Your Portfolio"],
  },
  {
    icon: Download,
    title: "Export & Integration",
    description: "Export your work and integrate with other tools",
    articles: ["Export to Markdown", "Generate Documentation", "Blog Post Generation", "GitHub Integration"],
  },
  {
    icon: Code,
    title: "API Reference",
    description: "Build on top of DevLayers with our API",
    articles: ["Authentication", "Folders API", "Posts API", "Webhooks"],
  },
]

const popularArticles = [
  { title: "Quick Start Guide", category: "Getting Started", time: "5 min read" },
  { title: "Writing Great Daily Logs", category: "Daily Logging", time: "8 min read" },
  { title: "Export to Markdown", category: "Export", time: "4 min read" },
  { title: "GitHub Integration Setup", category: "Integration", time: "6 min read" },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavHeader variant="landing" />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 border-b border-border">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Documentation</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Learn how to use <span className="text-gradient">DevLayers</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Everything you need to know to document your developer journey effectively.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search documentation..." className="pl-12 h-14 text-lg bg-card border-border" />
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-12 px-6 border-b border-border bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Popular Articles
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularArticles.map((article, index) => (
              <Link
                key={index}
                href="#"
                className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group"
              >
                <p className="text-xs text-muted-foreground mb-1">{article.category}</p>
                <h3 className="font-medium group-hover:text-primary transition-colors mb-2">{article.title}</h3>
                <p className="text-xs text-muted-foreground">{article.time}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Browse by Category</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {docCategories.map((category, index) => (
              <div key={index} className="p-6 rounded-xl border border-border bg-card hover-lift group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <category.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>

                <ul className="space-y-2">
                  {category.articles.map((article, i) => (
                    <li key={i}>
                      <Link
                        href="#"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                      >
                        <ChevronRight className="w-4 h-4" />
                        {article}
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link
                  href="#"
                  className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-4 hover:underline"
                >
                  View all articles
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Github className="w-5 h-5" />
                GitHub Discussions
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Ask questions and get help from the community.</p>
              <Button variant="outline" className="gap-2 bg-transparent">
                Join Discussion
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                API Reference
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Build integrations with our comprehensive API.</p>
              <Button variant="outline" className="gap-2 bg-transparent">
                View API Docs
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo />
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Button variant="ghost" size="icon">
                <Github className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            © 2025 DevLayers. Crafted with obsessive attention to detail.
          </p>
        </div>
      </footer>
    </div>
  )
}
