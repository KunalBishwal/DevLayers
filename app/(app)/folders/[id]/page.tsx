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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog"
import { 
  BookOpen, Share2, MoreHorizontal, Globe, Plus, Code, ArrowLeft, Lock, 
  Loader2, ImageIcon, Trash2, Link as LinkIcon 
} from "lucide-react"

// Logic 
import { 
  fetchUserProfile, 
  fetchUserFolders, 
  getFolderPosts, 
  Folder, 
  APIPost 
} from "../../../lib/api/user_api"

import { updatePost, UpdatePostData, LinkItem } from "../../../lib/api/update_api"

export default function FolderPage() {
  const params = useParams()
  const router = useRouter()
  const folderId = params.id as string

  // --- State ---
  const [folder, setFolder] = useState<Folder | null>(null)
  const [posts, setPosts] = useState<any[]>([]) 
  const [loading, setLoading] = useState(true)
  const [currentDay, setCurrentDay] = useState(1)

  // --- Edit State ---
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  
  // Expanded Form State with Dynamic Links
  const [editForm, setEditForm] = useState<UpdatePostData>({
    title: "",
    body: "",
    visibility: "public",
    tags: "",
    img_url: "",
    links: [] // Dynamic array
  })

  // --- Fetch Data ---
  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token")
      if (!token) { router.push("/login"); return }

      try {
        setLoading(true)
        const userProfile = await fetchUserProfile(token)
        if (!userProfile) { router.push("/login"); return }

        const [allFolders, apiResponse] = await Promise.all([
          fetchUserFolders(userProfile.id, token),
          getFolderPosts(token, folderId) as Promise<any> 
        ])

        const currentFolder = allFolders.find(f => f.id == Number(folderId))
        if (!currentFolder) { router.push("/dashboard"); return }
        setFolder(currentFolder)

        let validPosts: APIPost[] = []
        if (apiResponse && typeof apiResponse === 'object' && Array.isArray(apiResponse.posts)) {
            validPosts = apiResponse.posts
        } else if (Array.isArray(apiResponse)) {
            validPosts = apiResponse
        } 

        // 4. Transform API Posts to UI Format
        const uiPosts = validPosts.map((p: any, index: number) => {
          const postImage = p.img_url || (p.images && p.images.length > 0 ? p.images[0].url : undefined)
          
          return {
            id: p.id.toString(),
            day: index, 
            title: p.title,
            content: p.body, 
            date: new Date(p.created_at).toLocaleDateString(),
            imageUrl: postImage,
            hasImage: !!postImage,
            author: { name: userProfile.name, avatar: userProfile.profile_photo_url || "" }, 
            likes: 0,
            comments: 0,
            tags: Array.isArray(p.tags) ? p.tags : (p.tags ? p.tags.split(',') : []),
            // Map Links directly from backend list
            links: p.links || [], 
            rawVisibility: p.visibility 
          }
        })

        setPosts(uiPosts)
        setCurrentDay(uiPosts.length > 0 ? uiPosts.length : 1)

      } catch (error) {
        console.error("Failed to load folder page", error)
      } finally {
        setLoading(false)
      }
    }
    if (folderId) load()
  }, [folderId, router])


  // --- Edit Logic ---

  const handleEditClick = (post: any) => {
    setEditingPostId(post.id)
    setEditForm({
      title: post.title,
      body: post.content, 
      visibility: post.rawVisibility || "public",
      tags: Array.isArray(post.tags) ? post.tags.join(", ") : post.tags,
      img_url: post.imageUrl || "",
      // Populate links from existing post data
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

  const handleSavePost = async () => {
    if (!editingPostId) return
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      setIsSaving(true)
      
      // Filter out empty links before sending
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

            return { 
                ...p, 
                title: updatedPostData.title || editForm.title, 
                content: updatedPostData.body || editForm.body,
                tags: newTags,
                links: updatedPostData.links || cleanData.links, // Update links
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
  const FolderIcon = isProject ? Code : BookOpen
  const typeColor = isProject ? "text-accent bg-accent/10" : "text-primary bg-primary/10"
  
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
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
                <Badge variant="outline">{folder.visibility === "public" ? "Public" : "Private"}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{posts.length} days logged</p>
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
            <Link href={`/create?folderId=${folderId}`}>
              <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> New Post</Button>
            </Link>
          </div>

          {posts.length > 0 ? (
             <Timeline posts={posts} onEdit={handleEditClick} />
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

      {/* --- EDIT POST MODAL --- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>Update your log details.</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            
            {/* Content */}
            <div className="grid gap-2">
              <Label htmlFor="body">Content</Label>
              <Textarea
                id="body"
                className="min-h-[150px]"
                value={editForm.body}
                onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
              />
            </div>

            {/* Tags */}
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags <span className="text-xs text-muted-foreground">(comma separated)</span></Label>
              <Input
                id="tags"
                placeholder="React, Bug Fix"
                value={editForm.tags}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
              />
            </div>

            {/* Image URL */}
            <div className="grid gap-2">
              <Label htmlFor="img_url" className="flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> Image URL
              </Label>
              <Input
                id="img_url"
                value={editForm.img_url}
                onChange={(e) => setEditForm({ ...editForm, img_url: e.target.value })}
              />
            </div>

            {/* --- Dynamic Links Section --- */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                   <LinkIcon className="w-3 h-3" /> Links & Resources
                </Label>
                <Button type="button" variant="outline" size="sm" onClick={addLinkRow} className="h-7 text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Add Link
                </Button>
              </div>
              
              <div className="space-y-2">
                {editForm.links?.map((link, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="w-1/3">
                      <Input
                        placeholder="Label (e.g. GitHub)"
                        value={link.label}
                        onChange={(e) => updateLinkRow(index, "label", e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => updateLinkRow(index, "url", e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-muted-foreground hover:text-red-500"
                      onClick={() => removeLinkRow(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {(!editForm.links || editForm.links.length === 0) && (
                   <p className="text-xs text-muted-foreground italic pl-1">No links added.</p>
                )}
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePost} disabled={isSaving}>
              {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}