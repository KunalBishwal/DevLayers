"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  fetchUserPosts, 
  fetchUserFolders, 
  fetchUserProfile, 
  APIPost 
} from "../../lib/api/user_api"

import { 
  Folder, 
  Lock, 
  Link as LinkIcon, 
  Search,
  LayoutGrid, 
  List, 
  GitCommit, 
  ArrowUpRight,
  RefreshCcw,
  Pencil,
  Trash2
} from "lucide-react"

import { EditPostDialog } from "@/components/devlayers/EditPostDialog"
import { ConfirmModal } from "@/components/devlayers/delete_confirmation_widget"

//for updating posts
import { updatePost, UpdatePostData } from "../../lib/api/update_api"
import { delete_post } from "../../lib/api/delete_api"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// --- TYPES ---
interface PostWithFolder extends APIPost {
  folder_name?: string
}

interface CacheData {
  posts: PostWithFolder[]
  timestamp: number
}

const CACHE_KEY = "user_timeline_cache"
const CACHE_DURATION = 120 * 60 * 1000 

export default function UserPostsFeed() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // --- Edit State ---
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  
  // --- Delete State ---
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Expanded Form State
  const [editForm, setEditForm] = useState<UpdatePostData>({
    title: "",
    body: "",
    visibility: "public",
    tags: "",
    img_url: "",
    links: [] 
  })

  // Function to process and sort data
  const processPosts = (rawPosts: APIPost[], folderMap: Record<number, string>) => {
    return rawPosts.map(post => ({
      ...post,
      folder_name: post.folder_id ? folderMap[post.folder_id] : undefined
    })).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  // Main Load Function
  async function loadData(forceRefresh = false) {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      if (forceRefresh) setIsRefreshing(true)
      
      if (!forceRefresh) {
        const cachedRaw = localStorage.getItem(CACHE_KEY)
        if (cachedRaw) {
          const { posts: cachedPosts, timestamp } = JSON.parse(cachedRaw) as CacheData
          const isFresh = Date.now() - timestamp < CACHE_DURATION

          if (isFresh) {
            console.log("Loading from Cache")
            setPosts(cachedPosts)
            setLoading(false)
            return 
          }
        }
      }

      const profile = await fetchUserProfile(token)
      if (profile) {
        const [postsData, foldersData] = await Promise.all([
          fetchUserPosts(token),
          fetchUserFolders(profile.id, token)
        ])

        const folderMap: Record<number, string> = {}
        foldersData.forEach(f => { folderMap[f.id] = f.name })

        const enrichedPosts = processPosts(postsData, folderMap)
        setPosts(enrichedPosts)

        const cacheData: CacheData = {
          posts: enrichedPosts,
          timestamp: Date.now()
        }
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
      }
    } catch (err) {
      console.error("Failed to load data", err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleManualRefresh = () => {
    loadData(true)
  }

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.tags && post.tags.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (post.folder_name && post.folder_name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

    const handleSavePost = async () => {
      if (!editingPostId) return
      const token = localStorage.getItem("token")
      if (!token) return
  
      try {
        setIsSaving(true)
        
        const cleanData = {
          ...editForm,
          links: editForm.links?.filter(l => l.label.trim() !== "" && l.url.trim() !== "")
        }
  
        const updatedPostData = await updatePost(token, editingPostId, cleanData)
  
        // Optimistic Update
        setPosts((prevPosts) => 
          prevPosts.map((p) => {
            if (p.id === editingPostId) {
              const newTags = typeof editForm.tags === 'string' 
                ? editForm.tags.split(',').map(t => t.trim()).filter(Boolean)
                : []
  
              // Create new images array for optimistic update if img_url changed
              const newImages = editForm.img_url 
                ? [{ id: 0, url: editForm.img_url }] 
                : p.images;

              return { 
                  ...p, 
                  title: updatedPostData.title || editForm.title, 
                  body: updatedPostData.body || editForm.body, // Ensure body is updated
                  content: updatedPostData.body || editForm.body, // Update content fallback too
                  tags: newTags,
                  links: updatedPostData.links || cleanData.links, 
                  rawVisibility: editForm.visibility,
                  images: newImages, // Update images
                  imageUrl: editForm.img_url,
                  hasImage: !!editForm.img_url
                } 
            }
            return p
          })
        )
  
        setIsEditOpen(false)
        setEditingPostId(null)
      } catch (error) {
        console.error("Failed to update post:", error)
        alert("Failed to update post.")
      } finally {
        setIsSaving(false)
        loadData(true) // Refresh data to sync with server
      }
    }
    
  // --- CORRECTED EDIT CLICK HANDLER ---
  const handleEditClick = (post: any) => {
    setEditingPostId(post.id)
    setEditForm({
      title: post.title || "",
      // Fix: Access 'body' (the main content) instead of 'content'
      body: post.body || post.content || "", 
      visibility: post.rawVisibility || "public",
      tags: Array.isArray(post.tags) ? post.tags.join(", ") : (post.tags || ""),
      // Fix: Access the first image from the array
      img_url: (post.images && post.images.length > 0) ? post.images[0].url : "",
      links: post.links ? [...post.links] : []
    })
    setIsEditOpen(true)
  }

  // Helper to add a new empty link row
  const addLinkRow = () => {
    setEditForm(prev => ({
      ...prev,
      links: [...(prev.links || []), { label: "", url: "" }]
    }))
  }

  // Helper to remove a link row
  const removeLinkRow = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      links: (prev.links || []).filter((_, i) => i !== index)
    }))
  }

  // Helper to update a specific link row
  const updateLinkRow = (index: number, field: "label" | "url", value: string) => {
    setEditForm(prev => {
      const newLinks = [...(prev.links || [])]
      newLinks[index] = { ...newLinks[index], [field]: value }
      return { ...prev, links: newLinks }
    })
  }

  // --- Delete Handler ---
  const handleDeleteClick = (postId: string) => {
    setDeletingPostId(postId)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingPostId) return
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      setIsDeleting(true)
      const postIdNumber = Number(deletingPostId)
      const result = await delete_post(token, postIdNumber)
      
      if (result) {
        // Remove post from state
        setPosts((prevPosts) => prevPosts.filter(p => p.id !== deletingPostId))
        // Clear cache to sync with server
        localStorage.removeItem(CACHE_KEY)
        setIsDeleteOpen(false)
        setDeletingPostId(null)
      }
    } catch (error) {
      console.error("Failed to delete post:", error)
      alert("Failed to delete post.")
    } finally {
      setIsDeleting(false)
      loadData(true) // Refresh data to sync with server
    }
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Timeline</h1>
          <div className="flex items-center gap-2 mt-1">
             <p className="text-muted-foreground text-sm">
               {posts.length} updates across all projects.
             </p>
             <button 
               onClick={handleManualRefresh}
               className={`text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
               title="Force refresh data"
             >
               <RefreshCcw className="w-3 h-3" /> 
             </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
               placeholder="Search Your posts, tags, folders..."
               className="pl-9 h-9 bg-background"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
           <Link href="/create">
            <Button size="sm" className="h-9 px-4 shadow-sm">
              Create
            </Button>
           </Link>
        </div>
      </div>

      {/* View Tabs */}
      <Tabs defaultValue="timeline" className="w-full">
        <div className="border-b pb-0 mb-6">
          <TabsList className="bg-transparent p-0 h-auto space-x-6">
            <TabsTrigger 
              value="timeline" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-2 pb-2"
            >
              <GitCommit className="w-4 h-4 mr-2" /> Timeline
            </TabsTrigger>
            <TabsTrigger 
              value="grid" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-2 pb-2"
            >
              <LayoutGrid className="w-4 h-4 mr-2" /> Grid
            </TabsTrigger>
            <TabsTrigger 
              value="list" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-2 pb-2"
            >
              <List className="w-4 h-4 mr-2" /> List
            </TabsTrigger>
          </TabsList>
        </div>

        {/* --- VIEW 1: TIMELINE --- */}
        <TabsContent value="timeline" className="space-y-8 animate-in fade-in-50 duration-300">
        {filteredPosts.length > 0 ? (
             <TimelineView posts={filteredPosts} onEdit={handleEditClick} onDelete={handleDeleteClick} />
           ) : <EmptyState />}
        </TabsContent>

        {/* --- VIEW 2: GRID --- */}
        <TabsContent value="grid" className="animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPosts.map(post => (
                <GridCard key={post.id} post={post} onEdit={handleEditClick} onDelete={handleDeleteClick} />
            ))}
          </div>
        </TabsContent>

        {/* --- VIEW 3: LIST --- */}
        <TabsContent value="list" className="animate-in fade-in-50 duration-300">
          <div className="border rounded-xl bg-card overflow-hidden">
             {filteredPosts.map((post, i) => (
                <ListRow 
                    key={post.id} 
                    post={post} 
                    isLast={i === filteredPosts.length - 1} 
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                />
             ))}
          </div>
        </TabsContent>
      </Tabs>


      {/* --- EDIT POST MODAL --- */}
      <EditPostDialog
        isEditOpen={isEditOpen}
        setIsEditOpen={setIsEditOpen}
        editForm={editForm}
        setEditForm={setEditForm} // This works because UpdatePostData matches EditFormType structure
        isSaving={isSaving}
        handleSavePost={handleSavePost}
        addLinkRow={addLinkRow}
        updateLinkRow={updateLinkRow}
        removeLinkRow={removeLinkRow}
      />

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}

// ==========================================
// 1. TIMELINE VIEW COMPONENT (FIXED)
// ==========================================
function TimelineView({ posts, onEdit, onDelete }: { posts: PostWithFolder[], onEdit: (post: any) => void, onDelete: (postId: string) => void }) {
  // Group posts by Date
  const grouped = posts.reduce((acc, post) => {
    const date = new Date(post.created_at).toLocaleDateString("en-US", { 
      weekday: 'short', month: 'short', day: 'numeric' 
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(post)
    return acc
  }, {} as Record<string, PostWithFolder[]>)

  return (
<div className="relative border-l border-border ml-3 space-y-12 pb-12">
  {Object.entries(grouped).map(([date, dayPosts]) => (
    <div key={date} className="relative pl-8">
      {/* Timeline dot */}
      <span className="absolute -left-[6px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />

      {/* Date */}
      <h3 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">
        {date}
      </h3>

      <div className="space-y-8">
        {dayPosts.map((post) => (
          <div
            key={post.id}
            className="group relative bg-card border rounded-2xl overflow-hidden transition hover:shadow-md"
          >
            {/* Edit button */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition z-10 flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-background/70 backdrop-blur-md"
                onClick={() => onEdit(post)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-background/70 backdrop-blur-md text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(post.id.toString())}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Image – FULL WIDTH */}
            {post.images && post.images.length > 0 && (
              <div className="w-full h-72 sm:h-96 bg-muted overflow-hidden">
                <img
                  src={post.images[0].url}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {post.folder_name && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 gap-1"
                  >
                    <Folder className="w-3 h-3" />
                    {post.folder_name}
                  </Badge>
                )}

                <span>
                  {new Date(post.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Title */}
              <h4 className="text-xl font-semibold leading-snug text-foreground">
                {post.title}
              </h4>

              {/* Body */}
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {post.body}
              </p>

              {/* Tags */}
              {post.tags && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {(Array.isArray(post.tags)
                    ? post.tags
                    : post.tags.split(",")
                  ).map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Links */}
              {post.links && post.links.length > 0 && (
                <div className="pt-4 border-t space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Resources
                  </p>

                  <div className="flex flex-col gap-2">
                    {post.links.map((l) => (
                      <a
                        key={l.id}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                      >
                        <LinkIcon className="w-4 h-4" />
                        {l.label || l.url}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  ))}
</div>

  )
}

// ==========================================
// 2. CLEAN LIST ROW COMPONENT
// ==========================================
function ListRow({ post, isLast, onEdit, onDelete }: { post: PostWithFolder, isLast: boolean, onEdit: (post: any) => void, onDelete: (postId: string) => void }) {
    return (
        <div className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group ${!isLast ? 'border-b' : ''}`}>
            
            <div className="w-24 text-xs text-muted-foreground shrink-0 text-right">
                <div className="font-medium text-foreground">{new Date(post.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</div>
                <div>{new Date(post.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
            </div>

            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                {post.folder_id ? <Folder className="w-4 h-4 text-blue-500" /> : <GitCommit className="w-4 h-4 text-gray-500" />}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium truncate text-sm">{post.title}</span>
                    {post.folder_name && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 truncate max-w-[100px]">
                            {post.folder_name}
                        </span>
                    )}
                    {post.visibility === 'private' && <Lock className="w-3 h-3 text-muted-foreground" />}
                </div>
                <div className="text-xs text-muted-foreground truncate max-w-lg mt-0.5">
                    {post.body}
                </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => onEdit(post)}
                >
                    <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(post.id.toString())}
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    )
}

// ==========================================
// 3. GRID CARD COMPONENT
// ==========================================
function GridCard({ post, onEdit, onDelete }: { post: PostWithFolder, onEdit: (post: any) => void, onDelete: (postId: string) => void }) {
  return (
    <Card className="group relative overflow-hidden flex flex-col hover:shadow-md transition-all h-full border-muted-foreground/20">
      
      <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
         <Button 
            variant="secondary" 
            size="icon" 
            className="h-8 w-8 shadow-sm bg-background/80 backdrop-blur-sm"
            onClick={(e) => {
                e.preventDefault();
                onEdit(post);
            }}
         >
            <Pencil className="w-3.5 h-3.5" />
         </Button>
         <Button 
            variant="secondary" 
            size="icon" 
            className="h-8 w-8 shadow-sm bg-background/80 backdrop-blur-sm text-destructive hover:bg-destructive/10"
            onClick={(e) => {
                e.preventDefault();
                onDelete(post.id.toString());
            }}
         >
            <Trash2 className="w-3.5 h-3.5" />
         </Button>
      </div>

      {post.images && post.images.length > 0 && (
        <div className="h-40 w-full overflow-hidden bg-muted">
          <img 
            src={post.images[0].url} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
                {post.folder_name ? (
                     <Badge variant="outline" className="font-normal text-xs text-blue-600 bg-blue-50 border-blue-100">{post.folder_name}</Badge>
                ) : (
                     <Badge variant="secondary" className="font-normal text-xs">Standalone</Badge>
                )}
            </div>
            {post.visibility === 'private' && <Lock className="w-3 h-3 text-muted-foreground" />}
        </div>
        
        <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{post.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">{post.body}</p>
        
        <div className="flex items-center justify-between pt-4 border-t mt-auto text-xs text-muted-foreground">
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
            {post.links && post.links.length > 0 && (
                <span className="flex items-center gap-1 text-blue-600"><LinkIcon className="w-3 h-3"/> {post.links.length}</span>
            )}
        </div>
      </div>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="space-y-6 ml-4 border-l pl-8">
        {[1, 2, 3].map(i => (
             <div key={i} className="space-y-2">
                 <Skeleton className="h-4 w-20 mb-2" />
                 <Skeleton className="h-32 w-full rounded-xl" />
             </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
      <p className="text-muted-foreground">No posts found.</p>
    </div>
  )
}