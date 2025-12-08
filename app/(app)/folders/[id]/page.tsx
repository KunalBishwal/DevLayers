"use client"

import { Timeline } from "@/components/devlayers/timeline"
import { DaySelector } from "@/components/devlayers/day-selector"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Edit, Share2, MoreHorizontal, Globe, LinkIcon, Plus, Code, ArrowLeft } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

const foldersData: Record<string, typeof mockFolder> = {
  "1": {
    id: "1",
    title: "Learning React",
    description:
      "Deep diving into React 19 features, hooks patterns, and server components. This folder documents my 100-day journey to master React.",
    type: "learning",
    daysLogged: 23,
    totalDays: 100,
    isPublic: true,
    createdAt: "Dec 1, 2024",
  },
  "2": {
    id: "2",
    title: "Fintech SaaS Project",
    description:
      "Building a UPI-based payment dashboard with Next.js and Razorpay integration. Tracking daily progress on features, UI, and backend.",
    type: "project",
    daysLogged: 45,
    totalDays: 60,
    isPublic: false,
    createdAt: "Oct 15, 2024",
  },
  "3": {
    id: "3",
    title: "Rust Journey",
    description:
      "Learning systems programming with Rust. From basics to advanced concepts including ownership, lifetimes, and async programming.",
    type: "learning",
    daysLogged: 12,
    totalDays: 100,
    isPublic: true,
    createdAt: "Nov 20, 2024",
  },
  "4": {
    id: "4",
    title: "AI Chatbot Project",
    description:
      "Building an AI-powered customer support chatbot using OpenAI and LangChain. Documenting architecture decisions and implementation details.",
    type: "project",
    daysLogged: 8,
    totalDays: 30,
    isPublic: true,
    createdAt: "Dec 5, 2024",
  },
}

const mockFolder = {
  id: "1",
  title: "Learning React",
  description:
    "Deep diving into React 19 features, hooks patterns, and server components. This folder documents my 100-day journey to master React.",
  type: "learning",
  daysLogged: 23,
  totalDays: 100,
  isPublic: true,
  createdAt: "Dec 1, 2024",
}

const postsData: Record<string, typeof mockPosts> = {
  "1": [
    {
      id: "1",
      day: 23,
      title: "Server Components Deep Dive",
      content:
        "Today I explored React Server Components in depth. The mental model shift from traditional React is significant. Key learnings: RSCs run only on the server, can directly access backend resources, and produce zero bundle size increase.",
      author: { name: "Kunal Bishwal", username: "kunalbishwal", avatar: "/indian-man-developer-kunal.jpg" },
      date: "Today",
      likes: 24,
      comments: 5,
      hasGithubLink: true,
      tags: ["react", "server-components", "nextjs"],
      isLiked: true,
    },
    {
      id: "2",
      day: 22,
      title: "Custom Hooks Patterns",
      content:
        "Built several custom hooks today for form handling and data fetching. The useOptimistic hook is incredibly powerful for building responsive UIs.",
      author: { name: "Kunal Bishwal", username: "kunalbishwal", avatar: "/indian-man-developer-kunal.jpg" },
      date: "Yesterday",
      likes: 18,
      comments: 3,
      hasGithubLink: true,
      tags: ["react", "hooks", "patterns"],
    },
    {
      id: "3",
      day: 21,
      title: "State Management Comparison",
      content:
        "Compared different state management solutions: useState, useReducer, Context API, Zustand, and Jotai. For this project, I decided to go with Zustand.",
      author: { name: "Kunal Bishwal", username: "kunalbishwal", avatar: "/indian-man-developer-kunal.jpg" },
      date: "2 days ago",
      likes: 42,
      comments: 12,
      tags: ["react", "state-management", "zustand"],
      isBookmarked: true,
    },
  ],
  "2": [
    {
      id: "1",
      day: 45,
      title: "Razorpay Integration Complete",
      content:
        "Finally integrated Razorpay payment gateway. Handled webhooks, refunds, and subscription logic. The documentation was great!",
      author: { name: "Kunal Bishwal", username: "kunalbishwal", avatar: "/indian-man-developer-kunal.jpg" },
      date: "Yesterday",
      likes: 56,
      comments: 8,
      hasGithubLink: true,
      tags: ["fintech", "razorpay", "payments"],
      isLiked: true,
    },
    {
      id: "2",
      day: 44,
      title: "Dashboard Charts with Recharts",
      content:
        "Built beautiful analytics charts showing transaction trends, revenue graphs, and user activity. Recharts made it super easy.",
      author: { name: "Kunal Bishwal", username: "kunalbishwal", avatar: "/indian-man-developer-kunal.jpg" },
      date: "2 days ago",
      likes: 34,
      comments: 5,
      tags: ["charts", "recharts", "analytics"],
    },
  ],
  "3": [
    {
      id: "1",
      day: 12,
      title: "Ownership Model Finally Clicked",
      content:
        "After struggling for days, the Rust ownership model finally makes sense! The key insight: think of it as compile-time garbage collection.",
      author: { name: "Kunal Bishwal", username: "kunalbishwal", avatar: "/indian-man-developer-kunal.jpg" },
      date: "3 days ago",
      likes: 89,
      comments: 15,
      hasGithubLink: true,
      tags: ["rust", "ownership", "memory"],
      isLiked: true,
    },
    {
      id: "2",
      day: 11,
      title: "Building a CLI Tool",
      content:
        "Started building my first CLI tool in Rust using clap. The type safety is amazing - catches so many bugs at compile time.",
      author: { name: "Kunal Bishwal", username: "kunalbishwal", avatar: "/indian-man-developer-kunal.jpg" },
      date: "4 days ago",
      likes: 45,
      comments: 7,
      tags: ["rust", "cli", "clap"],
    },
  ],
  "4": [
    {
      id: "1",
      day: 8,
      title: "LangChain Agent Architecture",
      content:
        "Designed the agent architecture using LangChain. The chatbot can now handle multi-turn conversations and remember context.",
      author: { name: "Kunal Bishwal", username: "kunalbishwal", avatar: "/indian-man-developer-kunal.jpg" },
      date: "1 week ago",
      likes: 67,
      comments: 12,
      hasGithubLink: true,
      tags: ["ai", "langchain", "chatbot"],
      isLiked: true,
    },
  ],
}

const mockPosts = [
  {
    id: "1",
    day: 23,
    title: "Server Components Deep Dive",
    content:
      "Today I explored React Server Components in depth. The mental model shift from traditional React is significant. Key learnings: RSCs run only on the server, can directly access backend resources, and produce zero bundle size increase. Experimented with mixing client and server components...",
    author: { name: "Kunal Bishwal", username: "kunalbishwal", avatar: "/indian-man-developer-kunal.jpg" },
    date: "Today",
    likes: 24,
    comments: 5,
    hasGithubLink: true,
    tags: ["react", "server-components", "nextjs"],
    isLiked: true,
  },
  {
    id: "2",
    day: 22,
    title: "Custom Hooks Patterns",
    content:
      "Built several custom hooks today for form handling and data fetching. The useOptimistic hook is incredibly powerful for building responsive UIs. Also explored the new use() hook for promises and context.",
    author: { name: "Kunal Bishwal", username: "kunalbishwal", avatar: "/indian-man-developer-kunal.jpg" },
    date: "Yesterday",
    likes: 18,
    comments: 3,
    hasGithubLink: true,
    hasImage: true,
    imageUrl: "/code-editor-react-hooks.jpg",
    tags: ["react", "hooks", "patterns"],
  },
  {
    id: "3",
    day: 21,
    title: "State Management Comparison",
    content:
      "Compared different state management solutions: useState, useReducer, Context API, Zustand, and Jotai. For this project, I decided to go with Zustand for its simplicity and minimal boilerplate. The devtools integration is excellent.",
    author: { name: "Kunal Bishwal", username: "kunalbishwal", avatar: "/indian-man-developer-kunal.jpg" },
    date: "2 days ago",
    likes: 42,
    comments: 12,
    tags: ["react", "state-management", "zustand"],
    isBookmarked: true,
  },
]

const linkedFolders = [
  { id: "2", title: "Fintech SaaS Project", type: "project" },
  { id: "3", title: "Rust Journey", type: "learning" },
]

export default function FolderPage() {
  const params = useParams()
  const folderId = params.id as string

  const folder = foldersData[folderId] || mockFolder
  const posts = postsData[folderId] || mockPosts

  const [currentDay, setCurrentDay] = useState(folder.daysLogged)

  const FolderIcon = folder.type === "learning" ? BookOpen : Code

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${folder.type === "learning" ? "bg-primary/10" : "bg-accent/10"}`}>
              <FolderIcon className={`w-6 h-6 ${folder.type === "learning" ? "text-primary" : "text-accent"}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{folder.title}</h1>
                {folder.isPublic && (
                  <Badge variant="outline" className="gap-1">
                    <Globe className="w-3 h-3" />
                    Public
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Started {folder.createdAt} · {folder.daysLogged} days logged
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed">{folder.description}</p>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {folder.daysLogged} / {folder.totalDays} days
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${folder.type === "learning" ? "bg-primary" : "bg-accent"}`}
              style={{ width: `${(folder.daysLogged / folder.totalDays) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="linked">Linked Folders</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6 space-y-6">
          {/* Day selector */}
          <div className="flex items-center justify-between">
            <DaySelector totalDays={folder.daysLogged} currentDay={currentDay} onDayChange={setCurrentDay} />
            <Link href="/create">
              <Button size="sm" className="gap-2 glow-sm press-effect">
                <Plus className="w-4 h-4" />
                New Post
              </Button>
            </Link>
          </div>

          {/* Timeline */}
          <Timeline posts={posts} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Visual Timeline</h3>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: folder.totalDays }, (_, i) => {
                const day = i + 1
                const isLogged = day <= folder.daysLogged
                const isToday = day === folder.daysLogged
                return (
                  <button
                    key={day}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-mono transition-all ${
                      isToday
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
                        : isLogged
                          ? "bg-primary/20 text-primary hover:bg-primary/30"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                    onClick={() => isLogged && setCurrentDay(day)}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="linked" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Linked Folders</h3>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <LinkIcon className="w-4 h-4" />
                Link Folder
              </Button>
            </div>
            <div className="grid gap-3">
              {linkedFolders.map((linkedFolder) => (
                <Link key={linkedFolder.id} href={`/folders/${linkedFolder.id}`}>
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer">
                    <div
                      className={`p-2 rounded-lg ${linkedFolder.type === "learning" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}
                    >
                      {linkedFolder.type === "learning" ? (
                        <BookOpen className="w-4 h-4" />
                      ) : (
                        <Code className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-medium">{linkedFolder.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-3xl font-bold">{folder.daysLogged}</p>
              <p className="text-sm text-muted-foreground">Days Logged</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-3xl font-bold">{posts.reduce((acc, p) => acc + (p.likes || 0), 0)}</p>
              <p className="text-sm text-muted-foreground">Total Likes</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-3xl font-bold">{posts.reduce((acc, p) => acc + (p.comments || 0), 0)}</p>
              <p className="text-sm text-muted-foreground">Comments</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
