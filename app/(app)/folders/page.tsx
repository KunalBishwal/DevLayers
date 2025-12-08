"use client"

import { FolderCard } from "@/components/devlayers/folder-card"
import { CreateFolderCard } from "@/components/devlayers/create-folder-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Grid3X3, List, SlidersHorizontal } from "lucide-react"
import { useState } from "react"

const mockFolders = [
  {
    id: "1",
    title: "Learning React",
    description: "Deep diving into React 19 features, hooks patterns, and server components.",
    type: "learning" as const,
    daysLogged: 23,
    totalDays: 100,
    isPublic: true,
    lastUpdated: "2 hours ago",
    hasRecentUpdate: true,
  },
  {
    id: "2",
    title: "SaaS Starter Kit",
    description: "Building a production-ready SaaS boilerplate with Next.js, Stripe, and Supabase.",
    type: "project" as const,
    daysLogged: 45,
    totalDays: 60,
    isPublic: false,
    lastUpdated: "Yesterday",
    hasRecentUpdate: false,
  },
  {
    id: "3",
    title: "Rust Journey",
    description: "Learning systems programming with Rust. From basics to advanced concepts.",
    type: "learning" as const,
    daysLogged: 12,
    totalDays: 100,
    isPublic: true,
    lastUpdated: "3 days ago",
    hasRecentUpdate: false,
  },
  {
    id: "4",
    title: "AI Chatbot Project",
    description: "Building an AI-powered customer support chatbot using OpenAI and LangChain.",
    type: "project" as const,
    daysLogged: 8,
    totalDays: 30,
    isPublic: true,
    lastUpdated: "1 week ago",
    hasRecentUpdate: true,
  },
  {
    id: "5",
    title: "TypeScript Mastery",
    description: "Advanced TypeScript patterns, generics, and type-level programming.",
    type: "learning" as const,
    daysLogged: 34,
    totalDays: 50,
    isPublic: true,
    lastUpdated: "2 weeks ago",
    hasRecentUpdate: false,
  },
]

export default function FoldersPage() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFolders = mockFolders.filter((folder) => {
    if (filter === "learning" && folder.type !== "learning") return false
    if (filter === "projects" && folder.type !== "project") return false
    if (searchQuery && !folder.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Folders</h1>
          <p className="text-muted-foreground mt-1">
            {mockFolders.length} folders · {mockFolders.reduce((acc, f) => acc + f.daysLogged, 0)} total days logged
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="learning">Learning</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </Button>
          <div className="flex items-center border border-border rounded-lg">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="w-8 h-8 rounded-r-none"
              onClick={() => setView("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              className="w-8 h-8 rounded-l-none"
              onClick={() => setView("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Folders grid */}
      <div
        className={
          view === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children" : "space-y-3 stagger-children"
        }
      >
        {filteredFolders.map((folder) => (
          <FolderCard key={folder.id} {...folder} onClick={() => {}} />
        ))}
        <CreateFolderCard onClick={() => {}} />
      </div>

      {filteredFolders.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No folders found matching your search.</p>
        </div>
      )}
    </div>
  )
}
