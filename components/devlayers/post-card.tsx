"use client"

import type React from "react"

import { cn } from "@/app/lib/utils"
import { Heart, MessageCircle, Share2, Bookmark, Github } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

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
  hasGithubLink?: boolean
  hasImage?: boolean
  imageUrl?: string
  tags?: string[]
  isLiked?: boolean
  isBookmarked?: boolean
  className?: string
  onClick?: () => void
  showDayBadge?: boolean
}

export function PostCard({
  day,
  title,
  content,
  author,
  date,
  likes = 0,
  comments = 0,
  hasGithubLink = false,
  hasImage = false,
  imageUrl,
  tags = [],
  isLiked: initialIsLiked = false,
  isBookmarked: initialIsBookmarked = false,
  className,
  onClick,
  showDayBadge = true,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(likes)
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)
  const [showComments, setShowComments] = useState(false)
  const [commentCount, setCommentCount] = useState(comments)
  const [newComment, setNewComment] = useState("")
  const [postComments, setPostComments] = useState<{ user: string; text: string; time: string }[]>([
    { user: "Priya Sharma", text: "Great insight! This helped me understand the concept better.", time: "2h ago" },
    { user: "Vikram Reddy", text: "Thanks for sharing your learning journey!", time: "4h ago" },
  ])

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsBookmarked(!isBookmarked)
  }

  const handleCommentToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowComments(!showComments)
  }

  const handleAddComment = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (newComment.trim()) {
      setPostComments((prev) => [{ user: "Kunal Bishwal", text: newComment, time: "Just now" }, ...prev])
      setCommentCount((prev) => prev + 1)
      setNewComment("")
    }
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
      {/* Day badge */}
      {showDayBadge && (
        <Badge
          variant="outline"
          className="absolute -top-2.5 left-4 bg-background border-primary/30 text-primary font-mono text-xs px-2 z-10"
        >
          Day {day}
        </Badge>
      )}

      <div className="pt-2">
        {/* Author info */}
        {author && (
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-10 h-10 ring-2 ring-background">
              <AvatarImage src={author.avatar || "/placeholder.svg"} alt={author.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {author.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{author.name}</p>
              <p className="text-xs text-muted-foreground">
                @{author.username} · {date}
              </p>
            </div>
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{title}</h3>

        {/* Content preview */}
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">{content}</p>

        {/* Image preview */}
        {hasImage && imageUrl && (
          <div className="relative rounded-lg overflow-hidden mb-4 aspect-video bg-secondary">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2 gap-1.5 transition-all duration-200",
                isLiked && "text-red-500 hover:text-red-600",
              )}
              onClick={handleLike}
            >
              <Heart className={cn("w-4 h-4 transition-transform", isLiked && "fill-current scale-110")} />
              <span className="text-xs">{likeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 px-2 gap-1.5", showComments && "text-primary")}
              onClick={handleCommentToggle}
            >
              <MessageCircle className={cn("w-4 h-4", showComments && "fill-current")} />
              <span className="text-xs">{commentCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={(e) => e.stopPropagation()}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            {hasGithubLink && (
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={(e) => e.stopPropagation()}>
                <Github className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 px-2 transition-all duration-200", isBookmarked && "text-primary")}
              onClick={handleBookmark}
            >
              <Bookmark className={cn("w-4 h-4 transition-transform", isBookmarked && "fill-current scale-110")} />
            </Button>
          </div>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t border-border space-y-4" onClick={(e) => e.stopPropagation()}>
            {/* Add comment input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment(e as unknown as React.MouseEvent)}
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-secondary border-none outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                Post
              </Button>
            </div>

            {/* Comments list */}
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {postComments.map((comment, index) => (
                <div key={index} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {comment.user.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{comment.user}</span>
                      <span className="text-xs text-muted-foreground">{comment.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
