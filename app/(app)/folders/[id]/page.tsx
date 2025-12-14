"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

// Icons & UI
import { Timeline } from "@/components/devlayers/timeline"
import { DaySelector } from "@/components/devlayers/day-selector"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Share2, MoreHorizontal, Globe, Plus, Code, ArrowLeft, Lock, Loader2 } from "lucide-react"

// Logic 
import { 
  fetchUserProfile, 
  fetchUserFolders, 
  getFolderPosts, 
  Folder, 
  APIPost 
} from "../../../lib/api/user_api"

export default function FolderPage() {
  const params = useParams()
  const router = useRouter()
  const folderId = params.id as string

  // --- State ---
  const [folder, setFolder] = useState<Folder | null>(null)
  const [posts, setPosts] = useState<any[]>([]) 
  const [loading, setLoading] = useState(true)
  const [currentDay, setCurrentDay] = useState(1)

  // --- Fetch Data ---
  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token")
      
      if (!token) {
        router.push("/login")
        return
      }

      try {
        setLoading(true)

        // 1. Get User Profile 
        const userProfile = await fetchUserProfile(token)
        
        if (!userProfile) {
          router.push("/login")
          return
        }

        // 2. Parallel Fetch
        // We cast apiResponse to 'any' because the API signature says APIPost[] 
        // but the runtime result is actually { posts: [...] }
        const [allFolders, apiResponse] = await Promise.all([
          fetchUserFolders(userProfile.id, token),
          getFolderPosts(token, folderId) as Promise<any> 
        ])

        // 3. Find current folder details
        const currentFolder = allFolders.find(f => f.id == Number(folderId))

        if (!currentFolder) {
          // Optional: You could fetch the folder name from apiResponse.folder_name if not found here
          console.error("Folder not found in user's list")
          router.push("/dashboard")
          return
        }

        setFolder(currentFolder)

        // --- FIX: Handle Object Response vs Array Response ---
        let validPosts: APIPost[] = []
        
        // Check if response is { posts: [...] } (The structure shown in your logs)
        if (apiResponse && typeof apiResponse === 'object' && Array.isArray(apiResponse.posts)) {
            validPosts = apiResponse.posts
        } 
        // Fallback: Check if response is just [...] (Direct array)
        else if (Array.isArray(apiResponse)) {
            validPosts = apiResponse
        } 
        else {
            console.warn("API returned unexpected structure:", apiResponse)
            validPosts = [] 
        }

        // 4. Transform API Posts to UI Format
        const uiPosts = validPosts.map((p: APIPost, index: number) => ({
          id: p.id.toString(),
          day: validPosts.length - index, 
          title: p.title,
          content: p.body, 
          date: new Date(p.created_at).toLocaleDateString(),
          imageUrl: p.images && p.images.length > 0 ? p.images[0].url : undefined,
          hasImage: p.images && p.images.length > 0,
          author: { name: userProfile.name, avatar: userProfile.profile_photo_url || "" }, 
          likes: 0,
          comments: 0,
          tags: []
        }))

        setPosts(uiPosts)
        setCurrentDay(uiPosts.length > 0 ? uiPosts.length : 1)

      } catch (error) {
        console.error("Failed to load folder page", error)
      } finally {
        setLoading(false)
      }
    }

    if (folderId) {
      load()
    }
  }, [folderId, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!folder) return null

  const isProject = folder.name.toLowerCase().includes("project") 
  const FolderIcon = isProject ? Code : BookOpen
  const typeColor = isProject ? "text-accent bg-accent/10" : "text-primary bg-primary/10"
  
  const daysLogged = posts.length
  const totalDays = 100 
  const progressPercent = Math.min((daysLogged / totalDays) * 100, 100)

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
            <div className={`p-3 rounded-xl ${typeColor}`}>
              <FolderIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{folder.name}</h1>
                {folder.visibility === "public" ? (
                  <Badge variant="outline" className="gap-1">
                    <Globe className="w-3 h-3" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="w-3 h-3" />
                    Private
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {daysLogged} days logged
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed">
            {folder.description || "No description provided."}
        </p>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {daysLogged} / {totalDays} days
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isProject ? "bg-accent" : "bg-primary"}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <DaySelector totalDays={daysLogged} currentDay={currentDay} onDayChange={setCurrentDay} />
            
            <Link href={`/create?folderId=${folderId}`}>
              <Button size="sm" className="gap-2 glow-sm press-effect">
                <Plus className="w-4 h-4" />
                New Post
              </Button>
            </Link>
          </div>

          {posts.length > 0 ? (
             <Timeline posts={posts} />
          ) : (
             <div className="text-center py-12 border border-dashed rounded-xl">
                <p className="text-muted-foreground mb-4">No posts yet in this folder.</p>
                <Link href={`/create?folderId=${folderId}`}>
                    <Button variant="outline">Document Day 1</Button>
                </Link>
             </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Visual Timeline</h3>
            <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
              {Array.from({ length: totalDays }, (_, i) => {
                const day = i + 1
                const isLogged = day <= daysLogged
                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-mono transition-all cursor-default ${
                       isLogged
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {day}
                  </div>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-3xl font-bold">{daysLogged}</p>
              <p className="text-sm text-muted-foreground">Days Logged</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Total Likes</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Comments</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}