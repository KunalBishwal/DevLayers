"use client"

import { cn } from "@/app/lib/utils"
import { PostCard } from "./post-card"

export interface TimelinePost {
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
  comments?: number
  githubLink?: string
  liveLink?: string
  hasImage?: boolean
  imageUrl?: string
  tags?: string[]
  isLiked?: boolean
  isBookmarked?: boolean
  rawVisibility?: "public" | "private"
  links?: Array<{ label: string; url: string }>
}

interface TimelineProps {
  posts: TimelinePost[]
  className?: string
  onEdit?: (post: TimelinePost) => void
  onDelete?: (postId: string) => void
  isOwner?: boolean
}

export function Timeline({ posts, className, onEdit, onDelete, isOwner = false }: TimelineProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-2 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />

      <div className="space-y-8 stagger-children">
        {posts.map((post) => (
          <div key={post.id} className="relative pl-8">
            <div
              className={cn(
                "absolute left-0 top-8 w-4 h-4 rounded-full border-2 border-background",
                "bg-primary shadow-[0_0_10px_var(--glow)]",
                "transition-transform duration-200 hover:scale-125",
                "z-10",
              )}
            />
            <PostCard 
              {...post} 
              onEdit={isOwner && onEdit ? () => onEdit(post) : undefined}
              onDelete={isOwner && onDelete ? () => onDelete(post.id.toString()) : undefined}
              showActions={isOwner}
            />
          </div>
        ))}
      </div>
    </div>
  )
}