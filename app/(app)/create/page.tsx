"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation" 
import { useUser } from "@/context/user-context"
// 👇 Import the specific types to ensure type safety
import { createPost, createPostInFolder, type CreatePostData } from "../../lib/api/create_api"

import { RichTextEditor } from "@/components/devlayers/rich-text-editor"
import { PrivacyToggle } from "@/components/devlayers/privacy-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, ImageIcon, Save, Eye, X, Loader2, Link as LinkIcon, Plus } from "lucide-react"
import Link from "next/link"

// --- INTERNAL FORM COMPONENT ---
function CreatePostForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { folders, refreshUser } = useUser() 

  // 1. Set default state based on URL param
  const urlFolderId = searchParams.get("folderId")
  const [selectedFolder, setSelectedFolder] = useState<string>(urlFolderId || "none")

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  
  // 2. Custom Link State Management
  const [links, setLinks] = useState<{ label: string; url: string }[]>([])
  const [tempLinkLabel, setTempLinkLabel] = useState("")
  const [tempLinkUrl, setTempLinkUrl] = useState("")
  
  const [imgUrl, setImgUrl] = useState("") 
  const [showImgInput, setShowImgInput] = useState(false)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // 3. Tags Management (UI uses Array, API uses String)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  // --- Handlers ---

  const addLink = () => {
    if (tempLinkLabel.trim() && tempLinkUrl.trim()) {
      setLinks([...links, { label: tempLinkLabel, url: tempLinkUrl }])
      setTempLinkLabel("")
      setTempLinkUrl("")
    }
  }

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

const handleSubmit = async () => {
    const token = localStorage.getItem("token")
    if (!token || !title.trim() || !content.trim()) {
        alert("Please fill in the title and content.")
        return
    }

    setIsSubmitting(true)

    // 1. Capture any pending tags currently in the input box
    let finalTags = [...tags]
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
        finalTags.push(tagInput.trim())
    }

    // 2. Capture any pending links currently in the input boxes
    let finalLinks = [...links]
    if (tempLinkLabel.trim() && tempLinkUrl.trim()) {
        finalLinks.push({ label: tempLinkLabel, url: tempLinkUrl })
    }


    // 👇 Construct Payload using finalTags and finalLinks
    const payload: CreatePostData = {
        title: title,
        content: content,
        visibility: isPublic ? "public" : "private",
        img_url: imgUrl || undefined,
        // Use finalTags instead of state tags
        tags: finalTags.length > 0 ? finalTags.join(",") : undefined, 
        // Use finalLinks instead of state links
        links: finalLinks.length > 0 ? finalLinks : undefined 
    }

    console.log("Submitting Payload:", payload); // Debugging line

    try {
        let result;

        if (selectedFolder && selectedFolder !== "none") {
            result = await createPostInFolder(token, selectedFolder, payload)
            console.log("Folder post simulated")
            result = true // Simulating success for now if API call is commented out
        } else {
            result = await createPost(token, payload)
        }

        if (result) {
            await refreshUser()
            if (selectedFolder !== "none") {
                router.push(`/all_posts`) 
            } else {
                router.push("/all_posts")
            }
        } else {
            alert("Failed to publish post.")
        }
    } catch (error) {
        console.error("Publishing error", error)
        alert("An error occurred while publishing.")
    } finally {
        setIsSubmitting(false)
    }
  }

  const selectedFolderName = folders.find((f) => f.id.toString() === selectedFolder)?.name || "No folder selected"

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Create New Post</h1>
            <p className="text-sm text-muted-foreground">Document your daily progress</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button className="gap-2 glow-sm press-effect" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Publish
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        
        {/* Folder Selection */}
        <div className="space-y-2">
          <Label>Folder (Optional)</Label>
          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select a folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Folder (Standalone Post)</SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id.toString()}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Select "No Folder" to create a standalone post on your profile.</p>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            placeholder="What did you learn or build today?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12 text-lg font-medium"
          />
        </div>

        {/* Content editor */}
        <div className="space-y-2">
          <Label>Content <span className="text-red-500">*</span></Label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write about your progress, learnings, challenges, and insights..."
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag (e.g., React, Bugfix)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className="h-10"
            />
            <Button variant="secondary" onClick={addTag}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive p-0.5 rounded-full hover:bg-background/50 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* --- Attachments Section --- */}
        <div className="p-4 rounded-xl border border-border/60 bg-secondary/5 space-y-5">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <LinkIcon className="w-4 h-4" /> Attachments & Links
          </h3>

          {/* Image Input */}
          <div className="space-y-3">
             <div className="flex items-center gap-2">
                <Button 
                    variant={showImgInput ? "secondary" : "outline"} 
                    size="sm" 
                    onClick={() => setShowImgInput(!showImgInput)}
                    className="gap-2"
                >
                    <ImageIcon className="w-4 h-4" />
                    {showImgInput ? "Cancel Image" : "Add Cover Image"}
                </Button>
             </div>
             
             {showImgInput && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <Input
                        placeholder="Paste image URL here (https://...)"
                        value={imgUrl}
                        onChange={(e) => setImgUrl(e.target.value)}
                        className="h-10 bg-background"
                    />
                </div>
             )}
          </div>

          {/* Custom Links Input */}
          <div className="space-y-3">
             <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">External Links</Label>
             
             <div className="flex flex-col md:flex-row gap-2">
                <Input 
                    placeholder="Label (e.g. GitHub, Live Demo)" 
                    value={tempLinkLabel}
                    onChange={(e) => setTempLinkLabel(e.target.value)}
                    className="flex-1 bg-background"
                />
                <Input 
                    placeholder="URL (https://...)" 
                    value={tempLinkUrl}
                    onChange={(e) => setTempLinkUrl(e.target.value)}
                    className="flex-[2] bg-background"
                />
                <Button variant="outline" size="icon" onClick={addLink} title="Add Link">
                    <Plus className="w-4 h-4" />
                </Button>
             </div>

             {/* Links List */}
             {links.length > 0 && (
                 <div className="space-y-2 mt-2">
                    {links.map((link, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-background border border-border text-sm">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <LinkIcon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                <span className="font-medium">{link.label}:</span>
                                <span className="text-muted-foreground truncate max-w-[200px]">{link.url}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeLink(idx)}>
                                <X className="w-3 h-3" />
                            </Button>
                        </div>
                    ))}
                 </div>
             )}
          </div>
        </div>

        {/* Privacy toggle */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label>Visibility</Label>
            <PrivacyToggle isPublic={isPublic} onChange={setIsPublic} />
          </div>
          <p className="text-sm text-muted-foreground">
            {isPublic
              ? "This post will be visible to everyone on your public profile."
              : "This post will only be visible to you."}
          </p>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post Preview</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground">in {selectedFolderName}</span>
                <Badge variant={isPublic ? "default" : "secondary"} className="ml-auto">
                  {isPublic ? "Public" : "Private"}
                </Badge>
              </div>

              <h2 className="text-2xl font-bold mb-4 leading-tight">{title || "Untitled Post"}</h2>
              
              {imgUrl && (
                  <div className="rounded-lg overflow-hidden border border-border/50 mb-6">
                     <img src={imgUrl} alt="Post cover" className="w-full h-auto max-h-[300px] object-cover" />
                  </div>
              )}

              <div 
                className="text-foreground leading-relaxed mb-6 prose dark:prose-invert max-w-none text-sm md:text-base"
                dangerouslySetInnerHTML={{ __html: content }} 
              />

              {/* Preview Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 pt-4 border-t border-border/50">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs text-muted-foreground">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Preview Links */}
             {(links.length > 0 || (tempLinkLabel && tempLinkUrl)) && (
                <div className="flex flex-col gap-2 p-3 rounded-lg bg-secondary/20 mt-4">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Attached Links</h4>
                  
                  {/* Render Saved Links */}
                  {links.map((link, i) => (
                    <div key={`saved-${i}`} className="flex items-center gap-2 text-sm">
                      <LinkIcon className="w-3 h-3 text-primary flex-shrink-0" />
                      <span className="font-semibold">{link.label}:</span>
                      <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="truncate hover:underline text-blue-500 break-all"
                      >
                        {link.url}
                      </a>
                    </div>
                  ))}

                  {/* Render Pending Link (The one currently in the inputs) */}
                  {tempLinkLabel && tempLinkUrl && (
                    <div className="flex items-center gap-2 text-sm opacity-70 border-l-2 border-yellow-500 pl-2">
                      <LinkIcon className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                      <span className="font-semibold">{tempLinkLabel}:</span>
                      <a 
                          href={tempLinkUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="truncate hover:underline text-blue-500 break-all"
                      >
                        {tempLinkUrl}
                      </a>
                      <span className="text-[10px] text-muted-foreground ml-auto">(Pending)</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// --- MAIN EXPORT WRAPPED IN SUSPENSE ---
export default function CreatePostPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <CreatePostForm />
    </Suspense>
  )
}