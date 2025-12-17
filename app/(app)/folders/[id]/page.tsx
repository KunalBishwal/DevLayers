"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

// Icons & UI
import { Timeline } from "@/components/devlayers/timeline"
import { DaySelector } from "@/components/devlayers/day-selector"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, Code, ArrowLeft, 
  Loader2, RefreshCcw, Folder as FolderIcon2
} from "lucide-react"
import { EditPostDialog } from "@/components/devlayers/EditPostDialog"
import { ConfirmModal } from "@/components/devlayers/delete_confirmation_widget"

// Logic 
import { 
  getFolderPosts, 
  Folder, 
  APIPost 
} from "../../../lib/api/user_api"

import { updatePost, UpdatePostData } from "../../../lib/api/update_api"
import { delete_post } from "../../../lib/api/delete_api"

// --- CACHE CONFIGURATION ---
const CACHE_DURATION = 120 * 60 * 1000 // 2 hours
// UPDATED PREFIX: This invalidates the old cache containing the wrong author info
const CACHE_PREFIX = "folder_view_v2_" 

interface CachedData {
  folder: Folder
  posts: any[]
  timestamp: number
  isOwner: boolean
}

export default function FolderPage() {
  const params = useParams()
  const router = useRouter()
  const folderId = params.id as string

  // --- State ---
  const [folder, setFolder] = useState<Folder | null>(null)
  const [posts, setPosts] = useState<any[]>([]) 
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentDay, setCurrentDay] = useState(1)
  const [isOwner, setIsOwner] = useState(false)
  const [isPublicView, setIsPublicView] = useState(false)

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

  // --- MAIN DATA LOADING FUNCTION ---
  const loadData = useCallback(async (forceRefresh = false) => {
    const token = localStorage.getItem("token")
    const isAuthenticated = !!token
    const cacheKey = `${CACHE_PREFIX}${folderId}_${isAuthenticated ? 'auth' : 'public'}`

    try {
      if (forceRefresh) {
        setIsRefreshing(true)
      } else {
        setLoading(true)
        // 1. CHECK CACHE
        const cachedRaw = localStorage.getItem(cacheKey)
        if (cachedRaw) {
          const cached: CachedData = JSON.parse(cachedRaw)
          const isFresh = Date.now() - cached.timestamp < CACHE_DURATION
          
          if (isFresh) {
            console.log("Loading folder from Cache (v2)")
            setFolder(cached.folder)
            setPosts(cached.posts)
            setIsOwner(cached.isOwner)
            setIsPublicView(!cached.isOwner)
            setCurrentDay(cached.posts.length > 0 ? cached.posts.length : 1)
            setLoading(false)
            return
          }
        }
      }

      // 2. FETCH FROM API
      const apiResponse = await getFolderPosts(token || "", folderId) as any
      
      if (!apiResponse) {
        console.error("No API response received")
        setLoading(false)
        return
      }

      // --- EXTRACT FOLDER DATA ---
      const folderData: Folder = {
        id: Number(folderId),
        name: apiResponse.folder_name || "Unnamed Folder",
        visibility: apiResponse.folder_visibility || "public",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Extract is_owner from API response
      const ownerStatus = apiResponse.is_owner || false
      setIsOwner(ownerStatus)
      setIsPublicView(!ownerStatus)

      let validPosts: APIPost[] = []
      if (apiResponse && typeof apiResponse === 'object' && Array.isArray(apiResponse.posts)) {
        validPosts = apiResponse.posts
      }

      // --- TRANSFORM POSTS ---
      const uiPosts = validPosts.map((p: any, index: number) => {
        // Handle Images
        const postImage = (p.images && p.images.length > 0) 
          ? p.images[0].url 
          : (p.img_url || undefined)
        
        // --- AUTHOR LOGIC ---
        // We STRICTLY use the author object from the backend post data.
        // We do NOT use any global user state here.
        const authorName = p.author?.name || "Anonymous";
        const authorAvatar = p.author?.profile_photo_url || "";

        return {
          id: p.id.toString(),
          day: index + 1, 
          title: p.title,
          content: p.body, 
          date: new Date(p.created_at).toLocaleDateString(),
          imageUrl: postImage,
          hasImage: !!postImage,
          author: { 
            name: authorName, 
            avatar: authorAvatar 
          }, 
          likes: p.likes_count,
          comments: p.comments_count,
          tags: Array.isArray(p.tags) ? p.tags : (p.tags ? p.tags.split(',').map((t: string) => t.trim()) : []),
          links: p.links || [], 
          rawVisibility: p.visibility 
        }
      })

      // Update State
      setFolder(folderData)
      setPosts(uiPosts)
      setCurrentDay(uiPosts.length > 0 ? uiPosts.length : 1)

      // 3. SAVE TO CACHE (New Key)
      const cachePayload: CachedData = {
        folder: folderData,
        posts: uiPosts,
        timestamp: Date.now(),
        isOwner: ownerStatus
      }
      localStorage.setItem(cacheKey, JSON.stringify(cachePayload))

    } catch (error) {
      console.error("Failed to load folder page", error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [folderId, router])

  // Initial Load
  useEffect(() => {
    if (folderId) loadData(false)
  }, [folderId, loadData])

  // --- Manual Refresh Handler ---
  const handleManualRefresh = () => {
    loadData(true)
  }

  // --- Edit Logic ---
  const handleEditClick = (post: any) => {
    if (!isOwner) return
    
    setEditingPostId(post.id)
    setEditForm({
      title: post.title,
      body: post.content, 
      visibility: post.rawVisibility || "public",
      tags: Array.isArray(post.tags) ? post.tags.join(", ") : post.tags,
      img_url: post.imageUrl || "",
      links: post.links ? [...post.links] : []
    })
    setIsEditOpen(true)
  }

  const addLinkRow = () => {
    setEditForm(prev => ({
      ...prev,
      links: [...(prev.links || []), { label: "", url: "" }]
    }))
  }

  const removeLinkRow = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      links: (prev.links || []).filter((_, i) => i !== index)
    }))
  }

  const updateLinkRow = (index: number, field: "label" | "url", value: string) => {
    setEditForm(prev => {
      const newLinks = [...(prev.links || [])]
      newLinks[index] = { ...newLinks[index], [field]: value }
      return { ...prev, links: newLinks }
    })
  }

  // --- Delete Handler ---
  const handleDeleteClick = (postId: string) => {
    if (!isOwner) return
    
    setDeletingPostId(postId)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingPostId || !isOwner) return
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      setIsDeleting(true)
      const postIdNumber = Number(deletingPostId)
      const result = await delete_post(token, postIdNumber)
      
      if (result) {
        setPosts((prevPosts) => prevPosts.filter(p => p.id !== deletingPostId))
        const cacheKey = `${CACHE_PREFIX}${folderId}_auth`
        localStorage.removeItem(cacheKey)
        setIsDeleteOpen(false)
        setDeletingPostId(null)
      }
    } catch (error) {
      console.error("Failed to delete post:", error)
      alert("Failed to delete post.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSavePost = async () => {
    if (!editingPostId || !isOwner) return
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      setIsSaving(true)
      const cleanData = {
        ...editForm,
        links: editForm.links?.filter(l => l.label.trim() !== "" && l.url.trim() !== "")
      }

      const updatedPostData = await updatePost(token, editingPostId, cleanData)

      setPosts((prevPosts) => 
        prevPosts.map((p) => {
          if (p.id === editingPostId) {
            const newTags = typeof editForm.tags === 'string' 
              ? editForm.tags.split(',').map(t => t.trim()).filter(Boolean)
              : []

            return { 
              ...p, 
              title: updatedPostData.title || editForm.title, 
              content: updatedPostData.body || editForm.body,
              tags: newTags,
              links: updatedPostData.links || cleanData.links, 
              rawVisibility: editForm.visibility,
              imageUrl: editForm.img_url,
              hasImage: !!editForm.img_url
            } 
          }
          return p
        })
      )

      setIsEditOpen(false)
      setEditingPostId(null)
      
      if (folder) {
        const cacheKey = `${CACHE_PREFIX}${folderId}_auth`
        localStorage.removeItem(cacheKey) 
      }

    } catch (error) {
      console.error("Failed to update post:", error)
      alert("Failed to update post.")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  if (!folder) return null

  const isProject = folder.name.toLowerCase().includes("project") 
  const FolderIcon = isProject ? Code : FolderIcon2  
  const typeColor = isProject ? "text-accent bg-accent/10" : "text-primary bg-primary/10"
  
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {isOwner && (
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      )}

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
                <Badge variant="outline" className="capitalize">
                  {folder.visibility}
                </Badge>
                {!isOwner && <Badge variant="secondary">View Only</Badge>}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <p>{posts.length} days logged</p>
                {isOwner && (
                  <button 
                    onClick={handleManualRefresh}
                    className={`flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                    title="Force refresh data"
                  >
                    <RefreshCcw className="w-3 h-3" /> 
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <DaySelector totalDays={posts.length} currentDay={currentDay} onDayChange={setCurrentDay} />
            {isOwner && (
              <Link href={`/create?folderId=${folderId}`}>
                <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> New Post</Button>
              </Link>
            )}
          </div>

          {posts.length > 0 ? (
            <Timeline 
              posts={posts} 
              onEdit={isOwner ? handleEditClick : undefined} 
              onDelete={isOwner ? handleDeleteClick : undefined}
              isOwner={isOwner}
            />
          ) : (
            <div className="text-center py-12 border border-dashed rounded-xl">
              <p className="text-muted-foreground">No posts yet.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="timeline" className="mt-6">
          <div className="text-center p-8 text-muted-foreground">Timeline Visualization Placeholder</div>
        </TabsContent>
      </Tabs>

      {/* --- EDIT POST MODAL (Only for owners) --- */}
      {isOwner && (
        <>
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
            description="Are you sure you want to delete this post? This action cannot be undone."
            confirmText="Delete"
            variant="destructive"
          />
        </>
      )}
    </div>
  )
}