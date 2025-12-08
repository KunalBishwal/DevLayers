"use client"

import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface DaySelectorProps {
  totalDays: number
  currentDay: number
  onDayChange: (day: number) => void
  className?: string
}

export function DaySelector({ totalDays, currentDay, onDayChange, className }: DaySelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const visibleDays = isExpanded ? totalDays : Math.min(7, totalDays)
  const startDay = isExpanded ? 1 : Math.max(1, currentDay - 3)

  return (
    <div className={cn("flex items-center gap-2 p-2 rounded-xl bg-secondary/50 backdrop-blur-sm", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8"
        onClick={() => onDayChange(Math.max(1, currentDay - 1))}
        disabled={currentDay <= 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="flex items-center gap-1 overflow-x-auto py-1 px-1">
        {Array.from({ length: visibleDays }, (_, i) => {
          const day = startDay + i
          if (day > totalDays) return null
          return (
            <Button
              key={day}
              variant={currentDay === day ? "default" : "ghost"}
              size="sm"
              className={cn(
                "w-10 h-10 rounded-lg font-mono text-sm transition-all duration-200",
                currentDay === day && "bg-primary text-primary-foreground glow-sm",
              )}
              onClick={() => onDayChange(day)}
            >
              {day}
            </Button>
          )
        })}

        {!isExpanded && totalDays > 7 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-10 px-2 text-muted-foreground"
            onClick={() => setIsExpanded(true)}
          >
            +{totalDays - 7}
          </Button>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8"
        onClick={() => onDayChange(Math.min(totalDays, currentDay + 1))}
        disabled={currentDay >= totalDays}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button variant="ghost" size="icon" className="w-8 h-8">
        <Calendar className="w-4 h-4" />
      </Button>
    </div>
  )
}
