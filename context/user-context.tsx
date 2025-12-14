"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  fetchUserProfile, 
  fetchUserSocials, 
  fetchUserFolders, 
  UserProfile, 
  SocialLink, 
  Folder 
} from "../app/lib/api/user_api"

interface UserContextType {
  user: UserProfile | null
  socialLinks: SocialLink[]
  folders: Folder[]
  isLoading: boolean
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  
  // Initialize state with data from localStorage (if it exists)
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("user_cache")
      return saved ? JSON.parse(saved) : null
    }
    return null
  })
  
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [isLoading, setIsLoading] = useState(!user) // Only load if we don't have cached user

  const loadData = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      // 1. Fetch Profile
      const profileData = await fetchUserProfile(token)

      if (!profileData) {
        // Token expired? Clear everything.
        localStorage.removeItem("token")
        localStorage.removeItem("user_cache") // Clear cache
        setUser(null)
        router.push("/login")
        return
      }

      // UPDATE STATE AND CACHE
      setUser(profileData)
      localStorage.setItem("user_cache", JSON.stringify(profileData)) // <--- SAVE TO LOCAL STORAGE

      // 2. Fetch dependencies
      const [socialsData, foldersData] = await Promise.all([
        fetchUserSocials(profileData.id, token),
        fetchUserFolders(profileData.id, token)
      ])

      setSocialLinks(socialsData)
      setFolders(foldersData)

    } catch (error) {
      console.error("Context load failed", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])



  return (
    <UserContext.Provider 
      value={{ 
        user, 
        socialLinks, 
        folders, 
        isLoading, 
        refreshUser: loadData, // Call this to reload data without refreshing page
       
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}