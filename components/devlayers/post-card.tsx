"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/app/lib/utils"
import { 
  Heart, 
  ThumbsDown,
  MessageCircle, 
  Github, 
  MoreHorizontal, 
  Pencil, 
  ExternalLink, 
  Trash2, 
  Send, 
  X,
  Check,
  Clock,
  Folder,
  Eye,
  Bookmark
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
import { useRouter } from "next/navigation"

import { 
  deleteComment, 
  createComment, 
  editComment,
  getPostComments, 
  addReaction,
  removeReaction,
  type Comment as APIComment 
} from '../../app/lib/api/reactions_api'

import { createBookmark } from "@/app/lib/api/bookmarks_api"; 
import { toast } from "sonner" // Using sonner as it's cleaner for high-density UIs

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
  folder_id?: number | null
  folder_name?: string | null
  date: string
  likes?: number
  dislikes?: number
  comments?: number
  views?: number // Added Views
  links?: LinkItem[]
  hasImage?: boolean
  imageUrl?: string
  tags?: string[]
  isLiked?: boolean
  isDisliked?: boolean
  isBookmarked?: boolean
  className?: string
  showDayBadge?: boolean
  showActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
  isbookmark_card?: boolean
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
  views = 0, // Default views
  links = [], 
  hasImage = false,
  imageUrl,
  tags = [],
  isLiked: initialIsLiked = false,
  isDisliked: initialIsDisliked = false,
  className,
  onEdit,
  onDelete,
  showDayBadge = true,
  showActions = false,
  folder_id,
  folder_name,
  isbookmark_card = false
}: PostCardProps) {
  
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
  const router = useRouter()

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

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const token = localStorage.getItem("token") || ""
    if (!token) return
    if (isLiked) {
      setIsLiked(false)
      setLikeCount(prev => prev - 1)
      await removeReaction(token, Number(id))
    } else {
      if (isDisliked) {
        setIsDisliked(false)
        setDislikeCount(prev => prev - 1)
      }
      setIsLiked(true)
      setLikeCount(prev => prev + 1)
      await addReaction(token, Number(id), "like")
    }
  }

  const handleDislike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const token = localStorage.getItem("token") || ""
    if (!token) return
    if (isDisliked) {
      setIsDisliked(false)
      setDislikeCount(prev => prev - 1)
      await removeReaction(token, Number(id))
    } else {
      if (isLiked) {
        setIsLiked(false)
        setLikeCount(prev => prev - 1)
      }
      setIsDisliked(true)
      setDislikeCount(prev => prev + 1)
      await addReaction(token, Number(id), "dislike")
    }
  }

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

  const bookmarkPost = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const token = localStorage.getItem("token") || ""
    try {
      await createBookmark(Number(id), token)
      toast.success("Added to bookmarks")
    } catch (error: any) {
      toast.error(error.message || "Failed to bookmark")
    }
  }

  const PostBody = ({ isFullView = false }: { isFullView?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
            <AvatarImage src={author?.avatar} />
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
              {author?.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight">{author?.name}</span>
              {folder_id && (
                <Badge 
                  variant="secondary" 
                  className="bg-primary/5 text-primary border-none hover:bg-primary/10 transition-colors text-[10px] h-5 px-1.5 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); router.push(`/folders/${folder_id}`) }}
                >
                  <Folder className="w-2.5 h-2.5 mr-1" />
                  {folder_name || "Folder"}
                </Badge>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">
              {date} {author?.username && `· @${author.username}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isFullView ? (
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => setIsExpanded(false)}>
              <X className="w-4 h-4" />
            </Button>
          ) : (
            <>
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    {onEdit && (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit() }}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit Content
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={(e) => { e.stopPropagation(); onDelete?.() }} 
                      className="text-destructive focus:bg-destructive/5"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isbookmark_card ? "Remove Bookmark" : "Delete Post"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="space-y-3 mb-6">
        <h3 className="text-lg font-bold leading-tight tracking-tight text-foreground/90">
          {title}
        </h3>
        <p className={cn(
          "text-sm leading-relaxed text-muted-foreground transition-all",
          !isFullView && "line-clamp-3"
        )}>
          {content}
        </p>
      </div>

      {hasImage && imageUrl && (
        <div className="relative rounded-2xl overflow-hidden mb-6 bg-muted border border-border/50 group/image">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover max-h-[400px]" />
          <div className="absolute inset-0 bg-black/5 group-hover/image:bg-transparent transition-colors" />
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag, i) => (
            <Badge key={i} variant="outline" className="text-[10px] font-semibold bg-muted/30 border-border/50 rounded-md">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* FOOTER ACTION BAR */}
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-1 -ml-2">
          <Button 
            variant="ghost" size="sm" onClick={handleLike} 
            className={cn("h-9 px-3 gap-2 rounded-full", isLiked ? "text-rose-500 bg-rose-50/50" : "text-muted-foreground")}
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
            <span className="text-xs font-bold">{likeCount}</span>
          </Button>

          <Button 
            variant="ghost" size="sm" onClick={handleDislike} 
            className={cn("h-9 px-3 gap-2 rounded-full", isDisliked ? "text-blue-500 bg-blue-50/50" : "text-muted-foreground")}
          >
            <ThumbsDown className={cn("w-4 h-4", isDisliked && "fill-current")} />
            <span className="text-xs font-bold">{dislikeCount}</span>
          </Button>

          <Button 
            variant="ghost" size="sm" className="h-9 px-3 gap-2 rounded-full text-muted-foreground"
            onClick={() => setIsExpanded(true)}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-bold">{commentsList.length || initialCommentCount}</span>
          </Button>

          {/* VIEWS SECTION */}
          <div className="flex items-center gap-2 px-3 h-9 text-muted-foreground/60 border-l border-border/50 ml-1">
            <Eye className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium tracking-tight">{views}{isExpanded? " views":""}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {links.map((l, i) => (
            <Button key={i} variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild onClick={e => e.stopPropagation()}>
              <a href={l.url} target="_blank" rel="noreferrer">
                {l.label.toLowerCase().includes("github") ? <Github className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
              </a>
            </Button>
          ))}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground" onClick={bookmarkPost}>
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <motion.div
        layoutId={`card-${id}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setIsExpanded(true)}
        className={cn(
          "group relative flex flex-col bg-card border border-border/60 p-5 rounded-3xl cursor-pointer hover:shadow-xl hover:border-primary/20 transition-all duration-300",
          className
        )}
      >
        {showDayBadge && (
          <div className="absolute -top-3 left-6">
            <Badge className="bg-foreground text-background font-black text-[9px] uppercase tracking-widest px-2 shadow-sm border-none">
              Post {day}
            </Badge>
          </div>
        )}
        <PostBody />
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 lg:p-10">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
              onClick={() => setIsExpanded(false)}
            />
            
            <motion.div 
              layoutId={`card-${id}`}
              className="relative w-full max-w-4xl h-full sm:h-fit max-h-[95vh] flex flex-col bg-card sm:border border-border/50 sm:rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="flex h-full flex-col lg:flex-row">
                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-border/50 custom-scrollbar">
                  <PostBody isFullView />
                </div>

                {/* DISCUSSION AREA */}
                <div className="w-full lg:w-[380px] flex flex-col bg-muted/10 h-[500px] lg:h-auto">
                  <div className="p-5 border-b border-border/50 flex items-center justify-between bg-card/50">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Discussion ({commentsList.length})
                    </h4>
                  </div>
                  
                  <ScrollArea className="flex-1 p-5">
                    {isLoadingComments ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                        <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Syncing Thread</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {commentsList.map((c) => (
                          <div key={c.id} className="group/comment flex gap-3">
                            <Avatar className="w-7 h-7 border border-border shadow-sm">
                              <AvatarImage src={c.author_profile_image || ''} />
                              <AvatarFallback>{c.author_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-foreground truncate">{c.author_name}</span>
                                <div className="flex items-center gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                                   {c.author_id === currentUserId && (
                                     <>
                                       <button onClick={() => { setEditingCommentId(c.id); setEditText(c.body); }} className="p-1 hover:text-primary transition-colors">
                                         <Pencil className="w-3 h-3" />
                                       </button>
                                       <button onClick={() => handleDeleteComment(c.id)} className="p-1 hover:text-destructive transition-colors">
                                         <Trash2 className="w-3 h-3" />
                                       </button>
                                     </>
                                   )}
                                </div>
                              </div>
                              
                              {editingCommentId === c.id ? (
                                <div className="flex gap-2 mt-1">
                                  <Input value={editText} onChange={e => setEditText(e.target.value)} className="h-7 text-xs rounded-lg" autoFocus />
                                  <Button size="icon" className="h-7 w-7 rounded-lg" onClick={() => handleUpdateComment(c.id)}><Check className="w-3 h-3" /></Button>
                                </div>
                              ) : (
                                <p className="text-[13px] text-muted-foreground leading-relaxed break-words">{c.body}</p>
                              )}
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-[10px] font-medium text-muted-foreground/60">{new Date(c.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {commentsList.length === 0 && (
                          <div className="text-center py-10 px-4">
                            <MessageCircle className="w-8 h-8 mx-auto text-muted-foreground/20 mb-2" />
                            <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-tighter">No Comments yet</p>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>

                  {/* INPUT AREA */}
                  <div className="p-5 border-t border-border/50 bg-card">
                    <form onSubmit={handleSendComment} className="relative">
                      <Input 
                        placeholder="Join the discussion..." 
                        value={commentText} 
                        onChange={e => setCommentText(e.target.value)} 
                        className="bg-muted/50 border-none rounded-2xl pr-12 text-xs h-11 focus-visible:ring-1 focus-visible:ring-primary/20"
                      />
                      <Button 
                        type="submit" size="icon" 
                        className="absolute right-1.5 top-1.5 h-8 w-8 rounded-xl shadow-lg transition-transform active:scale-95" 
                        disabled={!commentText.trim()}
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}