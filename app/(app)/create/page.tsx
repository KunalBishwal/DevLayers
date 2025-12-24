"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@/context/user-context"
import { createPost, createPostInFolder, type CreatePostData } from "../../lib/api/create_api"

import { RichTextEditor } from "@/components/devlayers/rich-text-editor"
import { PrivacyToggle } from "@/components/devlayers/privacy-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  ImageIcon, 
  Save, 
  Eye, 
  X, 
  Loader2, 
  Link as LinkIcon, 
  Plus, 
  Hash, 
  FolderOpen, 
  Settings2,
  Paperclip
} from "lucide-react"
import Link from "next/link"

function CreatePostForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { folders, refreshUser } = useUser()

  const urlFolderId = searchParams.get("folderId")
  const [selectedFolder, setSelectedFolder] = useState<string>(urlFolderId || "none")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [links, setLinks] = useState<{ label: string; url: string }[]>([])
  const [tempLinkLabel, setTempLinkLabel] = useState("")
  const [tempLinkUrl, setTempLinkUrl] = useState("")
  const [imgUrl, setImgUrl] = useState("")
  const [showImgInput, setShowImgInput] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [showPreview, setShowPreview] = useState(false)

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
    const trimmed = tagInput.trim().replace(/^#/, "")
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
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
    let finalTags = [...tags]
    if (tagInput.trim()) finalTags.push(tagInput.trim().replace(/^#/, ""))

    let finalLinks = [...links]
    if (tempLinkLabel.trim() && tempLinkUrl.trim()) {
      finalLinks.push({ label: tempLinkLabel, url: tempLinkUrl })
    }

    const payload: CreatePostData = {
      title,
      content,
      visibility: isPublic ? "public" : "private",
      img_url: imgUrl || undefined,
      tags: finalTags.length > 0 ? finalTags.join(",") : undefined,
      links: finalLinks.length > 0 ? finalLinks : undefined
    }

    try {
      let result;
      if (selectedFolder && selectedFolder !== "none") {
        result = await createPostInFolder(token, selectedFolder, payload)
      } else {
        result = await createPost(token, payload)
      }

      if (result) {
        await refreshUser()
        router.push("/all_posts")
      }
    } catch (error) {
      console.error("Publishing error", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedFolderName = folders.find((f) => f.id.toString() === selectedFolder)?.name || "No folder"

  return (
    <div className="min-h-screen bg-background/50">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="h-6 w-[1px] bg-border hidden sm:block mx-1" />
            <span className="font-semibold text-[11px] sm:text-sm text-muted-foreground truncate max-w-[100px] sm:max-w-none">
              Draft in <span className="text-primary">{selectedFolderName}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground h-9" onClick={() => setShowPreview(true)}>
              <Eye className="w-4 h-4" />
              <span className="hidden xs:inline">Preview</span>
            </Button>
            <Button 
              size="sm"
              className="gap-2 px-3 sm:px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all h-9" 
              onClick={handleSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span className="inline">Publish<span className="hidden sm:inline"> Post</span></span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-3 sm:p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column: Editor Section */}
          <div className="lg:col-span-8 space-y-6 order-1">
            <div className="bg-background border rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-10 shadow-sm">
              <input
                type="text"
                placeholder="Post Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-2xl sm:text-4xl md:text-5xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/30 mb-6 sm:mb-8"
              />
              
              <div className="min-h-[400px] sm:min-h-[500px]">
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Tell your story..."
                />
              </div>
            </div>
          </div>

          {/* Right Column: Metadata & Tools */}
          <aside className="lg:col-span-4 space-y-6 order-2 lg:order-2 pb-10 lg:pb-0">
            
            {/* Folder & Privacy Card */}
            <section className="bg-background border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm space-y-5 max-w-full overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-2 text-[10px] sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider flex-wrap">
                <Settings2 className="w-4 h-4 shrink-0" />
                <span className="break-words">Post Settings</span>
              </div>

              <div className="space-y-4">
                {/* Folder Select */}
                <div className="space-y-2 min-w-0">
                  <Label className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
                    <FolderOpen className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">Destination Folder</span>
                  </Label>

                  <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                    <SelectTrigger className="w-full bg-secondary/20 border-none h-10 sm:h-11 text-xs sm:text-sm truncate">
                      <SelectValue placeholder="Select a folder" />
                    </SelectTrigger>

                    <SelectContent className="max-w-[90vw]">
                      <SelectItem value="none">Standalone Post</SelectItem>
                      {folders.map((folder) => (
                        <SelectItem
                          key={folder.id}
                          value={folder.id.toString()}
                          className="truncate"
                        >
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Visibility */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap mb-2">
                    <Label className="text-xs sm:text-sm whitespace-nowrap">
                      Visibility
                    </Label>
                    <PrivacyToggle isPublic={isPublic} onChange={setIsPublic} />
                  </div>

                  <p className="text-[10px] sm:text-xs text-muted-foreground italic break-words">
                    {isPublic
                      ? "Visible to everyone on your profile"
                      : "Only you can see this post"}
                  </p>
                </div>
              </div>
            </section>


            {/* Tags Card */}
            <section className="bg-background border rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <Label className="flex items-center gap-2 text-[10px] sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                <Hash className="w-4 h-4" /> Tags
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  className="bg-secondary/20 border-none h-9 sm:h-10 text-xs sm:text-sm"
                />
                <Button variant="secondary" size="sm" className="h-9 sm:h-10" onClick={addTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-2 sm:px-3 py-1 bg-primary/5 text-primary border-primary/10 text-[10px] sm:text-xs">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="ml-2 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </section>

            {/* Attachments Card */}
            <section className="bg-background border rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <Label className="flex items-center gap-2 text-[10px] sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                <Paperclip className="w-4 h-4" /> Attachments
              </Label>
              
              <div className="space-y-4">
                {!showImgInput ? (
                  <Button 
                    variant="outline" 
                    className="w-full border-dashed border-2 py-6 sm:py-8 flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
                    onClick={() => setShowImgInput(true)}
                  >
                    <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                    <span className="text-[10px] sm:text-xs">Add Cover Image URL</span>
                  </Button>
                ) : (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium">Image URL</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => {setShowImgInput(false); setImgUrl("");}}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <Input
                      placeholder="https://images.unsplash.com/..."
                      value={imgUrl}
                      onChange={(e) => setImgUrl(e.target.value)}
                      className="bg-secondary/20 border-none h-9 sm:h-10 text-xs sm:text-sm"
                    />
                  </div>
                )}

                <div className="pt-4 border-t space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Label" value={tempLinkLabel} onChange={(e) => setTempLinkLabel(e.target.value)} className="bg-secondary/20 border-none text-[10px] sm:text-xs h-8 sm:h-9" />
                    <Input placeholder="URL" value={tempLinkUrl} onChange={(e) => setTempLinkUrl(e.target.value)} className="bg-secondary/20 border-none text-[10px] sm:text-xs h-8 sm:h-9" />
                  </div>
                  <Button variant="outline" className="w-full gap-2 text-[10px] sm:text-xs h-8 sm:h-9" onClick={addLink}>
                    <Plus className="w-3 h-3" /> Add Link
                  </Button>

                  <div className="space-y-2">
                    {links.map((link, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-secondary/10 border text-[10px] sm:text-[11px]">
                        <span className="font-bold truncate max-w-[60px] sm:max-w-[80px]">{link.label}</span>
                        <span className="text-muted-foreground truncate max-w-[100px] sm:max-w-[120px] ml-2">{link.url}</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto" onClick={() => removeLink(idx)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

          </aside>
        </div>
      </main>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-0 border-none shadow-2xl">
          <div className="p-5 sm:p-8 md:p-12 space-y-6">
              <div className="flex items-center justify-between text-[10px] sm:text-sm text-muted-foreground">
                <Badge variant="outline" className="rounded-full px-3 sm:px-4 text-[9px] sm:text-xs">{selectedFolderName}</Badge>
                <div className="flex items-center gap-2">
                  {isPublic ? "Public Post" : "Private Draft"}
                </div>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">{title || "Your Epic Title"}</h2>
              
              {imgUrl && (
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                     <img src={imgUrl} alt="Cover" className="w-full h-auto object-cover max-h-[300px] sm:max-h-[400px]" />
                  </div>
              )}

              <div 
                className="prose prose-sm sm:prose-lg dark:prose-invert max-w-none pb-10"
                dangerouslySetInnerHTML={{ __html: content || "<p className='text-muted-foreground'>No content yet...</p>" }} 
              />
              
              <div className="pt-6 border-t flex flex-col gap-4">
                 <div className="flex flex-wrap gap-2">
                    {tags.map(t => <span key={t} className="text-primary font-medium text-xs sm:text-sm">#{t}</span>)}
                 </div>
                 <div className="flex flex-wrap gap-4">
                    {links.map((l, i) => (
                      <a key={i} href={l.url} target="_blank" className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-muted-foreground hover:text-primary underline decoration-primary/30">
                        <LinkIcon className="w-3 h-3" /> {l.label}
                      </a>
                    ))}
                 </div>
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

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