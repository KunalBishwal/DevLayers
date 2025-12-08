"use client"

import type React from "react"

import { Sidebar } from "@/components/devlayers/sidebar"
import { NavHeader } from "@/components/devlayers/nav-header"

const mockUser = {
  name: "Kunal Bishwal",
  username: "kunalbishwal",
  avatar: "/indian-man-developer-kunal.jpg",
  streak: 12,
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar user={mockUser} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavHeader variant="app" />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
