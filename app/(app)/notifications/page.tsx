"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/app/lib/utils"
import { Heart, MessageCircle, UserPlus, Star, Bookmark, Bell, Check, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface Notification {
  id: string
  type: "like" | "comment" | "follow" | "mention" | "achievement" | "bookmark"
  message: string
  user: {
    name: string
    username: string
    avatar: string
  }
  time: string
  isRead: boolean
  link?: string
  postTitle?: string
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "like",
    message: "liked your post",
    user: { name: "Priya Sharma", username: "priyasharma", avatar: "/indian-woman-developer-priya.jpg" },
    time: "2 minutes ago",
    isRead: false,
    postTitle: "Finally understood React Server Components!",
    link: "/folders/1/posts/67",
  },
  {
    id: "2",
    type: "comment",
    message: "commented on your post",
    user: { name: "Vikram Reddy", username: "vikramreddy", avatar: "/indian-man-developer-vikram.jpg" },
    time: "15 minutes ago",
    isRead: false,
    postTitle: "Day 23: Building custom hooks",
    link: "/folders/1/posts/23",
  },
  {
    id: "3",
    type: "follow",
    message: "started following you",
    user: { name: "Ananya Krishnan", username: "ananyak", avatar: "/indian-woman-tech-professional-ananya.jpg" },
    time: "1 hour ago",
    isRead: false,
    link: "/profile/ananyak",
  },
  {
    id: "4",
    type: "achievement",
    message: "You earned a new badge: 7 Day Streak!",
    user: { name: "DevLayers", username: "devlayers", avatar: "/devlayers-logo-abstract.jpg" },
    time: "2 hours ago",
    isRead: true,
  },
  {
    id: "5",
    type: "like",
    message: "liked your post",
    user: { name: "Rahul Verma", username: "rahulverma", avatar: "/indian-man-software-engineer-rahul.jpg" },
    time: "3 hours ago",
    isRead: true,
    postTitle: "Rust ownership model finally makes sense",
    link: "/folders/3/posts/12",
  },
  {
    id: "6",
    type: "bookmark",
    message: "bookmarked your post",
    user: { name: "Deepika Singh", username: "deepikas", avatar: "/indian-woman-coder-deepika.jpg" },
    time: "5 hours ago",
    isRead: true,
    postTitle: "Building a design system from scratch",
    link: "/folders/2/posts/34",
  },
  {
    id: "7",
    type: "mention",
    message: "mentioned you in a comment",
    user: { name: "Arjun Patel", username: "arjunpatel", avatar: "/indian-man-programmer-arjun.jpg" },
    time: "Yesterday",
    isRead: true,
    postTitle: "Learning TypeScript generics",
    link: "/folders/1/posts/20",
  },
  {
    id: "8",
    type: "comment",
    message: "replied to your comment",
    user: { name: "Sneha Iyer", username: "snehaiyer", avatar: "/indian-woman-developer-sneha.jpg" },
    time: "Yesterday",
    isRead: true,
    postTitle: "Day 45: Implementing real-time features",
    link: "/folders/2/posts/45",
  },
]

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "like":
      return <Heart className="w-4 h-4 text-red-500" />
    case "comment":
      return <MessageCircle className="w-4 h-4 text-blue-500" />
    case "follow":
      return <UserPlus className="w-4 h-4 text-green-500" />
    case "mention":
      return <span className="text-primary font-bold text-xs">@</span>
    case "achievement":
      return <Star className="w-4 h-4 text-yellow-500" />
    case "bookmark":
      return <Bookmark className="w-4 h-4 text-purple-500" />
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : "You're all caught up!"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2 bg-transparent">
            <Check className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="mentions">Mentions</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-2">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} onMarkAsRead={markAsRead} />
          ))}
        </TabsContent>

        <TabsContent value="unread" className="mt-6 space-y-2">
          {notifications.filter((n) => !n.isRead).length > 0 ? (
            notifications
              .filter((n) => !n.isRead)
              .map((notification) => (
                <NotificationItem key={notification.id} notification={notification} onMarkAsRead={markAsRead} />
              ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No unread notifications</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="mentions" className="mt-6 space-y-2">
          {notifications.filter((n) => n.type === "mention").length > 0 ? (
            notifications
              .filter((n) => n.type === "mention")
              .map((notification) => (
                <NotificationItem key={notification.id} notification={notification} onMarkAsRead={markAsRead} />
              ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <span className="text-4xl mb-4 block opacity-30">@</span>
              <p>No mentions yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NotificationItem({
  notification,
  onMarkAsRead,
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
}) {
  const content = (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl border transition-all duration-200",
        "hover:bg-secondary/50 cursor-pointer",
        notification.isRead ? "bg-card border-border" : "bg-primary/5 border-primary/20",
      )}
      onClick={() => onMarkAsRead(notification.id)}
    >
      {/* Avatar with icon overlay */}
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarImage src={notification.user.avatar || "/placeholder.svg"} alt={notification.user.name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {notification.user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-card border border-border">
          {getNotificationIcon(notification.type)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-semibold">{notification.user.name}</span>{" "}
          <span className="text-muted-foreground">{notification.message}</span>
        </p>
        {notification.postTitle && <p className="text-sm text-primary mt-1 truncate">"{notification.postTitle}"</p>}
        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!notification.isRead && <div className="w-2 h-2 rounded-full bg-primary" />}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>Mark as read</DropdownMenuItem>
            <DropdownMenuItem>Remove notification</DropdownMenuItem>
            <DropdownMenuItem>Turn off notifications from {notification.user.name}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  if (notification.link) {
    return <Link href={notification.link}>{content}</Link>
  }

  return content
}
