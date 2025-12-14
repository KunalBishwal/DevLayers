"use client"

import { cn } from "@/app/lib/utils"
import { Bold, Italic, Code, Link, ImageIcon, List, ListOrdered, Quote, Heading1, Heading2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content here...",
  className,
}: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false)

  const tools = [
    { icon: Heading1, label: "Heading 1" },
    { icon: Heading2, label: "Heading 2" },
    { icon: Bold, label: "Bold" },
    { icon: Italic, label: "Italic" },
    { icon: Code, label: "Code" },
    { icon: Link, label: "Link" },
    { icon: ImageIcon, label: "Image" },
    { icon: List, label: "Bullet List" },
    { icon: ListOrdered, label: "Numbered List" },
    { icon: Quote, label: "Quote" },
  ]

  return (
    <div
      className={cn(
        "rounded-xl border bg-card transition-all duration-200",
        isFocused ? "border-primary ring-2 ring-primary/20" : "border-border",
        className,
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border flex-wrap">
        {tools.map((tool, index) => (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            className="w-8 h-8 transition-colors hover:bg-primary/10 hover:text-primary"
            title={tool.label}
          >
            <tool.icon className="w-4 h-4" />
          </Button>
        ))}
      </div>

      {/* Editor area */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={cn(
          "w-full min-h-[300px] p-4 bg-transparent resize-none",
          "text-foreground placeholder:text-muted-foreground",
          "focus:outline-none leading-relaxed",
        )}
      />
    </div>
  )
}
