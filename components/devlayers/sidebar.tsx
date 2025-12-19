
import { cn } from "@/app/lib/utils"
import { Logo } from "./logo"
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
  Bell,
  BookOpen,
  Code,
  AlertCircle,
  NewspaperIcon,
  UsersRound,
  Folder, // Added for potential error state, though signout is mostly local
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation" // Import useRouter
import { useState } from "react"
import { useUser } from "@/context/user-context"

// Define the API Base URL (used for the signout call)
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

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  {icon:NewspaperIcon,label:"My Posts",href:"/all_posts"},
  { icon: PenSquare, label: "Create Post", href: "/create" },
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

  //recent folder
  const {folders} = useUser()


  const handleSignOut = async () => {
    setIsSigningOut(true)
    setError(null)
    
    // 1. Get the current token
    const token = localStorage.getItem("token")

    try {
      // 2. Call the signout API endpoint (optional but good practice to invalidate server-side session/token)
      if (token) {
        // The API specified doesn't require a body, just an auth token, but since it's a POST, we include a minimal header
        const response = await fetch(`${API_BASE_URL}/auth/signout`, {
          method: "POST",
          headers: {
            // Note: Your curl example did not include an Authorization header.
            // In a real scenario, you should send the access token here,
            // typically in the Authorization: Bearer <token> header.
            // For this example, we'll only send the Content-Type header as per your provided curl data.
            "Content-Type": "application/json", 
          },
        })

        // Handle successful signout message from the API
        if (!response.ok) {
           // We can log the error but still proceed with local signout
           console.error("Server signout failed but proceeding with local signout.")
        }
      }

    } catch (err) {
      // Handle network errors
      setError("Network error during signout. Logging out locally.")
    } finally {
      // 3. Clear the token and local user data
      localStorage.removeItem("token")
      localStorage.removeItem("user_cache")

      // 4. Redirect to the login page
      router.push("/login")
      
      setIsSigningOut(false)
    }
  }

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

      {/* User profile */}
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
          <p className="text-xs font-medium text-muted-foreground mb-2 px-2">
            RECENT FOLDERS
          </p>

          <div className="space-y-1">
            {folders && folders.length > 0 ? (
              folders.slice(0, 2).map((folder) => (
                <Button
                  key={folder.id}
                  variant="ghost"
                  className="w-full justify-start gap-2 h-9 text-sm"
                >
                  <Folder className="w-4 h-4 text-primary" />
                  <span className="truncate">{folder.name}</span>
                </Button>
              ))
            ) : (
              <div className="text-xs text-muted-foreground italic px-2">
                No recent folders.
              </div>
            )}
          </div>
        </div>
      )}

      
      {/* Error display (if any) */}
      {error && !collapsed && (
          <div className="p-2 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-xs">{error}</span>
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
          onClick={handleSignOut} // Attached the signout handler
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive",
            collapsed && "justify-center px-2",
          )}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <div className="w-5 h-5 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin shrink-0" />
          ) : (
            <LogOut className="w-5 h-5 shrink-0" />
          )}
          {!collapsed && <span>{isSigningOut ? "Signing Out..." : "Sign Out"}</span>}
        </Button>
      </div>
    </aside>
  )
}