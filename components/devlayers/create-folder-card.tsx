"use client"

import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

interface CreateFolderCardProps {
  className?: string
  onClick?: () => void
}

export function CreateFolderCard({ className, onClick }: CreateFolderCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative rounded-xl border-2 border-dashed border-border p-5",
        "flex flex-col items-center justify-center gap-3 min-h-[200px]",
        "transition-all duration-200 ease-out cursor-pointer",
        "hover:border-primary/50 hover:bg-primary/5",
        "active:scale-[0.98]",
        className,
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-full bg-secondary flex items-center justify-center",
          "transition-all duration-300 ease-out",
          "group-hover:bg-primary group-hover:scale-110 group-hover:rotate-90",
        )}
      >
        <Plus
          className={cn(
            "w-6 h-6 text-muted-foreground transition-colors duration-200",
            "group-hover:text-primary-foreground",
          )}
        />
      </div>
      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        Create New Folder
      </span>
    </button>
  )
}
