"use client"

import { cn } from "@/app/lib/utils"
import { Globe, Lock, MoreHorizontal } from "lucide-react"

interface FolderCardProps {
  id: string
  title: string
  description?: string
  isPublic: boolean
  className?: string
  onClick?: () => void
}

export function FolderCard({
  title,
  description,
  isPublic,
  className,
  onClick,
}: FolderCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer select-none",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:scale-[1.015]",
        className
      )}
    >
      {/* ================= Folder Tab ================= */}
      <div
        className={cn(
          "relative z-10 flex items-center gap-2",
          "px-4 py-2 w-fit max-w-[80%]",
          "rounded-t-xl",
          "bg-muted/70 backdrop-blur-md",
          "border border-border/50 border-b-0",
          "shadow-sm"
        )}
      >
        {isPublic ? (
          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
        )}

        <h3 className="text-sm font-medium text-foreground truncate">
          {title}
        </h3>
      </div>

      {/* ================= Folder Body ================= */}
      <div
        className={cn(
          "relative min-h-[150px] p-5",
          "rounded-xl rounded-tl-none",
          "bg-muted/50 backdrop-blur-xl",
          "border border-border/50",
          "shadow-[0_6px_20px_rgba(0,0,0,0.08)]",
          "overflow-hidden",
          "transition-shadow duration-300",
          "group-hover:shadow-[0_10px_28px_rgba(0,0,0,0.12)]"
        )}
      >
        {/* macOS inner highlight */}
        <div className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-b from-white/20 to-transparent dark:from-white/5" />

        {/* Content */}
        <p
          className={cn(
            "relative z-10 text-sm leading-relaxed",
            description
              ? "text-muted-foreground"
              : "italic text-muted-foreground/60"
          )}
        >
          {description || "No items inside"}
        </p>

        {/* Finder-style action */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        </div>
      </div>
    </div>
  )
}
