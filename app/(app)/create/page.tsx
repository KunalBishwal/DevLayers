"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/context/user-context" // 1. Import Context
import { createPost, createPostInFolder } from "../../lib/api/create_api" // 2. Import API Actions

import { RichTextEditor } from "@/components/devlayers/rich-text-editor"
import { PrivacyToggle } from "@/components/devlayers/privacy-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Github, ImageIcon, LinkIcon, Save, Eye, X } from "lucide-react"
import Link from "next/link"

export default function CreatePostPage() {
  const router = useRouter()
  // Get real folders from context
  const { folders, refreshUser } = useUser() 

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<string>("none") // Default to "none" for standalone
  const [day, setDay] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [githubLink, setGithubLink] = useState("")
  const [imgUrl, setImgUrl] = useState("") // Added state for API img_url
  const [showImgInput, setShowImgInput] = useState(false)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  const handleSubmit = async () => {
    const token = localStorage.getItem("token")
    if (!token || !title.trim() || !content.trim()) {
        alert("Please fill in the title and content.")
        return
    }

    setIsSubmitting(true)

    // Construct the payload matching the API structure
    // Since API doesn't have 'tags' or 'github' fields, we can append them to content or title
    // or just send what is supported. Here I'm sending supported fields.
    const payload = {
        title: day ? `[Day ${day}] ${title}` : title, // embedding day in title
        content: content + (githubLink ? `<br/><br/><strong>Repo:</strong> <a href="${githubLink}">${githubLink}</a>` : ""),
        visibility: isPublic ? "public" : "private" as "public" | "private",
        img_url: imgUrl || undefined
    }

    try {
        let result;

        if (selectedFolder && selectedFolder !== "none") {
            // Endpoint: POST /folders/{id}/posts
            result = await createPostInFolder(token, selectedFolder, payload)
        } else {
            // Endpoint: POST /posts
            result = await createPost(token, payload)
        }

        if (result) {
            await refreshUser() // Update dashboard stats
            router.push("/dashboard")
        } else {
            alert("Failed to publish post.")
        }
    } catch (error) {
        console.error("Publishing error", error)
    } finally {
        setIsSubmitting(false)
    }
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

  // Find selected folder name for preview
  const selectedFolderName = folders.find((f) => f.id.toString() === selectedFolder)?.name || "No folder selected"

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
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
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Publish
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Folder & Day selection */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Folder (Optional)</Label>
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Folder (Standalone)</SelectItem>
                {/* Map real folders from context */}
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id.toString()}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="day">Day Number (Optional)</Label>
            <Input
              id="day"
              type="number"
              placeholder="e.g. 24"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="h-11"
            />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            placeholder="What did you learn or build today?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12 text-lg"
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

        {/* Tags - (Visual only currently, as API doesn't support tags on posts yet) */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className="h-10"
            />
            <Button variant="outline" onClick={addTag} className="bg-transparent">
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Attachments */}
        <div className="space-y-4">
          <Label>Attachments</Label>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2 h-10 bg-transparent" onClick={() => setShowImgInput(!showImgInput)}>
              <ImageIcon className="w-4 h-4" />
              {showImgInput ? "Cancel Image" : "Add Image URL"}
            </Button>
            {/* These are placeholders or could append to content */}
            <Button variant="outline" className="gap-2 h-10 bg-transparent">
              <Github className="w-4 h-4" />
              GitHub Link
            </Button>
          </div>
          
          {/* Image URL Input (Only shows if button clicked) */}
          {showImgInput && (
             <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                <Label htmlFor="imgUrl">Image URL</Label>
                <Input
                  id="imgUrl"
                  placeholder="https://example.com/image.png"
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  className="h-10"
                />
             </div>
          )}

          {/* GitHub link input */}
          <div className="space-y-2">
             <Label htmlFor="ghLink">GitHub Repository (Optional)</Label>
            <Input
              id="ghLink"
              placeholder="https://github.com/username/repo"
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">Will be appended to the bottom of your post.</p>
          </div>
        </div>

        {/* Privacy toggle */}
        <div className="space-y-3">
          <Label>Visibility</Label>
          <PrivacyToggle isPublic={isPublic} onChange={setIsPublic} />
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
            {/* Preview card */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                {day && (
                    <Badge variant="outline" className="bg-background border-primary/30 text-primary font-mono text-xs">
                    Day {day}
                    </Badge>
                )}
                <span className="text-sm text-muted-foreground">in {selectedFolderName}</span>
                <Badge variant="secondary" className="ml-auto">
                  {isPublic ? "Public" : "Private"}
                </Badge>
              </div>

              <h2 className="text-xl font-bold mb-3">{title || "Untitled Post"}</h2>
              
              {imgUrl && (
                  <img src={imgUrl} alt="Post cover" className="w-full h-48 object-cover rounded-md mb-4" />
              )}

              <div 
                className="text-muted-foreground leading-relaxed mb-4 prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content }} 
              />

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {githubLink && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-secondary">
                  <Github className="w-4 h-4" />
                  <a href={githubLink} target="_blank" rel="noreferrer" className="truncate hover:underline text-primary">
                    {githubLink}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 mt-4 border-t border-border text-sm text-muted-foreground">
                <span>0 likes</span>
                <span>0 comments</span>
                <span className="ml-auto">Just now</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              This is how your post will appear to {isPublic ? "everyone" : "you"}.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}