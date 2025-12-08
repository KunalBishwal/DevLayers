"use client"

import { FolderCard } from "@/components/devlayers/folder-card"
import { StreakTracker } from "@/components/devlayers/streak-tracker"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Github, Twitter, Globe, MapPin, Calendar, Users, BookOpen, Code } from "lucide-react"

const mockProfile = {
  name: "Priya Sharma",
  username: "priyasharma",
  bio: "Frontend developer passionate about React and design systems. Currently learning Rust. Building in public from Bangalore.",
  location: "Bangalore, India",
  website: "priyasharma.dev",
  joinedDate: "March 2024",
  followers: 1247,
  following: 324,
  github: "priyasharma",
  twitter: "priyasharmadev",
  avatar: "/indian-woman-professional-developer-headshot.jpg",
}

const mockPublicFolders = [
  {
    id: "1",
    title: "Learning React",
    description: "Deep diving into React 19 features and modern patterns.",
    type: "learning" as const,
    daysLogged: 67,
    totalDays: 100,
    isPublic: true,
    lastUpdated: "Today",
  },
  {
    id: "2",
    title: "Design System Library",
    description: "Building a comprehensive component library with Tailwind.",
    type: "project" as const,
    daysLogged: 34,
    totalDays: 50,
    isPublic: true,
    lastUpdated: "3 days ago",
  },
  {
    id: "3",
    title: "TypeScript Deep Dive",
    description: "Advanced TypeScript patterns and best practices.",
    type: "learning" as const,
    daysLogged: 45,
    totalDays: 60,
    isPublic: true,
    lastUpdated: "1 week ago",
  },
]

const mockContributions = Array.from({ length: 52 }, () =>
  Array.from({ length: 7 }, () => Math.floor(Math.random() * 8)),
)

export default function ProfilePage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Profile header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Avatar className="w-28 h-28 ring-4 ring-primary/20">
          <AvatarImage src={mockProfile.avatar || "/placeholder.svg"} alt={mockProfile.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-3xl">PS</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{mockProfile.name}</h1>
              <p className="text-muted-foreground">@{mockProfile.username}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Users className="w-4 h-4" />
                Follow
              </Button>
              <Button variant="ghost" size="icon">
                <Github className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <p className="text-foreground leading-relaxed max-w-2xl">{mockProfile.bio}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {mockProfile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {mockProfile.location}
              </span>
            )}
            {mockProfile.website && (
              <a
                href={`https://${mockProfile.website}`}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Globe className="w-4 h-4" />
                {mockProfile.website}
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Joined {mockProfile.joinedDate}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button className="hover:text-primary transition-colors">
              <span className="font-bold">{mockProfile.followers.toLocaleString()}</span>
              <span className="text-muted-foreground ml-1">followers</span>
            </button>
            <button className="hover:text-primary transition-colors">
              <span className="font-bold">{mockProfile.following}</span>
              <span className="text-muted-foreground ml-1">following</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">3</p>
            <p className="text-sm text-muted-foreground">Public Folders</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-accent/10">
            <Code className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold">146</p>
            <p className="text-sm text-muted-foreground">Days Logged</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-orange-500/10">
            <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
              />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold">24</p>
            <p className="text-sm text-muted-foreground">Best Streak</p>
          </div>
        </div>
      </div>

      {/* Contribution graph */}
      <StreakTracker currentStreak={18} longestStreak={24} contributions={mockContributions} />

      {/* Public folders */}
      <div>
        <Tabs defaultValue="folders">
          <TabsList>
            <TabsTrigger value="folders">Public Folders</TabsTrigger>
            <TabsTrigger value="likes">Liked Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="folders" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
              {mockPublicFolders.map((folder) => (
                <FolderCard key={folder.id} {...folder} onClick={() => {}} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-6">
            <div className="text-center py-12 text-muted-foreground">
              <p>No liked posts to display</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
