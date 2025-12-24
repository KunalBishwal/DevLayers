"use client"

import { cn } from "@/app/lib/utils"
import { Globe, Lock } from "lucide-react"

interface PrivacyToggleProps {
  isPublic: boolean
  onChange: (isPublic: boolean) => void
  className?: string
}

export function PrivacyToggle({ isPublic, onChange, className }: PrivacyToggleProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        onClick={() => onChange(false)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200",
          !isPublic
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:border-primary/30",
        )}
      >
        <Lock className="w-4 h-4" />
        <span className="text-sm font-medium">Private</span>
      </button>


      <button
        onClick={() => onChange(true)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200",
          isPublic
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:border-primary/30",
        )}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">Public</span>
      </button>
    </div>
  )
}
