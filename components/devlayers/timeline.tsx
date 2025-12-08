"use client"

import { cn } from "@/lib/utils"
import { PostCard } from "./post-card"

interface TimelinePost {
  id: string
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
}

interface TimelineProps {
  posts: TimelinePost[]
  className?: string
}

export function Timeline({ posts, className }: TimelineProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Timeline line - adjusted position */}
      <div className="absolute left-2 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />

      {/* Posts */}
      <div className="space-y-8 stagger-children">
        {posts.map((post, index) => (
          <div key={post.id} className="relative pl-8">
            {/* Timeline dot - adjusted position to align with card */}
            <div
              className={cn(
                "absolute left-0 top-8 w-4 h-4 rounded-full border-2 border-background",
                "bg-primary shadow-[0_0_10px_var(--glow)]",
                "transition-transform duration-200 hover:scale-125",
                "z-10",
              )}
            />

            <PostCard {...post} />
          </div>
        ))}
      </div>
    </div>
  )
}
