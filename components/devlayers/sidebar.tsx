"use client"

import { cn } from "@/lib/utils"
import { Logo } from "./logo"
import { ThemeToggle } from "./theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FolderOpen,
  PenSquare,
  Globe,
  Settings,
  LogOut,
  Flame,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  BookOpen,
  Code,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

interface SidebarProps {
  user?: {
    name: string
    username: string
    avatar?: string
    streak: number
  }
  className?: string
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FolderOpen, label: "My Folders", href: "/folders" },
  { icon: PenSquare, label: "Create Post", href: "/create" },
  { icon: Globe, label: "Explore", href: "/explore" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
]

export function Sidebar({ user, className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex flex-col h-screen border-r border-border bg-card/50 backdrop-blur-sm",
        "transition-all duration-300 ease-out",
        collapsed ? "w-[72px]" : "w-[260px]",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <Logo size="sm" showText={!collapsed} />
        </Link>
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* User profile - Updated with Indian name */}
      {user && (
        <div className={cn("p-4 border-b border-border", collapsed && "flex justify-center")}>
          <div className={cn("flex items-center gap-3", collapsed && "flex-col")}>
            <Avatar className="w-10 h-10 ring-2 ring-primary/20">
              <AvatarImage
                src={user.avatar || "/placeholder.svg?height=40&width=40&query=indian man developer"}
                alt={user.name}
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
              </div>
            )}
          </div>

          {/* Streak indicator */}
          {!collapsed && user.streak > 0 && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-500">{user.streak} day streak</span>
            </div>
          )}
          {collapsed && user.streak > 0 && (
            <div className="mt-2 flex items-center justify-center gap-1 text-orange-500">
              <Flame className="w-4 h-4" />
              <span className="text-xs font-bold">{user.streak}</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 transition-all duration-200",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/15",
                  collapsed && "justify-center px-2",
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Quick folder access */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2 px-2">RECENT FOLDERS</p>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-sm">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="truncate">Learning React</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-sm">
              <Code className="w-4 h-4 text-accent" />
              <span className="truncate">Fintech SaaS</span>
            </Button>
          </div>
        </div>
      )}

      {/* Footer actions - Added ThemeToggle */}
      <div className="p-2 border-t border-border">
        {!collapsed && (
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center mb-1">
            <ThemeToggle />
          </div>
        )}
        <Link href="/settings">
          <Button variant="ghost" className={cn("w-full justify-start gap-3", collapsed && "justify-center px-2")}>
            <Settings className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Button>
        </Link>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive",
            collapsed && "justify-center px-2",
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </aside>
  )
}
