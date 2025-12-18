"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/app/lib/utils"
import { 
  Heart, 
  ThumbsDown,
  MessageCircle, 
  Share2, 
  Bookmark, 
  Github, 
  MoreHorizontal, 
  Pencil, 
  ExternalLink, 
  Trash2, 
  Send, 
  X,
  Check,
  Clock
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AnimatePresence, motion } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// API Imports
import { 
  deleteComment, 
  createComment, 
  editComment,
  getPostComments, 
  addReaction,
  removeReaction,
  type Comment as APIComment 
} from '../../app/lib/api/reactions_api'

// --- Types ---
interface LinkItem {
  label: string
  url: string
}

interface PostCardProps {
  id: string 
  day: number
  title: string
  content: string
  author?: {
    name: string
    avatar?: string
    username?: string
  }
  date: string
  likes?: number
  dislikes?: number // Added
  comments?: number
  links?: LinkItem[]
  hasImage?: boolean
  imageUrl?: string
  tags?: string[]
  isLiked?: boolean
  isDisliked?: boolean // Added
  isBookmarked?: boolean
  className?: string
  showDayBadge?: boolean
  showActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export function PostCard({
  id,
  day,
  title,
  content,
  author,
  date,
  likes = 0,
  dislikes = 0, 
  comments: initialCommentCount = 0,
  links = [], 
  hasImage = false,
  imageUrl,
  tags = [],
  isLiked: initialIsLiked = false,
  isDisliked: initialIsDisliked = false, // Added
  isBookmarked: initialIsBookmarked = false,
  className,
  onEdit,
  onDelete,
  showDayBadge = true,
  showActions = false,
}: PostCardProps) {
  
  // --- State ---
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isDisliked, setIsDisliked] = useState(initialIsDisliked)
  const [likeCount, setLikeCount] = useState(likes)
  const [dislikeCount, setDislikeCount] = useState(dislikes)
  const [commentText, setCommentText] = useState("")
  const [commentsList, setCommentsList] = useState<APIComment[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editText, setEditText] = useState("")

  // --- Effects ---

  useEffect(() => {
    const userCache = localStorage.getItem("user_cache")
    if (userCache) {
      try {
        const parsedCache = JSON.parse(userCache)
        setCurrentUserId(parsedCache.id)
      } catch (e) { console.error(e) }
    }
  }, [])

  useEffect(() => {
    if (isExpanded) {
      setIsLoadingComments(true)
      getPostComments(Number(id))
        .then(setCommentsList)
        .finally(() => setIsLoadingComments(false))
    }
  }, [isExpanded, id])

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => { document.body.style.overflow = "unset" }
  }, [isExpanded])

  // --- Reaction Handlers ---

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const token = localStorage.getItem("token") || ""
    if (!token) return

    // Optimistic UI logic
    if (isLiked) {
      // Remove Like
      setIsLiked(false)
      setLikeCount(prev => prev - 1)
      await removeReaction(token, Number(id))
    } else {
      // If currently disliked, remove dislike first
      if (isDisliked) {
        setIsDisliked(false)
        setDislikeCount(prev => prev - 1)
      }
      // Add Like
      setIsLiked(true)
      setLikeCount(prev => prev + 1)
      await addReaction(token, Number(id), "like")
    }
  }

  const handleDislike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const token = localStorage.getItem("token") || ""
    if (!token) return

    // Optimistic UI logic
    if (isDisliked) {
      // Remove Dislike
      setIsDisliked(false)
      setDislikeCount(prev => prev - 1)
      await removeReaction(token, Number(id))
    } else {
      // If currently liked, remove like first
      if (isLiked) {
        setIsLiked(false)
        setLikeCount(prev => prev - 1)
      }
      // Add Dislike
      setIsDisliked(true)
      setDislikeCount(prev => prev + 1)
      await addReaction(token, Number(id), "dislike")
    }
  }

  // --- Comment Handlers ---

  const handleSendComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!commentText.trim()) return

    const token = localStorage.getItem("token") || ""
    const newComment = await createComment(token, Number(id), commentText)

    if (newComment) {
      setCommentsList([newComment, ...commentsList])
      setCommentText("")
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    const token = localStorage.getItem("token") || ""
    if (await deleteComment(token, Number(id), commentId)) {
      setCommentsList((prev) => prev.filter(c => c.id !== commentId))
    }
  }

  const handleUpdateComment = async (commentId: number) => {
    if (!editText.trim()) return
    const token = localStorage.getItem("token") || ""
    const updated = await editComment(token, Number(id), commentId, editText)
    
    if (updated) {
      setCommentsList((prev) => 
        prev.map(c => c.id === commentId ? { ...c, body: updated.body } : c)
      )
      setEditingCommentId(null)
    }
  }

  // --- Helper Component ---

  const PostBody = ({ isFullView = false }: { isFullView?: boolean }) => (
    <div className="flex flex-col">
      <div className="flex justify-between items-start mb-4">
        {author && (
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 ring-2 ring-background">
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback>{author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{author.name}</p>
              <p className="text-xs text-muted-foreground">
                {author.username && `@${author.username} · `}{date}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1">
           {isFullView ? (
             <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={() => setIsExpanded(false)}>
               <X className="w-5 h-5" />
             </Button>
           ) : showActions && (
             <DropdownMenu>
               <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                 <Button variant="ghost" size="icon" className="h-8 w-8">
                   <MoreHorizontal className="w-4 h-4" />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                 <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.() }}>
                   <Pencil className="mr-2 h-4 w-4" /> Edit Post
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete?.() }} className="text-destructive">
                   <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
           )}
        </div>
      </div>

      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className={cn("text-muted-foreground text-sm leading-relaxed mb-4", !isFullView && "line-clamp-3")}>
        {content}
      </p>

      {hasImage && imageUrl && (
        <div className="rounded-lg overflow-hidden mb-4 aspect-video bg-secondary">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, i) => <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>)}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-border mb-3">
        <div className="flex items-center gap-1">
          {/* Like Button */}
          <Button variant="ghost" size="sm" onClick={handleLike} className={cn("h-8 px-2 gap-1.5", isLiked && "text-red-500 hover:text-red-600")}>
            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
            <span className="text-xs">{likeCount}</span>
          </Button>

          {/* Dislike Button */}
          <Button variant="ghost" size="sm" onClick={handleDislike} className={cn("h-8 px-2 gap-1.5", isDisliked && "text-blue-500 hover:text-blue-600")}>
            <ThumbsDown className={cn("w-4 h-4", isDisliked && "fill-current")} />
            <span className="text-xs">{dislikeCount}</span>
          </Button>

          <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5" onClick={() => setIsExpanded(true)}>
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">{commentsList.length || initialCommentCount}</span>
          </Button>
          <Share2 className="w-4 h-4 mx-2 text-muted-foreground cursor-pointer" />
        </div>
        <div className="flex items-center gap-2">
          {links.map((l, i) => (
            <a key={i} href={l.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
              {l.label.toLowerCase().includes("github") ? <Github className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
            </a>
          ))}
          <Bookmark className="w-4 h-4 text-muted-foreground cursor-pointer" />
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* FEED VIEW */}
      <motion.div
        layoutId={`card-${id}`}
        onClick={() => setIsExpanded(true)}
        className={cn("group relative rounded-xl border border-border bg-card p-5 cursor-pointer hover:shadow-lg transition-all", className)}
      >
        {showDayBadge && <Badge variant="outline" className="absolute -top-2.5 left-4 bg-background border-primary/30 text-primary">Post #{day}</Badge>}
        <div className="pt-2"><PostBody /></div>
      </motion.div>

      {/* EXPANDED MODAL */}
      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setIsExpanded(false)}
            />
            
            <motion.div 
              layoutId={`card-${id}`}
              className="relative w-full max-w-2xl h-[90vh] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* SCROLLABLE AREA */}
              <ScrollArea className="flex-1 min-h-0 w-full">
                <div className="p-6">
                  <PostBody isFullView />
                  <div className="my-6 border-t border-border" />

                  {/* Comments Section */}
                  <div className="space-y-6 pb-10">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      Discussion ({commentsList.length})
                    </h4>
                    
                    {isLoadingComments ? (
                      <div className="text-center py-10 text-sm text-muted-foreground animate-pulse">Fetching comments...</div>
                    ) : (
                      <div className="space-y-8">
                        {commentsList.map((c) => (
                          <div key={c.id} className="flex gap-4 items-start">
                            <Avatar className="w-9 h-9 shrink-0">
                              <AvatarImage src={c.author_profile_image || ''} />
                              <AvatarFallback>{c.author_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold">{c.author_name}</span>
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-full">
                                    <Clock className="w-3 h-3" />
                                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : "Just now"}
                                  </span>
                                </div>
                                
                                {c.author_id === currentUserId && (
                                  <div className="flex items-center gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                                      onClick={() => { setEditingCommentId(c.id); setEditText(c.body); }}
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                      onClick={() => handleDeleteComment(c.id)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {editingCommentId === c.id ? (
                                <div className="flex gap-2 mt-2">
                                  <Input value={editText} onChange={e => setEditText(e.target.value)} className="h-8 text-sm" autoFocus />
                                  <Button size="icon" className="h-8 w-8" onClick={() => handleUpdateComment(c.id)}><Check className="w-4 h-4" /></Button>
                                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingCommentId(null)}><X className="w-4 h-4" /></Button>
                                </div>
                              ) : (
                                <p className="text-sm leading-relaxed text-foreground/90 break-words whitespace-pre-wrap">{c.body}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        {commentsList.length === 0 && (
                          <div className="text-center py-10 border-2 border-dashed border-border rounded-xl">
                            <p className="text-sm text-muted-foreground">No comments yet. Start the conversation!</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>

              {/* INPUT AREA */}
              <div className="p-4 bg-muted/20 border-t border-border shrink-0">
                <form onSubmit={handleSendComment} className="flex gap-2">
                  <Input 
                    placeholder="Write a comment..." 
                    value={commentText} 
                    onChange={e => setCommentText(e.target.value)} 
                    className="bg-background"
                  />
                  <Button type="submit" size="icon" disabled={!commentText.trim()}><Send className="w-4 h-4" /></Button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}