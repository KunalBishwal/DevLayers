"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/app/lib/utils"
import { 
  Heart, 
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
  Maximize2
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

// --- Types ---
interface LinkItem {
  label: string
  url: string
}

interface Comment {
  id: string
  author: string
  avatar?: string
  text: string
  timestamp: string
}

interface PostCardProps {
  id: string // Unique ID is crucial for layout animations
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
  comments?: number
  links?: LinkItem[]
  hasImage?: boolean
  imageUrl?: string
  tags?: string[]
  isLiked?: boolean
  isBookmarked?: boolean
  className?: string
  showDayBadge?: boolean
  showActions?: boolean
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

// --- Hardcoded Comments Data ---
const MOCK_COMMENTS: Comment[] = [
  { id: "1", author: "Sarah Chen", avatar: "", text: "This is exactly what I was looking for! The clean UI approach is super helpful.", timestamp: "2h ago" },
  { id: "2", author: "Dev Mike", avatar: "", text: "Could you share the repo for the backend logic?", timestamp: "5h ago" },
  { id: "3", author: "Alex Design", avatar: "", text: "Love the transition effects. Very smooth.", timestamp: "1d ago" },
]

export function PostCard({
  id,
  day,
  title,
  content,
  author,
  date,
  likes = 0,
  comments: initialCommentCount = 0,
  links = [], 
  hasImage = false,
  imageUrl,
  tags = [],
  isLiked: initialIsLiked = false,
  isBookmarked: initialIsBookmarked = false,
  className,
  onEdit,
  onDelete,
  showDayBadge = true,
  showActions = false,
}: PostCardProps) {
  // State
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(likes)
  const [commentText, setCommentText] = useState("")
  const [commentsList, setCommentsList] = useState<Comment[]>(MOCK_COMMENTS)

  // Refs for click outside handling
  const cardRef = useRef<HTMLDivElement>(null)

  // --- Handlers ---

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  const handleSendComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    e?.stopPropagation()
    
    if (!commentText.trim()) return

    const newComment: Comment = {
      id: Date.now().toString(),
      author: "You", // In a real app, this comes from auth context
      text: commentText,
      timestamp: "Just now"
    }

    setCommentsList([newComment, ...commentsList])
    setCommentText("")
    
    // Auto expand if commenting from inline view to show the result
    if (!isExpanded) setIsExpanded(true)
  }

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsExpanded(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Lock body scroll when expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => { document.body.style.overflow = "unset" }
  }, [isExpanded])

  // --- Render Helpers ---

  const PostContent = ({ isFullView = false }: { isFullView?: boolean }) => (
    <>
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
           {/* If full view, show close button, otherwise show dropdown */}
           {isFullView ? (
             <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsExpanded(false)}>
               <X className="w-5 h-5" />
             </Button>
           ) : (
            <>
              {showActions && (onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit() }}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit Post
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete() }} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
           )}
        </div>
      </div>

      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      
      <p className={cn(
        "text-muted-foreground text-sm leading-relaxed whitespace-pre-line mb-4",
        !isFullView && "line-clamp-3" // Truncate only in inline view
      )}>
        {content}
      </p>

      {hasImage && imageUrl && (
        <div className="relative rounded-lg overflow-hidden mb-4 aspect-video bg-secondary">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-border mb-3">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLike} 
            className={cn("h-8 px-2 gap-1.5", isLiked && "text-red-500")}
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
            <span className="text-xs">{likeCount}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 gap-1.5"
            onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">{initialCommentCount}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          {links.map((link, idx) => (
            <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                {link.label.toLowerCase().includes("github") ? <Github className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
              </Button>
            </a>
          ))}
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Bookmark className={cn("w-4 h-4", initialIsBookmarked && "fill-current")} />
          </Button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* INLINE CARD (Feed View) 
        We use layoutId to connect this to the expanded view
      */}
      <motion.div
        layoutId={`card-${id}`}
        onClick={() => setIsExpanded(true)}
        className={cn(
          "group relative rounded-xl border border-border bg-card p-5 cursor-pointer",
          "hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-colors",
          className,
          // If expanded, we hide the inline card visually but keep it in DOM for layout stability
          isExpanded ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        {showDayBadge && (
          <Badge variant="outline" className="absolute -top-2.5 left-4 bg-background border-primary/30 text-primary font-mono text-xs px-2 z-10">
            Post #{day}
          </Badge>
        )}
        
        <div className="pt-2">
          <PostContent />
          
          {/* Inline Quick Comment Input */}
          <div className="flex gap-2 items-center mt-2" onClick={(e) => e.stopPropagation()}>
          
            <div className="relative flex-1">
              <Input 
                placeholder="Write a comment..." 
                className="h-9 pr-8 text-sm bg-muted/30 border-none focus-visible:ring-1"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
              />
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-primary"
                onClick={handleSendComment}
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>


      {/* EXPANDED OVERLAY (Focus View)
        Renders on top of everything
      */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />

            {/* Centered Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <motion.div
                layoutId={`card-${id}`}
                className="w-full max-w-2xl bg-card rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto border border-border"
              >
                {/* Scrollable Content Area */}
                <ScrollArea className="flex-1 p-0">
                  <div className="p-6">
                    {/* Reuse content but allow full expansion */}
                    <PostContent isFullView />

                    <div className="my-6 border-t border-border" />

                    {/* Comments Section */}
                    <div className="space-y-6">
                      <h4 className="font-semibold text-sm text-muted-foreground">
                        Comments ({commentsList.length})
                      </h4>
                      
                      {commentsList.map((comment) => (
                        <div key={comment.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{comment.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                            </div>
                            <p className="text-sm text-foreground/90 leading-relaxed">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>

                {/* Sticky Footer Input */}
                <div className="p-4 bg-background border-t border-border mt-auto">
                  <form 
                    onSubmit={handleSendComment}
                    className="flex gap-3 items-end"
                  >
                
                    <div className="flex-1 relative">
                       <Input 
                        placeholder="Write a thoughtful comment..." 
                        className="min-h-[44px] pr-12 bg-muted/50"
                        autoFocus
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      />
                      <Button 
                        type="submit" 
                        size="icon" 
                        className="absolute right-1 top-1 bottom-1 h-auto w-10 rounded-md"
                        disabled={!commentText.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}