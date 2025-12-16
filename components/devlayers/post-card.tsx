"use client"

import type React from "react"
import { useState } from "react"
import { cn } from "@/app/lib/utils"
import { Heart, MessageCircle, Share2, Bookmark, Github, MoreHorizontal, Pencil, ExternalLink, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define the Link structure
interface LinkItem {
  label: string
  url: string
}

interface PostCardProps {
  day: number
  title: string
  content: string
  author?: {
    name: string
    avatar?: string
    username: string
  }
  date: string
  likes?: number
  comments?: number
  // Updated Prop
  links?: LinkItem[]
  hasImage?: boolean
  imageUrl?: string
  tags?: string[]
  isLiked?: boolean
  isBookmarked?: boolean
  className?: string
  showDayBadge?: boolean
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function PostCard({
  day,
  title,
  content,
  author,
  date,
  likes = 0,
  comments = 0,
  links = [], 
  hasImage = false,
  imageUrl,
  tags = [],
  isLiked: initialIsLiked = false,
  isBookmarked: initialIsBookmarked = false,
  className,
  onClick,
  onEdit,
  onDelete,
  showDayBadge = true,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(likes)
  
  // (Comment logic omitted for brevity, keeping existing)
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  return (
    <article
      onClick={onClick}
      className={cn(
        "group relative rounded-xl border border-border bg-card p-5",
        "transition-all duration-200 ease-out cursor-pointer",
        "hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
        className,
      )}
    >
      {/* Badge & Header ... (Same as before) */}
       {showDayBadge && (
        <Badge
          variant="outline"
          className="absolute -top-2.5 left-4 bg-background border-primary/30 text-primary font-mono text-xs px-2 z-10"
        >
          Post #{day}
        </Badge>
      )}

      <div className="pt-2">
        <div className="flex justify-between items-start mb-4">
          {author && (
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 ring-2 ring-background">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback>{author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{author.name}</p>
                <p className="text-xs text-muted-foreground">@{author.username} · {date}</p>
              </div>
            </div>
          )}

          {onEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit() }}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit Post
                </DropdownMenuItem>
                {onDelete && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete() }} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4 whitespace-pre-line">
            {content}
        </p>

        {hasImage && imageUrl && (
          <div className="relative rounded-lg overflow-hidden mb-4 aspect-video bg-secondary">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1">
             <Button variant="ghost" size="sm" onClick={handleLike} className={cn("h-8 px-2 gap-1.5", isLiked && "text-red-500")}>
              <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
              <span className="text-xs">{likeCount}</span>
            </Button>
            {/* ... Other buttons ... */}
            <Button variant="ghost" size="sm" className="h-8 px-2"><MessageCircle className="w-4 h-4 mr-1"/> {comments}</Button>
            <Button variant="ghost" size="sm" className="h-8 px-2"><Share2 className="w-4 h-4" /></Button>
          </div>

          {/* DYNAMIC LINKS RENDERER */}
          <div className="flex items-center gap-1">
            {links && links.map((link, idx) => {
               // Check if label contains "github" (case insensitive) for specific icon
               const isGithub = link.label.toLowerCase().includes("github")
               
               return (
                 <a 
                   key={idx} 
                   href={link.url} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   onClick={(e) => e.stopPropagation()}
                   title={link.label}
                 >
                    <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
                      {isGithub ? <Github className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                      {!isGithub && <span className="text-[10px] uppercase font-bold">{link.label}</span>}
                    </Button>
                 </a>
               )
            })}
            
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}