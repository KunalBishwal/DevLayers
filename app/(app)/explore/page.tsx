"use client"

import { PostCard } from "@/components/devlayers/post-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, TrendingUp, Clock, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

const mockPosts = [
  {
    id: "1",
    day: 67,
    title: "Finally understood React Server Components!",
    content:
      "After weeks of confusion, today everything clicked. The key insight: think of RSCs as a way to render components on the server while keeping interactivity where needed. Here's my mental model...",
    author: { name: "Priya Sharma", username: "priyasharma", avatar: "/indian-woman-developer-priya.jpg" },
    date: "2 hours ago",
    likes: 142,
    comments: 24,
    hasGithubLink: true,
    tags: ["react", "nextjs", "server-components"],
    isLiked: false,
  },
  {
    id: "2",
    day: 34,
    title: "Building a design system from scratch",
    content:
      "Day 34 of my design system journey. Today I focused on creating accessible form components. The key is to handle all the edge cases: error states, loading states, disabled states...",
    author: { name: "Arjun Patel", username: "arjunpatel", avatar: "/indian-man-programmer-arjun.jpg" },
    date: "5 hours ago",
    likes: 89,
    comments: 12,
    hasImage: true,
    imageUrl: "/design-system-components-dark-mode.jpg",
    tags: ["design-system", "accessibility", "tailwind"],
    isLiked: true,
  },
  {
    id: "3",
    day: 12,
    title: "Rust ownership model finally makes sense",
    content:
      "Coming from JavaScript, the Rust ownership model was the hardest concept to grasp. But today, after building a small CLI tool, I finally get it. Here's how I think about it...",
    author: { name: "Vikram Reddy", username: "vikramreddy", avatar: "/indian-man-developer-vikram.jpg" },
    date: "Yesterday",
    likes: 234,
    comments: 45,
    hasGithubLink: true,
    tags: ["rust", "systems-programming", "cli"],
    isBookmarked: true,
  },
  {
    id: "4",
    day: 45,
    title: "Implementing real-time features with WebSockets",
    content:
      "Added real-time collaboration to my SaaS project today. The stack: Socket.io on the backend, React hooks on the frontend. Key learnings about handling reconnection and state sync...",
    author: { name: "Ananya Krishnan", username: "ananyak", avatar: "/indian-woman-tech-professional-ananya.jpg" },
    date: "2 days ago",
    likes: 67,
    comments: 8,
    tags: ["websockets", "real-time", "saas"],
  },
  {
    id: "5",
    day: 28,
    title: "Migrating from REST to GraphQL",
    content:
      "Completed the migration of our main API from REST to GraphQL. The type safety and query flexibility has been a game changer for our frontend team...",
    author: { name: "Rahul Verma", username: "rahulverma", avatar: "/indian-man-software-engineer-rahul.jpg" },
    date: "3 days ago",
    likes: 156,
    comments: 32,
    hasGithubLink: true,
    tags: ["graphql", "api", "typescript"],
  },
]

const trendingTags = ["react", "typescript", "nextjs", "rust", "ai", "design-system", "saas", "learning"]

export default function ExplorePage() {
  const [scrollY, setScrollY] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const filteredPosts = searchQuery
    ? mockPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : mockPosts

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Explore</h1>
        <p className="text-muted-foreground">Discover learning journeys and projects from the developer community</p>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search posts, folders, and users..."
            className="pl-10 h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Trending tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Trending:
          </span>
          {trendingTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer hover:bg-primary/20 transition-colors"
              onClick={() => setSearchQuery(tag)}
            >
              #{tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Feed tabs */}
      <Tabs defaultValue="trending">
        <TabsList>
          <TabsTrigger value="trending" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="recent" className="gap-2">
            <Clock className="w-4 h-4" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="following" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Following
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-6 space-y-6 stagger-children">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </TabsContent>

        <TabsContent value="recent" className="mt-6 space-y-6 stagger-children">
          {filteredPosts
            .slice()
            .reverse()
            .map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
        </TabsContent>

        <TabsContent value="following" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            <p>Follow developers to see their posts here</p>
            <Link href="/search">
              <Button variant="outline" className="mt-4 bg-transparent">
                Discover Developers
              </Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>

      {/* Floating day indicator */}
      <div
        className={`fixed right-8 top-1/2 -translate-y-1/2 transition-opacity duration-300 hidden lg:block ${
          scrollY > 200 ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-2 p-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border shadow-lg">
          {filteredPosts.map((post) => (
            <button
              key={post.id}
              className="w-8 h-8 rounded-lg bg-secondary hover:bg-primary/20 flex items-center justify-center text-xs font-mono transition-colors"
              title={`Day ${post.day}: ${post.title}`}
            >
              {post.day}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
