"use client"

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
import { useState } from "react"

const mockFolders = [
  { id: "1", title: "Learning React" },
  { id: "2", title: "Fintech SaaS Project" },
  { id: "3", title: "Rust Journey" },
]

export default function CreatePostPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedFolder, setSelectedFolder] = useState("")
  const [day, setDay] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [githubLink, setGithubLink] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
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

  const selectedFolderName = mockFolders.find((f) => f.id === selectedFolder)?.title || "No folder selected"

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
            <Label>Folder</Label>
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                {mockFolders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="day">Day Number</Label>
            <Input
              id="day"
              type="number"
              placeholder="24"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="h-11"
            />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
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
          <Label>Content</Label>
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
            <Button variant="outline" className="gap-2 h-10 bg-transparent">
              <Github className="w-4 h-4" />
              Add GitHub Link
            </Button>
            <Button variant="outline" className="gap-2 h-10 bg-transparent">
              <ImageIcon className="w-4 h-4" />
              Add Image
            </Button>
            <Button variant="outline" className="gap-2 h-10 bg-transparent">
              <LinkIcon className="w-4 h-4" />
              Add Link
            </Button>
          </div>

          {/* GitHub link input */}
          <div className="space-y-2">
            <Input
              placeholder="https://github.com/username/repo"
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              className="h-10"
            />
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

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post Preview</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Preview card */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="bg-background border-primary/30 text-primary font-mono text-xs">
                  Day {day || "?"}
                </Badge>
                <span className="text-sm text-muted-foreground">in {selectedFolderName}</span>
                <Badge variant="secondary" className="ml-auto">
                  {isPublic ? "Public" : "Private"}
                </Badge>
              </div>

              <h2 className="text-xl font-bold mb-3">{title || "Untitled Post"}</h2>

              <div className="text-muted-foreground leading-relaxed mb-4">{content || "No content yet..."}</div>

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
                  <span className="truncate">{githubLink}</span>
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
