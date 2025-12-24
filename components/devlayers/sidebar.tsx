"use client"

import { cn } from "@/app/lib/utils"
import { ThemeToggle } from "./theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  PenSquare,
  Globe,
  Settings,
  LogOut,
  Flame,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle,
  NewspaperIcon,
  UsersRound,
  Folder,
  Bookmark,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { useUser } from "@/context/user-context"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface SidebarProps {
  user?: {
    name: string
    username: string
    avatar?: string
    streak: number
  }
  className?: string
}

const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: NewspaperIcon, label: "My Posts", href: "/all_posts" },
  { icon: PenSquare, label: "Create Post", href: "/create" },
  { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
]

const exploreNavItems = [
  { icon: Globe, label: "Explore", href: "/explore" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: UsersRound, label: "Community", href: "/community" },
]

export function Sidebar({ user, className }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { folders } = useUser()

  const handleSignOut = async () => {
    setIsSigningOut(true)
    setError(null)
    const token = localStorage.getItem("token")
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/signout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      }
    } catch (err) {
      setError("Logout failed. Local session cleared.")
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("user_cache")
      router.push("/login")
      setIsSigningOut(false)
    }
  }

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => {
    const isActive = pathname === item.href
    return (
      <Link href={item.href} className="relative group">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 transition-all duration-200 mb-1 relative overflow-hidden",
            isActive 
              ? "bg-primary/10 text-primary hover:bg-primary/15 font-semibold" 
              : "text-muted-foreground hover:text-foreground hover:bg-accent",
            collapsed && "justify-center px-0",
          )}
        >
          {isActive && !collapsed && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full" />
          )}
          <item.icon className={cn("w-5 h-5 shrink-0 transition-transform", !isActive && "group-hover:scale-110")} />
          {!collapsed && <span className="text-[14px]">{item.label}</span>}
        </Button>
      </Link>
    )
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-screen border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-[80px]" : "w-[280px]",
        className,
      )}
    >
      {/* Header Section: Swaps between Logo and Expand Button */}
      <div className={cn(
        "h-[70px] flex items-center border-b border-border/50 px-4 transition-all duration-300",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed ? (
          <>
            <Link href="/dashboard" className="flex items-center gap-3 group px-2">
              <div className="relative w-8 h-8 shrink-0">
                <Image 
                  src="/icon.png" 
                  alt="Develayers Logo" 
                  fill 
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Develayers
              </span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-8 h-8 rounded-full hover:bg-accent shrink-0" 
              onClick={() => setCollapsed(true)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-12 h-12 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 transition-all" 
            onClick={() => setCollapsed(false)}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        )}
      </div>

      {/* Profile Section */}
      {user && (
        <div className={cn("p-4 mx-2 mt-4 rounded-xl transition-all duration-300", !collapsed && "bg-accent/30")}>
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <Avatar className="w-10 h-10 border-2 border-background shadow-sm shrink-0">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-none truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate mt-1">@{user.username}</p>
              </div>
            )}
          </div>

          {!collapsed && user.streak > 0 && (
            <div className="mt-3 flex items-center justify-between px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Streak</span>
              </div>
              <span className="text-sm font-black text-orange-600">{user.streak}</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4 space-y-6 overflow-y-auto no-scrollbar">
        <div>
          {!collapsed && <p className="text-[10px] font-bold text-muted-foreground/50 px-3 mb-2 uppercase tracking-[0.2em]">General</p>}
          {mainNavItems.map((item) => <NavItem key={item.href} item={item} />)}
        </div>

        <div>
          {!collapsed && <p className="text-[10px] font-bold text-muted-foreground/50 px-3 mb-2 uppercase tracking-[0.2em]">Discovery</p>}
          {exploreNavItems.map((item) => <NavItem key={item.href} item={item} />)}
        </div>

        {!collapsed && folders && folders.length > 0 && (
          <div className="pt-2">
            <p className="text-[10px] font-bold text-muted-foreground/50 px-3 mb-2 uppercase tracking-[0.2em]">Recent Folders</p>
            <div className="space-y-0.5">
              {folders.slice(0, 3).map((folder) => (
                <Button key={folder.id} variant="ghost" className="w-full justify-start gap-3 h-8 text-[13px] text-muted-foreground hover:text-primary"
                onClick={() => router.push(`/folders/${folder.id}`)}>
                  <Folder className="w-4 h-4 text-primary/60" />
                  <span className="truncate font-normal">{folder.name}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-border/50 space-y-1">
        <div className={cn("flex items-center mb-2 px-2", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && <span className="text-xs font-medium text-muted-foreground">Theme</span>}
          <ThemeToggle />
        </div>

        <Link href="/settings">
          <Button variant="ghost" className={cn("w-full justify-start gap-3 text-muted-foreground", collapsed && "justify-center")}>
            <Settings className="w-5 h-5" />
            {!collapsed && <span className="text-sm">Settings</span>}
          </Button>
        </Link>

        <Button
          onClick={handleSignOut}
          variant="ghost"
          disabled={isSigningOut}
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
            collapsed && "justify-center"
          )}
        >
          {isSigningOut ? (
            <div className="w-5 h-5 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </Button>
        
        {error && !collapsed && (
          <div className="mt-2 p-2 rounded-lg bg-destructive/10 flex items-center gap-2 text-destructive border border-destructive/20">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span className="text-[10px] font-bold uppercase leading-none">{error}</span>
          </div>
        )}
      </div>
    </aside>
  )
}