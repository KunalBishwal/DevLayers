"use client"

import { cn } from "@/lib/utils"
import { Flame, TrendingUp } from "lucide-react"

interface StreakTrackerProps {
  currentStreak: number
  longestStreak: number
  contributions: number[][]
  className?: string
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAYS = ["Mon", "Wed", "Fri"]

export function StreakTracker({ currentStreak, longestStreak, contributions, className }: StreakTrackerProps) {
  const getIntensity = (count: number) => {
    if (count === 0) return "bg-muted/50"
    if (count <= 2) return "bg-primary/30"
    if (count <= 4) return "bg-primary/50"
    if (count <= 6) return "bg-primary/70"
    return "bg-primary"
  }

  const getMonthLabels = () => {
    const labels: { month: string; weekIndex: number }[] = []
    const today = new Date()
    let lastMonth = -1

    contributions.forEach((_, weekIndex) => {
      const weekDate = new Date(today)
      weekDate.setDate(weekDate.getDate() - (contributions.length - 1 - weekIndex) * 7)
      const month = weekDate.getMonth()

      if (month !== lastMonth) {
        lastMonth = month
        labels.push({ month: MONTHS[month], weekIndex })
      }
    })

    return labels
  }

  const monthLabels = getMonthLabels()
  const visibleWeeks = contributions.slice(-20)
  const visibleMonthLabels = monthLabels.filter((l) => l.weekIndex >= contributions.length - 20)

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      {/* Stats row */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-xl font-bold">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xl font-bold">{longestStreak}</p>
            <p className="text-xs text-muted-foreground">Longest Streak</p>
          </div>
        </div>
      </div>

      {/* Activity label */}
      <p className="text-xs text-muted-foreground mb-2">Activity this year</p>

      <div className="overflow-hidden">
        {/* Month labels row */}
        <div className="flex mb-1 ml-8">
          {visibleMonthLabels.map((label, index) => {
            const adjustedIndex = label.weekIndex - (contributions.length - 20)
            if (adjustedIndex < 0) return null
            return (
              <span
                key={index}
                className="text-[10px] text-muted-foreground"
                style={{
                  marginLeft:
                    index === 0
                      ? `${adjustedIndex * 12}px`
                      : `${(adjustedIndex - (visibleMonthLabels[index - 1]?.weekIndex - (contributions.length - 20) || 0)) * 12 - 24}px`,
                }}
              >
                {label.month}
              </span>
            )
          })}
        </div>

        {/* Grid with day labels */}
        <div className="flex gap-1">
          {/* Day labels column */}
          <div className="flex flex-col justify-around pr-1 py-0.5">
            {DAYS.map((day) => (
              <span key={day} className="text-[10px] text-muted-foreground leading-none h-[10px] flex items-center">
                {day}
              </span>
            ))}
          </div>

          {/* Contribution grid */}
          <div className="flex gap-[3px]">
            {visibleWeeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((count, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={cn(
                      "w-[10px] h-[10px] rounded-[2px] transition-all duration-200",
                      "hover:ring-1 hover:ring-primary/50 hover:scale-125",
                      getIntensity(count),
                    )}
                    title={`${count} contributions`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-[3px]">
            <div className="w-[10px] h-[10px] rounded-[2px] bg-muted/50" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-primary/30" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-primary/50" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-primary/70" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-primary" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
