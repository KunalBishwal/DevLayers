"use client"

import { cn } from "@/app/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  }

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("relative", sizes[size])}>
        {/* Layered squares representing "layers" */}
        <div className="absolute inset-0 bg-primary/30 rounded-md transform rotate-12 transition-transform group-hover:rotate-6" />
        <div className="absolute inset-0 bg-primary/50 rounded-md transform rotate-6 transition-transform group-hover:rotate-3" />
        <div className="absolute inset-0 bg-primary rounded-md flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-1/2 h-1/2 text-primary-foreground"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
      </div>
      {showText && <span className={cn("font-semibold tracking-tight", textSizes[size])}>DevLayers</span>}
    </div>
  )
}
