"use client"

import { cn } from "@/lib/utils"
import { BookOpen, Code, MoreHorizontal, Lock, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface FolderCardProps {
  title: string
  description?: string
  type: "learning" | "project"
  daysLogged: number
  totalDays: number
  isPublic?: boolean
  lastUpdated?: string
  hasRecentUpdate?: boolean
  className?: string
  onClick?: () => void
}

export function FolderCard({
  title,
  description,
  type,
  daysLogged,
  totalDays,
  isPublic = false,
  lastUpdated,
  hasRecentUpdate = false,
  className,
  onClick,
}: FolderCardProps) {
  const progress = totalDays > 0 ? (daysLogged / totalDays) * 100 : 0

  const gradients = {
    learning: "from-primary/20 via-primary/10 to-transparent",
    project: "from-accent/20 via-accent/10 to-transparent",
  }

  const icons = {
    learning: BookOpen,
    project: Code,
  }

  const Icon = icons[type]

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative rounded-xl border border-border bg-card p-5 cursor-pointer",
        "transition-all duration-200 ease-out",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        "hover:-translate-y-1 hover:scale-[1.02]",
        "active:scale-[0.99]",
        className,
      )}
    >
      {/* Gradient overlay */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 transition-opacity duration-300",
          "group-hover:opacity-100",
          gradients[type],
        )}
      />

      {/* Recent update pulse indicator */}
      {hasRecentUpdate && (
        <div className="absolute -top-1 -right-1 w-3 h-3">
          <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-75" />
          <span className="absolute inset-0 rounded-full bg-success" />
        </div>
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div
            className={cn(
              "p-2 rounded-lg transition-colors duration-200",
              type === "learning" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent",
            )}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2">
            {isPublic ? (
              <Globe className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Lock className="w-4 h-4 text-muted-foreground" />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Folder</DropdownMenuItem>
                <DropdownMenuItem>Share</DropdownMenuItem>
                <DropdownMenuItem>Export</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{title}</h3>
        {description && <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{description}</p>}

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {daysLogged} / {totalDays} days
            </span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                type === "learning" ? "bg-primary" : "bg-accent",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        {lastUpdated && <p className="text-xs text-muted-foreground mt-3">Updated {lastUpdated}</p>}
      </div>
    </div>
  )
}
