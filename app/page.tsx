"use client"

import { Button } from "@/components/ui/button"
import { NavHeader } from "@/components/devlayers/nav-header"
import { FolderTreeAnimation } from "@/components/devlayers/folder-tree-animation"
import { Logo } from "@/components/devlayers/logo"
import { ArrowRight, Sparkles, FolderOpen, Calendar, Share2, Zap, Github, Twitter, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavHeader variant="landing" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-30" />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Now in Public Beta</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-balance">
                Document Your <span className="text-gradient">Dev Journey</span>. One Day at a Time.
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                A premium platform for developers to maintain structured learning folders, project folders, and daily
                logs — all beautifully organized and shareable.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="gap-2 h-12 px-6 glow-primary press-effect">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button size="lg" variant="outline" className="gap-2 h-12 px-6 press-effect bg-transparent">
                    Explore Public Folders
                  </Button>
                </Link>
              </div>

              {/* Social proof - Updated with Indian names */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[
                    "/indian-woman-developer-avatar.jpg",
                    "/indian-man-software-engineer-avatar.jpg",
                    "/indian-woman-coder-avatar.jpg",
                    "/indian-man-programmer-avatar.jpg",
                    "/indian-woman-tech-professional-avatar.jpg",
                  ].map((src, i) => (
                    <Image
                      key={i}
                      src={src || "/placeholder.svg"}
                      alt={`Developer ${i + 1}`}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full border-2 border-background object-cover"
                    />
                  ))}
                </div>
                <div>
                  <p className="font-semibold">2,847+ developers</p>
                  <p className="text-sm text-muted-foreground">documenting their journey</p>
                </div>
              </div>
            </div>

            {/* Right visual */}
            <div className="relative">
              <div className="relative p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm shadow-2xl shadow-primary/10">
                {/* Terminal header */}
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  <span className="ml-4 text-sm text-muted-foreground font-mono">~/devlayers</span>
                </div>

                <FolderTreeAnimation />
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 p-4 rounded-xl border border-border bg-card shadow-lg animate-bounce-slow">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">Day 47 logged!</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 p-4 rounded-xl border border-border bg-card shadow-lg">
                <div className="flex items-center gap-2 text-orange-500">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-bold">12 day streak</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Everything you need to track your growth
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with obsessive attention to detail. Every feature designed to make documenting your developer
              journey a delight.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {[
              {
                icon: FolderOpen,
                title: "Structured Folders",
                description:
                  "Organize your learning and projects into beautiful, navigable folders with daily entries.",
              },
              {
                icon: Calendar,
                title: "Daily Logs",
                description: "Track your progress day by day with rich text, code snippets, images, and links.",
              },
              {
                icon: Share2,
                title: "Share & Inspire",
                description: "Make folders public to inspire others and build your developer portfolio.",
              },
              {
                icon: Zap,
                title: "Streak Tracking",
                description: "Stay motivated with calm, GitHub-style contribution graphs and streak counters.",
              },
              {
                icon: Github,
                title: "GitHub Integration",
                description: "Link commits, repos, and code directly to your daily logs seamlessly.",
              },
              {
                icon: Sparkles,
                title: "Export Anywhere",
                description: "Transform your folders into documentation, blog posts, or research papers.",
              },
            ].map((feature, index) => (
              <div key={index} className="group p-6 rounded-xl border border-border bg-card hover-lift cursor-pointer">
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Start documenting your journey today</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of developers who are building in public and inspiring others.
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2 h-12 px-8 glow-primary press-effect">
              Create Your First Folder
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
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
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Docs
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
