// lib/user-api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// --- TYPES ---
export interface UserProfile {
  id: number
  name: string
  email: string
  bio?: string
  profile_photo_url?: string
  created_at: string
}

export interface SocialLink {
  id: number
  label: string
  url: string
}

export interface Folder {
  id: number
  name: string
  description?: string
  visibility: "public" | "private"
  owner_id: number
}


export interface APIPost {
  id: number
  title: string
  body: string         // API uses 'body', UI uses 'content'
  visibility: "public" | "private"
  author_id: number
  folder_id: number | null
  images: { id: number; url: string }[]
  links: { id: number; url: string }[]
  created_at: string
}

// --- FETCH FUNCTIONS ---

// 1. Get Profile (Needs Token)
export async function fetchUserProfile(token: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.ok ? await res.json() : null
  } catch (error) {
    console.error("Profile fetch error:", error)
    return null
  }
}

// 2. Get Social Links (Needs User ID)
export async function fetchUserSocials(userId: number, token: string): Promise<SocialLink[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/social-links`, {
      headers: { Authorization: `Bearer ${token}` }, // Assuming this needs auth too
    })
    return res.ok ? await res.json() : []
  } catch (error) {
    console.error("Socials fetch error:", error)
    return []
  }
}

// 3. Get Folders (Needs User ID)
export async function fetchUserFolders(userId: number, token: string): Promise<Folder[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/folders/user/${userId}/folders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.ok ? await res.json() : []
  } catch (error) {
    console.error("Folders fetch error:", error)
    return []
  }
}




// 2. Get Posts inside a Folder

export async function getFolderPosts(token: string, folderId: string): Promise<APIPost[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/folders/${folderId}/posts`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (!res.ok) return []
    const data = await res.json()
    return data
    
  } catch (error) {
    console.error("Fetch posts error:", error)
    return []
  }
}