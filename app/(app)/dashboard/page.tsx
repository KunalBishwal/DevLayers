"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/context/user-context"
import { cn } from "@/app/lib/utils"

// --- API Imports ---
import { createFolder, createSocialLink } from "../../lib/api/create_api"
import { updateUserProfile, updateFolder } from "../../lib/api/update_api"
import { delete_folder } from "../../lib/api/delete_api" 

// --- Icons ---
import {
  Grid3X3, List, Plus, User, Link as LinkIcon, Mail, Loader2,
  Globe, Lock, Github, Linkedin, Twitter, ExternalLink,
  Settings, Camera, Trash2, AlertTriangle
} from "lucide-react"

// --- Components ---
import { FolderCard } from "@/components/devlayers/folder-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmModal } from "@/components/devlayers/delete_confirmation_widget" 

export default function DashboardPage() {
  const router = useRouter()
  const { user, folders, socialLinks, isLoading, refreshUser } = useUser()

  const [view, setView] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("all") 

  // --- Create Folder States ---
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderTitle, setNewFolderTitle] = useState("")
  const [newFolderDesc, setNewFolderDesc] = useState("")
  const [newFolderVisibility, setNewFolderVisibility] = useState<"public" | "private">("public")
  const [selectedTag, setSelectedTag] = useState("Learning")

  // --- Edit Folder States ---
  const [showEditFolder, setShowEditFolder] = useState(false)
  const [isUpdatingFolder, setIsUpdatingFolder] = useState(false)
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editFolderTitle, setEditFolderTitle] = useState("")
  const [editFolderDesc, setEditFolderDesc] = useState("")
  const [editFolderVisibility, setEditFolderVisibility] = useState<"public" | "private">("public")

  // --- DELETE Folder States ---
  const [deleteFolderId, setDeleteFolderId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // --- Edit Profile States ---
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [editName, setEditName] = useState("")
  const [editBio, setEditBio] = useState("")
  const [editPhotoUrl, setEditPhotoUrl] = useState("") 

  // --- Social Link States ---
  const [showAddLink, setShowAddLink] = useState(false)
  const [isAddingLink, setIsAddingLink] = useState(false)
  const [linkLabel, setLinkLabel] = useState("")
  const [linkUrl, setLinkUrl] = useState("")

  // --- Filter Logic ---
  const filteredFolders = folders.filter((folder) => {
    if (activeTab === "all") return true
    return folder.visibility === activeTab
  })

  // Loading View
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 w-1/3 bg-secondary rounded"></div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-40 bg-secondary rounded-xl"></div>
          <div className="h-40 bg-secondary rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!user) return null

  // --- HANDLERS ---

  // Open the Edit Dialog
  const openEditFolder = (e: React.MouseEvent, folder: any) => {
    e.stopPropagation() // Prevent navigation when clicking settings
    setEditingFolderId(folder.id.toString())
    setEditFolderTitle(folder.name)
    setEditFolderDesc(folder.description || "")
    setEditFolderVisibility(folder.visibility)
    setShowEditFolder(true)
  }

  // Handle Deletion Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteFolderId) return
    const token = localStorage.getItem("token")
    if (!token) return

    setIsDeleting(true)
    try {
      const result = await delete_folder(token, deleteFolderId)
      if (result) {
        await refreshUser()
        setDeleteFolderId(null)
        setShowEditFolder(false) // Close the edit dialog if it was open
      }
    } catch (error) {
      console.error("Delete failed", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdateProfile = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    setIsUpdatingProfile(true)
    try {
      await updateUserProfile(token, {
        name: editName,
        bio: editBio,
        profile_photo_url: editPhotoUrl
      })
      await refreshUser()
      setShowEditProfile(false)
    } catch (error: any) {
      alert(error.message || "Failed to update profile")
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleUpdateFolder = async () => {
    const token = localStorage.getItem("token")
    if (!token || !editingFolderId) return

    setIsUpdatingFolder(true)
    try {
      await updateFolder(token, editingFolderId, {
        name: editFolderTitle,
        description: editFolderDesc,
        visibility: editFolderVisibility
      })
      await refreshUser()
      setShowEditFolder(false)
    } catch (error: any) {
      alert(error.message || "Failed to update folder")
    } finally {
      setIsUpdatingFolder(false)
    }
  }

  const handleCreateFolder = async () => {
    const token = localStorage.getItem("token")
    if (!token || !newFolderTitle.trim()) return

    setIsCreatingFolder(true)
    try {
      const success = await createFolder(token, {
        name: newFolderTitle,
        description: newFolderDesc,
        visibility: newFolderVisibility,
        tags: selectedTag
      })
      if (success) {
        await refreshUser()
        setNewFolderTitle("")
        setNewFolderDesc("")
        setShowCreateFolder(false)
      }
    } catch (error) {
      console.error("Creation failed", error)
    } finally {
      setIsCreatingFolder(false)
    }
  }

  const handleAddSocialLink = async () => {
    const token = localStorage.getItem("token")
    if (!token || !linkLabel.trim() || !linkUrl.trim()) return

    setIsAddingLink(true)
    try {
      const success = await createSocialLink(token, { label: linkLabel, url: linkUrl })
      if (success) {
        await refreshUser()
        setLinkLabel("")
        setLinkUrl("")
        setShowAddLink(false)
      }
    } catch (error) {
      console.error("Link creation failed", error)
    } finally {
      setIsAddingLink(false)
    }
  }

  // Helper to open profile edit
  const openEditProfile = () => {
    setEditName(user.name)
    setEditBio(user.bio || "")
    setEditPhotoUrl(user.profile_photo_url || "")
    setShowEditProfile(true)
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground mt-1">Here is your documentation overview.</p>
        </div>
        <Button className="gap-2 glow-sm press-effect" onClick={() => setShowCreateFolder(true)}>
          <Plus className="w-4 h-4" />
          New Folder
        </Button>
      </div>

      {/* Profile & Socials Row */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* User Bio Card */}
        <div className="md:col-span-2 rounded-xl border border-border bg-card p-6 relative group">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-muted-foreground hover:text-primary"
            onClick={openEditProfile}
          >
            <Settings className="w-4 h-4" />
          </Button>

          <div className="flex flex-col justify-center gap-4 h-full">
            <div className="flex items-start gap-4">
              <div className="relative group/photo">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden border border-border">
                  {user.profile_photo_url ? (
                    <img src={user.profile_photo_url} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-primary" />
                  )}
                </div>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full border border-background shadow-sm hover:bg-primary hover:text-primary-foreground"
                  onClick={openEditProfile}
                >
                  <Camera className="w-3 h-3" />
                </Button>
              </div>

              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">{user.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                  <Mail className="w-3 h-3" /> {user.email}
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {user.bio || "No bio added yet. Click settings to describe your journey."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links Card */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Socials</h3>
            </div>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setShowAddLink(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[150px]">
            {socialLinks.length > 0 ? (
              socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {link.label.toLowerCase().includes("github") ? <Github className="w-4 h-4" /> :
                      link.label.toLowerCase().includes("twitter") ? <Twitter className="w-4 h-4" /> :
                        link.label.toLowerCase().includes("linkedin") ? <Linkedin className="w-4 h-4" /> :
                          <Globe className="w-4 h-4" />}
                    <span className="text-sm font-medium">{link.label}</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed border-border/50 rounded-lg">
                No links added yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Folders Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList>
              <TabsTrigger value="all">All ({folders.length})</TabsTrigger>
              <TabsTrigger value="public">Public</TabsTrigger>
              <TabsTrigger value="private">Private</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setView("grid")}>
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setView("list")}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl">
            <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No folders yet</h3>
            <Button onClick={() => setShowCreateFolder(true)} className="mt-4">Create Folder</Button>
          </div>
        ) : filteredFolders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl">
            <h3 className="text-lg font-medium text-muted-foreground">No {activeTab} folders found</h3>
          </div>
        ) : (
          <div className={view === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
            {filteredFolders.map((folder) => (
              <div key={folder.id} className="relative group">
                <FolderCard
                  id={folder.id.toString()}
                  title={folder.name}
                  description={folder.description}
                  isPublic={folder.visibility === "public"}
                  onClick={() => router.push(`/folders/${folder.id}`)}
                />
                
                {/* SETTINGS BUTTON ON CARD (Triggers Edit Modal) */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-10 right-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm border border-border bg-background/10 backdrop-blur-sm"
                  onClick={(e) => openEditFolder(e, folder)}
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- CONFIRM DELETE MODAL --- */}
      <ConfirmModal
        isOpen={!!deleteFolderId}
        onClose={() => setDeleteFolderId(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Workspace?"
        description="This will permanently delete this folder and all contents within it. This action cannot be undone."
        confirmText="Yes, delete it"
      />

      {/* --- DIALOG: CREATE FOLDER --- */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="e.g. AI Research" value={newFolderTitle} onChange={(e) => setNewFolderTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Details..." value={newFolderDesc} onChange={(e) => setNewFolderDesc(e.target.value)} />
            </div>
            <div className="space-y-3">
              <Label>Visibility</Label>
              <div className="flex gap-4">
                <div onClick={() => setNewFolderVisibility("public")} className={cn("cursor-pointer border p-3 rounded-lg flex-1 text-center transition-colors", newFolderVisibility === "public" ? "border-primary bg-primary/10 text-primary" : "hover:bg-secondary/50")}>Public</div>
                <div onClick={() => setNewFolderVisibility("private")} className={cn("cursor-pointer border p-3 rounded-lg flex-1 text-center transition-colors", newFolderVisibility === "private" ? "border-primary bg-primary/10 text-primary" : "hover:bg-secondary/50")}>Private</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateFolder} disabled={!newFolderTitle.trim() || isCreatingFolder}>
              {isCreatingFolder && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG: EDIT FOLDER (WITH DELETE OPTION) --- */}
      <Dialog open={showEditFolder} onOpenChange={setShowEditFolder}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
            <DialogDescription>Update settings or delete this workspace.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Standard Edit Fields */}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editFolderTitle} onChange={(e) => setEditFolderTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={editFolderDesc} onChange={(e) => setEditFolderDesc(e.target.value)} />
            </div>
            <div className="space-y-3">
              <Label>Visibility</Label>
              <div className="flex gap-4">
                <div onClick={() => setEditFolderVisibility("public")} className={cn("cursor-pointer border p-3 rounded-lg flex-1 text-center flex items-center justify-center gap-2", editFolderVisibility === "public" ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-secondary/50")}>
                  <Globe className="w-4 h-4" /> Public
                </div>
                <div onClick={() => setEditFolderVisibility("private")} className={cn("cursor-pointer border p-3 rounded-lg flex-1 text-center flex items-center justify-center gap-2", editFolderVisibility === "private" ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-secondary/50")}>
                  <Lock className="w-4 h-4" /> Private
                </div>
              </div>
            </div>

            {/* DANGER ZONE */}
            <div className="pt-6 mt-4 border-t border-border">
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Danger Zone
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Deleting this folder will remove all files inside.
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    if (editingFolderId) setDeleteFolderId(Number(editingFolderId))
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>

          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setShowEditFolder(false)}>Cancel</Button>
            <Button onClick={handleUpdateFolder} disabled={!editFolderTitle.trim() || isUpdatingFolder}>
              {isUpdatingFolder && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG: EDIT PROFILE --- */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Profile Photo URL</Label>
              <Input 
                 placeholder="https://example.com/photo.jpg" 
                 value={editPhotoUrl} 
                 onChange={(e) => setEditPhotoUrl(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowEditProfile(false)}>Cancel</Button>
            <Button onClick={handleUpdateProfile} disabled={!editName.trim() || isUpdatingProfile}>
              {isUpdatingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG: ADD SOCIAL LINK --- */}
      <Dialog open={showAddLink} onOpenChange={setShowAddLink}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Social Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Platform Name</Label>
              <Input value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} placeholder="GitHub, LinkedIn..." />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddSocialLink} disabled={!linkLabel || !linkUrl || isAddingLink}>
              {isAddingLink && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}