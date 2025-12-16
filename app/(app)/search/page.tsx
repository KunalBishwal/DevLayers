"use client"

import { useState, useCallback } from "react" // Removed useEffect for debounce
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FolderCard } from "@/components/devlayers/folder-card"
import { PostCard } from "@/components/devlayers/post-card"
import { cn } from "@/app/lib/utils"
import { Search, TrendingUp, Clock, X, FolderOpen, FileText, Users, Hash, Loader2, AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

// Import your API function and Types
import { searchContent } from "../../lib/api/search_api" 
import type { SearchResponse, Post } from "../../lib/api/search_api"

// ---------- Constants ----------

const recentSearches = ["react hooks", "typescript generics", "rust ownership", "nextjs app router"]

const trendingSearches = [
  { query: "AI integration", count: "2.4k searches" },
  { query: "React 19", count: "1.8k searches" },
  { query: "Rust learning", count: "1.2k searches" },
  { query: "System design", count: "980 searches" },
]

const popularTags = [
  "react", "typescript", "nextjs", "rust", "ai", 
  "design-system", "saas", "learning", "webdev", "frontend"
]

// ---------- Component ----------

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [recentSearchList, setRecentSearchList] = useState(recentSearches)
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [results, setResults] = useState<SearchResponse>({
    query: "",
    folders: [],
    users: [],
    posts: []
  })

  // Renamed to executeSearch to clarify it's the action trigger
  const executeSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const data = await searchContent(searchQuery)
      setResults(data)

      if (!recentSearchList.includes(searchQuery)) {
        setRecentSearchList((prev) => [searchQuery, ...prev.slice(0, 4)])
      }
    } catch (err) {
      console.error(err)
      setError("Failed to fetch results. Please try again.")
      setResults({ query: searchQuery, folders: [], users: [], posts: [] })
    } finally {
      setIsLoading(false)
    }
  }, [recentSearchList])

  // Handles clicking on tags/recent/trending
  const handleQuickSearch = (term: string) => {
    setQuery(term)
    executeSearch(term)
  }

  // Handles manual clear
  const handleClear = () => {
    setQuery("")
    setHasSearched(false)
    setResults({ query: "", folders: [], users: [], posts: [] })
  }

  const clearRecent = (search: string) => {
    setRecentSearchList((prev) => prev.filter((s) => s !== search))
  }

  // Helper: Author
  const getAuthorForPost = (authorId: number) => {
    const user = results.users.find(u => u.id === authorId)
    return user 
      ? { name: user.name, username: user.name.toLowerCase().replace(/\s/g, ''), avatar: user.profile_photo_url }
      : { name: "Unknown User", username: "unknown", avatar: "" }
  }

  // Helper: Format Links for PostCard
  const getFormattedLinks = (post: Post) => {
    if (!post.links) return []
    return post.links.map(link => ({
      label: link.label || "External Link",
      url: link.url
    }))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Search Input Section */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Search</h1>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search folders, posts, users, and tags..."
              className="pl-12 h-14 text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              // Trigger search ONLY on Enter
              onKeyDown={(e) => e.key === "Enter" && executeSearch(query)}
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={handleClear}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          {/* Explicit Search Button */}
          <Button 
            className="h-14 px-8 text-lg" 
            onClick={() => executeSearch(query)}
            disabled={!query.trim() || isLoading}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
          </Button>
        </div>
      </div>

      {!hasSearched ? (
        /* Initial State */
        <div className="space-y-8">
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
                    <span onClick={() => handleQuickSearch(search)}>{search}</span>
                    <button onClick={(e) => { e.stopPropagation(); clearRecent(search) }} className="p-0.5 rounded hover:bg-background/50">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Trending Searches</span>
            </div>
            <div className="space-y-2">
              {trendingSearches.map((item, index) => (
                <button
                  key={item.query}
                  onClick={() => handleQuickSearch(item.query)}
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
                  onClick={() => handleQuickSearch(`#${tag}`)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Results State */
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p>Searching for "{query}"...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-destructive">
               <AlertCircle className="w-8 h-8" />
               <p>{error}</p>
               <Button variant="outline" onClick={() => executeSearch(query)}>Try Again</Button>
            </div>
          ) : (
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Results</TabsTrigger>
                <TabsTrigger value="folders" className="gap-2"><FolderOpen className="w-4 h-4" /> Folders ({results.folders.length})</TabsTrigger>
                <TabsTrigger value="posts" className="gap-2"><FileText className="w-4 h-4" /> Posts ({results.posts.length})</TabsTrigger>
                <TabsTrigger value="users" className="gap-2"><Users className="w-4 h-4" /> Users ({results.users.length})</TabsTrigger>
              </TabsList>

              {results.folders.length === 0 && results.posts.length === 0 && results.users.length === 0 && (
                 <div className="text-center py-12 text-muted-foreground">
                    <p>No results found for "{results.query}".</p>
                    <Button variant="link" onClick={handleClear} className="mt-2">Clear search</Button>
                 </div>
              )}

              {/* === ALL RESULTS TAB === */}
              <TabsContent value="all" className="mt-6 space-y-8">
                {/* Users */}
                {results.users.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><Users className="w-4 h-4" /> Users</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {results.users.map((user) => (
                        <Link key={user.id} href={`/profile/${user.id}`} >
                          <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={user.profile_photo_url || "/placeholder.svg"} alt={user.name} />
                                <AvatarFallback className="bg-primary/10 text-primary">{user.name.toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">@{user.name.toLowerCase().replace(/\s/g, '')}</p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Folders */}
                {results.folders.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><FolderOpen className="w-4 h-4" /> Folders</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {results.folders.map((folder) => (
                        <Link key={folder.id} href={`/folders/${folder.id}`}>
                          <FolderCard 
                             id={folder.id.toString()}
                             title={folder.name}
                             description={folder.description}
                             isPublic={folder.visibility === 'public'}
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Posts */}
                {results.posts.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4" /> Posts</h3>
                    <div className="space-y-4">
                      {results.posts.map((post) => (
                        <PostCard 
                          key={post.id} 
                          day={1}
                          title={post.title}
                          content={post.body}
                          author={getAuthorForPost(post.author_id)}
                          date={new Date(post.created_at).toLocaleDateString()}
                          
                          links={getFormattedLinks(post)}
                          hasImage={post.images && post.images.length > 0}
                          imageUrl={post.images?.[0]?.url}
                          tags={Array.isArray(post.tags) ? post.tags : [post.tags]}
                          
                          likes={0} 
                          comments={0}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* === FOLDERS TAB === */}
              <TabsContent value="folders" className="mt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {results.folders.map((folder) => (
                     <Link key={folder.id} href={`/folders/${folder.id}`}>
                        <FolderCard 
                             id={folder.id.toString()}
                             title={folder.name}
                             description={folder.description}
                             isPublic={folder.visibility === 'public'}
                        />
                     </Link>
                  ))}
                </div>
              </TabsContent>

              {/* === POSTS TAB === */}
              <TabsContent value="posts" className="mt-6 space-y-4">
                {results.posts.map((post) => (
                    <PostCard 
                        key={post.id} 
                        day={1}
                        title={post.title}
                        content={post.body}
                        author={getAuthorForPost(post.author_id)}
                        date={new Date(post.created_at).toLocaleDateString()}
                        
                        links={getFormattedLinks(post)}
                        hasImage={post.images && post.images.length > 0}
                        imageUrl={post.images?.[0]?.url}
                        tags={Array.isArray(post.tags) ? post.tags : [post.tags]}
                        
                        likes={0} 
                        comments={0}
                    />
                ))}
              </TabsContent>

              {/* === USERS TAB === */}
              <TabsContent value="users" className="mt-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {results.users.map((user) => (
                    <Link key={user.id} href={`/profile/${user.id}`}>
                      <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={user.profile_photo_url || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">@{user.name.toLowerCase().replace(/\s/g, '')}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-3 bg-transparent">Follow</Button>
                      </div>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
    </div>
  )
}