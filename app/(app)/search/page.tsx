"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FolderCard } from "@/components/devlayers/folder-card"
import { PostCard } from "@/components/devlayers/post-card"
import { cn } from "@/app/lib/utils"
import { Search, TrendingUp, Clock, X, FolderOpen, FileText, Users, Hash } from "lucide-react"
import Link from "next/link"

const recentSearches = ["react hooks", "typescript generics", "rust ownership", "nextjs app router"]

const trendingSearches = [
  { query: "AI integration", count: "2.4k searches" },
  { query: "React 19", count: "1.8k searches" },
  { query: "Rust learning", count: "1.2k searches" },
  { query: "System design", count: "980 searches" },
]

const mockUsers = [
  { name: "Priya Sharma", username: "priyasharma", avatar: "/indian-woman-developer-priya.jpg", followers: 1234, folders: 8 },
  { name: "Vikram Reddy", username: "vikramreddy", avatar: "/indian-man-developer-vikram.jpg", followers: 892, folders: 12 },
  { name: "Ananya Krishnan", username: "ananyak", avatar: "/indian-woman-tech-professional-ananya.jpg", followers: 567, folders: 5 },
]

const mockFolders = [
  {
    id: "1",
    title: "Learning React Hooks",
    description: "Deep dive into React hooks patterns and best practices.",
    type: "learning" as const,
    daysLogged: 45,
    totalDays: 100,
    isPublic: true,
    lastUpdated: "2 hours ago",
  },
  {
    id: "2",
    title: "TypeScript Mastery",
    description: "From basics to advanced TypeScript patterns.",
    type: "learning" as const,
    daysLogged: 30,
    totalDays: 60,
    isPublic: true,
    lastUpdated: "Yesterday",
  },
]

const mockPosts = [
  {
    id: "1",
    day: 45,
    title: "Understanding React's useCallback and useMemo",
    content:
      "Today I finally grasped the difference between useCallback and useMemo. The key insight is that useCallback memoizes the function itself...",
    author: { name: "Priya Sharma", username: "priyasharma", avatar: "/indian-woman-developer-priya.jpg" },
    date: "2 hours ago",
    likes: 89,
    comments: 12,
    tags: ["react", "hooks", "performance"],
  },
]

const popularTags = [
  "react",
  "typescript",
  "nextjs",
  "rust",
  "ai",
  "design-system",
  "saas",
  "learning",
  "webdev",
  "frontend",
]

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [recentSearchList, setRecentSearchList] = useState(recentSearches)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    setHasSearched(true)
    if (!recentSearchList.includes(searchQuery)) {
      setRecentSearchList((prev) => [searchQuery, ...prev.slice(0, 4)])
    }
  }

  const clearRecent = (search: string) => {
    setRecentSearchList((prev) => prev.filter((s) => s !== search))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Search header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Search</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search folders, posts, users, and tags..."
            className="pl-12 h-14 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => {
                setQuery("")
                setHasSearched(false)
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {!hasSearched ? (
        /* Initial state - show recent and trending */
        <div className="space-y-8">
          {/* Recent searches */}
          {recentSearchList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Recent Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearchList.map((search) => (
                  <Badge
                    key={search}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/20 transition-colors gap-2 pr-1"
                  >
                    <span onClick={() => handleSearch(search)}>{search}</span>
                    <button onClick={() => clearRecent(search)} className="p-0.5 rounded hover:bg-background/50">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Trending searches */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Trending Searches</span>
            </div>
            <div className="space-y-2">
              {trendingSearches.map((item, index) => (
                <button
                  key={item.query}
                  onClick={() => handleSearch(item.query)}
                  className={cn(
                    "w-full flex items-center gap-4 p-3 rounded-lg",
                    "hover:bg-secondary transition-colors text-left",
                  )}
                >
                  <span className="text-2xl font-bold text-muted-foreground/50 w-8">{index + 1}</span>
                  <div>
                    <p className="font-medium">{item.query}</p>
                    <p className="text-sm text-muted-foreground">{item.count}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Popular tags */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Hash className="w-4 h-4" />
              <span className="text-sm font-medium">Popular Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/20 hover:border-primary/30 transition-colors"
                  onClick={() => handleSearch(`#${tag}`)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Search results */
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              All Results
            </TabsTrigger>
            <TabsTrigger value="folders" className="gap-2">
              <FolderOpen className="w-4 h-4" />
              Folders
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-2">
              <FileText className="w-4 h-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6 space-y-8">
            {/* Users section */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {mockUsers.map((user) => (
                  <Link key={user.username} href={`/profile/${user.username}`}>
                    <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                        <span>{user.followers} followers</span>
                        <span>{user.folders} folders</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Folders section */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Folders
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {mockFolders.map((folder) => (
                  <Link key={folder.id} href={`/folders/${folder.id}`}>
                    <FolderCard {...folder} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Posts section */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Posts
              </h3>
              <div className="space-y-4">
                {mockPosts.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="folders" className="mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {mockFolders.map((folder) => (
                <Link key={folder.id} href={`/folders/${folder.id}`}>
                  <FolderCard {...folder} />
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="posts" className="mt-6 space-y-4">
            {mockPosts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="grid md:grid-cols-3 gap-4">
              {mockUsers.map((user) => (
                <Link key={user.username} href={`/profile/${user.username}`}>
                  <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                      <span>{user.followers} followers</span>
                      <span>{user.folders} folders</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3 bg-transparent">
                      Follow
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
