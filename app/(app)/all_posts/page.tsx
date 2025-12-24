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
  Search,
  LayoutGrid, 
  RefreshCcw,
} from "lucide-react"

// Components
import { EditPostDialog } from "@/components/devlayers/EditPostDialog"
import { ConfirmModal } from "@/components/devlayers/delete_confirmation_widget"
import { PostCard } from "@/components/devlayers/post-card" 

// API
import { updatePost, UpdatePostData } from "../../lib/api/update_api"
import { delete_post } from "../../lib/api/delete_api"

// UI
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

//context
import { useUser } from "@/context/user-context"

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
  const [posts, setPosts] = useState<PostWithFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const { user } = useUser()
  
  // --- Edit State ---
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  
  // --- Delete State ---
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [editForm, setEditForm] = useState<UpdatePostData>({
    title: "",
    body: "",
    visibility: "public",
    tags: "",
    img_url: "",
    links: [] 
  })

  const processPosts = (rawPosts: APIPost[], folderMap: Record<number, string>) => {
    return rawPosts.map(post => ({
      ...post,
      folder_name: post.folder_id ? folderMap[post.folder_id] : undefined
    })).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  async function loadData(forceRefresh = false) {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      if (forceRefresh) setIsRefreshing(true)
      
      if (!forceRefresh) {
        const cachedRaw = localStorage.getItem(CACHE_KEY)
        if (cachedRaw) {
          const { posts: cachedPosts, timestamp } = JSON.parse(cachedRaw) as CacheData
          if (Date.now() - timestamp < CACHE_DURATION) {
            setPosts(cachedPosts)
            setLoading(false)
            return 
          }
        }
      }

      const profile = await fetchUserProfile(token)
      setUserProfile(profile)

      if (profile) {
        const [postsData, foldersData] = await Promise.all([
          fetchUserPosts(token),
          fetchUserFolders(profile.id, token)
        ])

        const folderMap: Record<number, string> = {}
        foldersData.forEach(f => { folderMap[f.id] = f.name })

        const enrichedPosts = processPosts(postsData, folderMap)
        setPosts(enrichedPosts)

        localStorage.setItem(CACHE_KEY, JSON.stringify({ posts: enrichedPosts, timestamp: Date.now() }))
      }
    } catch (err) {
      console.error("Failed to load data", err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.tags && (Array.isArray(post.tags) ? post.tags.join(' ') : post.tags).toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleEditClick = (post: any) => {
    setEditingPostId(post.id.toString())
    setEditForm({
      title: post.title || "",
      body: post.body || post.content || "", 
      visibility: post.rawVisibility || post.visibility || "public",
      tags: Array.isArray(post.tags) ? post.tags.join(", ") : (post.tags || ""),
      img_url: (post.images && post.images.length > 0) ? post.images[0].url : "",
      links: post.links ? [...post.links] : []
    })
    setIsEditOpen(true)
  }

  const handleDeleteClick = (postId: string) => {
    setDeletingPostId(postId)
    setIsDeleteOpen(true)
  }

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

      await updatePost(token, editingPostId, cleanData)
      setIsEditOpen(false)
      loadData(true) 
    } catch (error) {
      console.error("Failed to update post:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingPostId) return
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      setIsDeleting(true)
      await delete_post(token, Number(deletingPostId))
      setPosts(prev => prev.filter(p => p.id.toString() !== deletingPostId))
      setIsDeleteOpen(false)
    } catch (error) {
      console.error("Failed to delete post:", error)
    } finally {
      setIsDeleting(false)
      loadData(true)
    }
  }

  // Helper Functions for EditForm
  const addLinkRow = () => setEditForm(prev => ({ ...prev, links: [...(prev.links || []), { label: "", url: "" }] }))
  const removeLinkRow = (index: number) => setEditForm(prev => ({ ...prev, links: (prev.links || []).filter((_, i) => i !== index) }))
  const updateLinkRow = (index: number, field: "label" | "url", value: string) => {
    setEditForm(prev => {
      const newLinks = [...(prev.links || [])]
      newLinks[index] = { ...newLinks[index], [field]: value }
      return { ...prev, links: newLinks }
    })
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Posts</h1>
          <div className="flex items-center gap-2 mt-1">
             <p className="text-muted-foreground text-sm">{posts.length} updates found.</p>
             <button onClick={() => loadData(true)} className={`${isRefreshing ? 'animate-spin' : ''}`}>
               <RefreshCcw className="w-3 h-3 text-blue-600" /> 
             </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
               placeholder="Search posts..."
               className="pl-9 h-9"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
           <Link href="/create"><Button size="sm">Create</Button></Link>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">

        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
            <PostCard
              key={post.id}
              id={post.id.toString()}
              day={post.id} 
              title={post.title}
              content={post.body}
              // Use the profile state we fetched in loadData
              author={{
                name: user?.name || "User",
                avatar: user?.profile_photo_url || ""
              }}
              date={new Date(post.created_at).toLocaleDateString()}
              
              // FIX: Better Tag Parsing
              tags={
                Array.isArray(post.tags) 
                  ? post.tags 
                  : typeof post.tags === 'string' && post.tags.trim() !== ""
                    ? post.tags.split(',').map(t => t.trim()) 
                    : []
              }
              
              likes={post.likes_count || 0}
              comments={post.comments_count || 0}
              views={post.views_count}
              dislikes={post.dislikes_count}
              
              // Image handling
              hasImage={post.images && post.images.length > 0}
              imageUrl={post.images?.[0]?.url}
              
              // Links handling
              links={post.links || []}

              // FIX: Action visibility
              showActions={true} 
              onEdit={() => handleEditClick(post)}
              onDelete={() => handleDeleteClick(post.id.toString())}
              folder_id={post.folder_id || null}
              folder_name={post.folder_name}
            />
            ))}
          </div>
          {filteredPosts.length === 0 && <EmptyState />}
        </TabsContent>
      </Tabs>

      <EditPostDialog
        isEditOpen={isEditOpen}
        setIsEditOpen={setIsEditOpen}
        editForm={editForm}
        setEditForm={setEditForm}
        isSaving={isSaving}
        handleSavePost={handleSavePost}
        addLinkRow={addLinkRow}
        updateLinkRow={updateLinkRow}
        removeLinkRow={removeLinkRow}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Post"
        description="This action cannot be undone."
      />
    </div>
  )
}

function LoadingSkeleton() {
    return <div className="p-6 max-w-5xl mx-auto space-y-8"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-3 gap-4"><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div></div>
}

function EmptyState() {
    return <div className="text-center py-20 border-2 border-dashed rounded-xl"><p className="text-muted-foreground">No posts found.</p></div>
}