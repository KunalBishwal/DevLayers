"use client"

import { FolderCard } from "@/components/devlayers/folder-card"
import { CreateFolderCard } from "@/components/devlayers/create-folder-card"
import { StreakTracker } from "@/components/devlayers/streak-tracker"
import { AchievementBadge } from "@/components/devlayers/achievement-badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Grid3X3, List, Plus, Sparkles } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

const mockFolders = [
  {
    id: "1",
    title: "Learning React",
    description: "Deep diving into React 19 features, hooks patterns, and server components.",
    type: "learning" as const,
    daysLogged: 23,
    totalDays: 100,
    isPublic: true,
    lastUpdated: "2 hours ago",
    hasRecentUpdate: true,
  },
  {
    id: "2",
    title: "Fintech SaaS Project",
    description: "Building a UPI-based payment dashboard with Next.js and Razorpay integration.",
    type: "project" as const,
    daysLogged: 45,
    totalDays: 60,
    isPublic: false,
    lastUpdated: "Yesterday",
    hasRecentUpdate: false,
  },
  {
    id: "3",
    title: "Rust Journey",
    description: "Learning systems programming with Rust. From basics to advanced concepts.",
    type: "learning" as const,
    daysLogged: 12,
    totalDays: 100,
    isPublic: true,
    lastUpdated: "3 days ago",
    hasRecentUpdate: false,
  },
  {
    id: "4",
    title: "AI Chatbot Project",
    description: "Building an AI-powered customer support chatbot using OpenAI and LangChain.",
    type: "project" as const,
    daysLogged: 8,
    totalDays: 30,
    isPublic: true,
    lastUpdated: "1 week ago",
    hasRecentUpdate: true,
  },
]

const mockContributions = Array.from({ length: 52 }, () =>
  Array.from({ length: 7 }, () => Math.floor(Math.random() * 8)),
)

const mockAchievements = [
  { type: "streak" as const, title: "7 Day Streak", description: "Logged for 7 days in a row" },
  { type: "first" as const, title: "First Folder", description: "Created your first folder" },
  { type: "consistent" as const, title: "Consistent Logger", description: "Logged 30 total days" },
  { type: "star" as const, title: "Rising Star", description: "Got 10 likes on a post", isUnlocked: false },
]

export default function DashboardPage() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [newFolderTitle, setNewFolderTitle] = useState("")
  const [newFolderDesc, setNewFolderDesc] = useState("")
  const [newFolderType, setNewFolderType] = useState<"learning" | "project">("learning")
  const [newFolderDays, setNewFolderDays] = useState("100")
  const router = useRouter()

  const handleFolderClick = (folderId: string) => {
    router.push(`/folders/${folderId}`)
  }

  const handleCreateFolder = () => {
    // In a real app, this would create the folder
    setShowCreateFolder(false)
    setNewFolderTitle("")
    setNewFolderDesc("")
    setNewFolderType("learning")
    setNewFolderDays("100")
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header - Updated with Indian name */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Kunal</h1>
          <p className="text-muted-foreground mt-1">Keep the momentum going — you're on a 12-day streak!</p>
        </div>
        <Button className="gap-2 glow-sm press-effect" onClick={() => setShowCreateFolder(true)}>
          <Plus className="w-4 h-4" />
          New Folder
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid md:grid-cols-2 gap-6">
        <StreakTracker currentStreak={12} longestStreak={24} contributions={mockContributions} />

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Recent Achievements</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {mockAchievements.map((achievement, index) => (
              <AchievementBadge key={index} {...achievement} />
            ))}
          </div>
        </div>
      </div>

      {/* Folders section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Tabs defaultValue="all" className="w-auto">
            <TabsList>
              <TabsTrigger value="all">All Folders</TabsTrigger>
              <TabsTrigger value="learning">Learning</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="w-8 h-8"
              onClick={() => setView("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              className="w-8 h-8"
              onClick={() => setView("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div
          className={
            view === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children" : "space-y-3 stagger-children"
          }
        >
          {mockFolders.map((folder) => (
            <FolderCard key={folder.id} {...folder} onClick={() => handleFolderClick(folder.id)} />
          ))}
          <CreateFolderCard onClick={() => setShowCreateFolder(true)} />
        </div>
      </div>

      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-title">Folder Name</Label>
              <Input
                id="folder-title"
                placeholder="e.g., Learning TypeScript"
                value={newFolderTitle}
                onChange={(e) => setNewFolderTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="folder-desc">Description</Label>
              <Textarea
                id="folder-desc"
                placeholder="What's this folder about?"
                value={newFolderDesc}
                onChange={(e) => setNewFolderDesc(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newFolderType} onValueChange={(v: "learning" | "project") => setNewFolderType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="folder-days">Target Days</Label>
                <Input
                  id="folder-days"
                  type="number"
                  placeholder="100"
                  value={newFolderDays}
                  onChange={(e) => setNewFolderDays(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFolder(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderTitle.trim()}>
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
