"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface FolderTreeAnimationProps {
  className?: string
}

export function FolderTreeAnimation({ className }: FolderTreeAnimationProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const folders = [
    { name: "learning-react", type: "learning", level: 0, delay: 0 },
    { name: "day-01.md", type: "file", level: 1, delay: 100 },
    { name: "day-02.md", type: "file", level: 1, delay: 200 },
    { name: "day-03.md", type: "file", level: 1, delay: 300 },
    { name: "saas-project", type: "project", level: 0, delay: 400 },
    { name: "architecture.md", type: "file", level: 1, delay: 500 },
    { name: "day-01.md", type: "file", level: 1, delay: 600 },
    { name: "links.json", type: "file", level: 1, delay: 700 },
    { name: "rust-journey", type: "learning", level: 0, delay: 800 },
    { name: "day-01.md", type: "file", level: 1, delay: 900 },
  ]

  return (
    <div className={cn("font-mono text-sm space-y-1", className)}>
      {folders.map((item, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center gap-2 opacity-0 -translate-x-4",
            "transition-all duration-500 ease-out",
            mounted && "opacity-100 translate-x-0",
          )}
          style={{
            paddingLeft: `${item.level * 1.5}rem`,
            transitionDelay: `${item.delay}ms`,
          }}
        >
          {item.type === "learning" && <span className="text-primary">📚</span>}
          {item.type === "project" && <span className="text-accent">💻</span>}
          {item.type === "file" && <span className="text-muted-foreground">📄</span>}
          <span className={cn(item.type !== "file" ? "text-foreground font-medium" : "text-muted-foreground")}>
            {item.name}
          </span>
        </div>
      ))}
    </div>
  )
}
