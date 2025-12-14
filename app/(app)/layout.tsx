"use client"

import type React from "react"

import { Sidebar } from "@/components/devlayers/sidebar"
import { NavHeader } from "@/components/devlayers/nav-header"
import { AuthGuard } from "@/app/(auth)/auth-guard" // Adjusted path based on clean structure
import { UserProvider } from "@/context/user-context"     // Import the context provider

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      {/* 1. Wrap the protected app in the UserProvider */}
      <UserProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          
          {/* 2. Sidebar no longer needs props; it will fetch data from Context internally */}
          <Sidebar />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <NavHeader variant="app" />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </UserProvider>
    </AuthGuard>
  )
}