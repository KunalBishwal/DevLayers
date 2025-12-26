"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  fetchUserProfile,
  fetchUserSocials,
  fetchUserFolders,
  UserProfile,
  SocialLink,
  Folder,
} from "../app/lib/api/user_api"

interface UserContextType {
  user: UserProfile | null
  socialLinks: SocialLink[]
  folders: Folder[]
  isLoading: boolean
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const USER_CACHE_KEY = "user_cache_v2"

interface UserCache {
  user: UserProfile
  socials: SocialLink[]
  folders: Folder[]
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const [user, setUser] = useState<UserProfile | null>(null)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  /* =======================
     LOAD FROM CACHE
  ======================= */
  useEffect(() => {
    const cached = localStorage.getItem(USER_CACHE_KEY)
    if (cached) {
      const parsed: UserCache = JSON.parse(cached)
      setUser(parsed.user)
      setSocialLinks(parsed.socials)
      setFolders(parsed.folders)
      setIsLoading(false)
    }
  }, [])

  /* =======================
     LOAD FROM BACKEND (ONLY IF NEEDED)
  ======================= */
  const loadData = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)

      const profileData = await fetchUserProfile(token)

      if (!profileData) {
        localStorage.removeItem("token")
        localStorage.removeItem(USER_CACHE_KEY)
        setUser(null)
        router.push("/login")
        return
      }

      const [socials, folders] = await Promise.all([
        fetchUserSocials(profileData.id, token),
        fetchUserFolders(profileData.id, token),
      ])

      const cache: UserCache = {
        user: profileData,
        socials,
        folders,
      }

      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cache))

      setUser(profileData)
      setSocialLinks(socials)
      setFolders(folders)
    } catch (err) {
      console.error("User context load failed", err)
    } finally {
      setIsLoading(false)
    }
  }

  /* =======================
     FETCH ONLY IF NO CACHE
  ======================= */
  useEffect(() => {
    const cached = localStorage.getItem(USER_CACHE_KEY)
    if (!cached) {
      loadData()
    }
  }, [])

  return (
    <UserContext.Provider
      value={{
        user,
        socialLinks,
        folders,
        isLoading,
        refreshUser: loadData,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within UserProvider")
  return ctx
}
