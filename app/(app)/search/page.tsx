"use client"

import { useState, useCallback, useEffect } from "react"
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

// Import API function and Types
import { searchContent } from "../../lib/api/search_api" 
import type { SearchResponse, Post } from "../../lib/api/search_api"

const trendingSearches = [
  { query: "AI integration", count: "2.4k" },
  { query: "Research", count: "1.8k" },
  { query: "Rust learning", count: "1.2k" },
  { query: "System design", count: "980" },
]

const popularTags = [
  "react", "typescript", "nextjs", "rust", "ai", 
  "design-system", "saas", "learning", "webdev", "frontend"
]

const STORAGE_KEY = "devlayers_recent_searches"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [recentSearchList, setRecentSearchList] = useState<string[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [results, setResults] = useState<SearchResponse>({
    query: "",
    folders: [],
    users: [],
    posts: []
  })

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setRecentSearchList(JSON.parse(saved))
      } catch (e) { console.error(e) }
    }
  }, [])

  const updateRecentSearches = (searchTerm: string) => {
    if (!searchTerm.trim()) return
    setRecentSearchList((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== searchTerm.toLowerCase())
      const updated = [searchTerm, ...filtered].slice(0, 5)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const executeSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const data = await searchContent(searchQuery)
      setResults(data)
      updateRecentSearches(searchQuery)
    } catch (err) {
      setError("Failed to fetch results. Please try again.")
      setResults({ query: searchQuery, folders: [], users: [], posts: [] })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleQuickSearch = (term: string) => {
    setQuery(term)
    executeSearch(term)
  }

  const handleClear = () => {
    setQuery("")
    setHasSearched(false)
    setResults({ query: "", folders: [], users: [], posts: [] })
  }

  const clearRecent = (search: string) => {
    const updated = recentSearchList.filter((s) => s !== search)
    setRecentSearchList(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const getPostLinks = (post: Post) => {
    return { links: post.links?.map(link => ({ label: link.label || "Link", url: link.url })) || [] }
  }

  return (
    <div className="min-h-screen bg-background sm:p-6 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-0 space-y-6 sm:space-y-8 pt-6 sm:pt-0">
        
        {/* Header & Search Bar */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">Search</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search folders, posts, tags..."
                className="pl-12 h-12 sm:h-14 text-base sm:text-lg bg-card border-border shadow-sm focus-visible:ring-primary/20"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && executeSearch(query)}
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <Button 
              className="h-12 sm:h-14 px-8 text-base font-semibold shadow-lg shadow-primary/20" 
              onClick={() => executeSearch(query)}
              disabled={!query.trim() || isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
            </Button>
          </div>
        </div>

        {!hasSearched ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Recent Searches */}
            {recentSearchList.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Recent</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearchList.map((search) => (
                    <Badge
                      key={search}
                      variant="secondary"
                      className="px-3 py-1.5 cursor-pointer hover:bg-secondary/80 transition-all gap-2 text-sm border-transparent hover:border-primary/20"
                    >
                      <span onClick={() => handleQuickSearch(search)}>{search}</span>
                      <X className="w-3 h-3 text-muted-foreground hover:text-destructive" onClick={() => clearRecent(search)} />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">Trending Now</span>
                </div>
                <div className="space-y-1">
                  {trendingSearches.map((item, index) => (
                    <button
                      key={item.query}
                      onClick={() => handleQuickSearch(item.query)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-card border border-transparent hover:border-border transition-all group text-left"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-mono text-muted-foreground/40 font-bold">{index + 1}</span>
                        <div>
                          <p className="font-medium group-hover:text-primary transition-colors">{item.query}</p>
                          <p className="text-[10px] text-muted-foreground">{item.count} searches</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Tags */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider">Popular Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="px-3 py-1.5 cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all rounded-full text-xs"
                      onClick={() => handleQuickSearch(`#${tag}`)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="relative">
                   <Loader2 className="w-12 h-12 animate-spin text-primary" />
                   <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
                </div>
                <p className="text-muted-foreground font-medium">Sifting through the cosmos...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in zoom-in-95">
                 <div className="p-4 rounded-full bg-destructive/10">
                    <AlertCircle className="w-10 h-10 text-destructive" />
                 </div>
                 <div className="space-y-1">
                    <p className="font-bold text-lg">Search encountered a snag</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                 </div>
                 <Button variant="outline" onClick={() => executeSearch(query)} className="rounded-full">Try Again</Button>
              </div>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                {/* Responsive Scrollable Tab List */}
                <div className="overflow-x-auto pb-2 scrollbar-hide">
                  <TabsList className="w-max sm:w-full inline-flex justify-start sm:justify-center bg-muted/50 p-1 border border-border/50">
                    <TabsTrigger value="all" className="px-5">All</TabsTrigger>
                    <TabsTrigger value="folders" className="gap-2 px-5">
                       <FolderOpen className="w-3.5 h-3.5" /> Folders <span className="text-[10px] opacity-60">({results.folders.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="posts" className="gap-2 px-5">
                       <FileText className="w-3.5 h-3.5" /> Posts <span className="text-[10px] opacity-60">({results.posts.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="users" className="gap-2 px-5">
                       <Users className="w-3.5 h-3.5" /> Users <span className="text-[10px] opacity-60">({results.users.length})</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Empty State */}
                {results.folders.length === 0 && results.posts.length === 0 && results.users.length === 0 && (
                   <div className="text-center py-24 border-2 border-dashed border-border rounded-3xl mt-6">
                      <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-muted-foreground font-medium">No results matched "{results.query}"</p>
                      <Button variant="link" onClick={handleClear} className="mt-2 text-primary">Clear and try again</Button>
                   </div>
                )}

                {/* Content Tabs */}
                <div className="mt-8">
                  {/* === ALL TAB === */}
                  <TabsContent value="all" className="space-y-10 focus-visible:ring-0">
                    {results.users.length > 0 && (
                      <section className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Users className="w-4 h-4" /> Top Users
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {results.users.slice(0, 3).map((user) => (
                            <Link key={user.id} href={`/profile/${user.id}`}>
                              <div className="p-4 rounded-2xl border bg-card hover:shadow-md transition-all group cursor-pointer">
                                <div className="flex items-center gap-4">
                                  <Avatar className="w-12 h-12 ring-2 ring-background group-hover:ring-primary/20 transition-all">
                                    <AvatarImage src={user.profile_photo_url || "/placeholder.svg"} />
                                    <AvatarFallback>{user.name.slice(0,2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="font-bold text-sm truncate">{user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">@{user.name.toLowerCase().replace(/\s/g, '')}</p>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </section>
                    )}

                    {results.folders.length > 0 && (
                      <section className="space-y-4">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <FolderOpen className="w-4 h-4" /> Relevant Folders
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {results.folders.map((folder) => (
                            <FolderCard 
                              key={folder.id} 
                              id={folder.id.toString()} 
                              title={folder.name} 
                              description={folder.description} 
                              isPublic={folder.visibility === 'public'} 
                            />
                          ))}
                        </div>
                      </section> 
                    )}

                    {results.posts.length > 0 && (
                      <section className="space-y-4 pb-12">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Latest Posts
                        </h3>
                        <div className="space-y-6">
                          {results.posts.map((post) => (
                            <PostCard 
                              key={post.id} 
                              id={post.id.toString()}
                              day={post.id}
                              title={post.title}
                              content={post.body}
                              author={{ name: post.author.name, avatar: post.author.profile_photo_url }}
                              date={new Date(post.created_at).toLocaleDateString()}
                              links={getPostLinks(post).links}
                              hasImage={post.images && post.images.length > 0}
                              imageUrl={post.images?.[0]?.url}
                              tags={Array.isArray(post.tags) ? post.tags : post.tags ? [post.tags] : []}
                              likes={post.likes_count}
                              dislikes={post.dislikes_count}
                              comments={post.comments_count}
                              folder_id={post.folder_id}
                              folder_name={post.folder_id ? "Go to Folder" : null} 
                            />
                          ))}
                        </div>
                      </section>
                    )}
                  </TabsContent>

                  {/* === OTHER TABS === */}
                  <TabsContent value="folders" className="focus-visible:ring-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {results.folders.map((folder) => (
                         <FolderCard key={folder.id} id={folder.id.toString()} title={folder.name} description={folder.description} isPublic={folder.visibility === 'public'} />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="posts" className="space-y-6 focus-visible:ring-0">
                    {results.posts.map((post) => (
                      <PostCard 
                        key={post.id} 
                        id={post.id.toString()}
                        day={1}
                        title={post.title}
                        content={post.body}
                        author={{ name: post.author.name, avatar: post.author.profile_photo_url }}
                        date={new Date(post.created_at).toLocaleDateString()}
                        links={getPostLinks(post).links}
                        hasImage={post.images && post.images.length > 0}
                        imageUrl={post.images?.[0]?.url}
                        tags={Array.isArray(post.tags) ? post.tags : post.tags ? [post.tags] : []}
                        likes={post.likes_count}
                        comments={post.comments_count}
                        folder_id={post.folder_id}
                        folder_name={post.folder_id ? "Go to Folder" : null}
                      />
                    ))}
                  </TabsContent>

                  <TabsContent value="users" className="focus-visible:ring-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {results.users.map((user) => (
                        <Link key={user.id} href={`/profile/${user.id}`}>
                          <div className="p-5 rounded-2xl border bg-card hover:border-primary/40 transition-all flex flex-col items-center text-center space-y-3">
                            <Avatar className="w-16 h-16">
                              <AvatarImage src={user.profile_photo_url || "/placeholder.svg"} />
                              <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold">{user.name}</p>
                              <p className="text-xs text-muted-foreground">@{user.name.toLowerCase().replace(/\s/g, '')}</p>
                            </div>
                            <Button variant="outline" size="sm" className="w-full rounded-xl">View Profile</Button>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </div>
        )}
      </div>
    </div>
  )
}