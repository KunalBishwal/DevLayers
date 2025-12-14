"use client"

import { cn } from "@/app/lib/utils"
import { Sparkles, Trophy, Target, Zap, Star, Award } from "lucide-react"

interface AchievementBadgeProps {
  type: "streak" | "milestone" | "first" | "consistent" | "star" | "expert"
  title: string
  description?: string
  isUnlocked?: boolean
  className?: string
}

const badgeConfig = {
  streak: { icon: Sparkles, color: "text-orange-500", bg: "bg-orange-500/10" },
  milestone: { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  first: { icon: Target, color: "text-green-500", bg: "bg-green-500/10" },
  consistent: { icon: Zap, color: "text-primary", bg: "bg-primary/10" },
  star: { icon: Star, color: "text-accent", bg: "bg-accent/10" },
  expert: { icon: Award, color: "text-purple-500", bg: "bg-purple-500/10" },
}

export function AchievementBadge({ type, title, description, isUnlocked = true, className }: AchievementBadgeProps) {
  const config = badgeConfig[type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border border-border",
        "transition-all duration-200",
        isUnlocked ? "bg-card" : "bg-secondary/30 opacity-50",
        isUnlocked && "hover:border-primary/30 hover:shadow-md",
        className,
      )}
    >
      <div className={cn("p-2.5 rounded-lg", isUnlocked ? config.bg : "bg-muted")}>
        <Icon className={cn("w-5 h-5", isUnlocked ? config.color : "text-muted-foreground")} />
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}
