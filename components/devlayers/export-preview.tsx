"use client"

import { cn } from "@/app/lib/utils"
import { FileText, BookOpen, GraduationCap, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ExportPreviewProps {
  format: "documentation" | "blog" | "research"
  title: string
  content: string
  className?: string
}

const formatConfig = {
  documentation: {
    icon: FileText,
    label: "Documentation",
    description: "Clean, structured technical documentation",
  },
  blog: {
    icon: BookOpen,
    label: "Blog Series",
    description: "Engaging blog post format with storytelling",
  },
  research: {
    icon: GraduationCap,
    label: "Research Paper",
    description: "Academic style with citations and references",
  },
}

export function ExportPreview({ format, title, content, className }: ExportPreviewProps) {
  const config = formatConfig[format]
  const Icon = config.icon

  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{config.label}</p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>
        <Button size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Preview content */}
      <div className="p-6 max-h-[400px] overflow-y-auto">
        <article className="prose prose-invert prose-sm max-w-none">
          <h1 className="text-2xl font-bold mb-4">{title}</h1>
          <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{content}</div>
        </article>
      </div>
    </div>
  )
}
