// @/lib/searchapi.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// ===============================
// COMMON TYPES
// ===============================

export interface Folder {
  id: number
  name: string
  description: string
  owner_id: number
  visibility: "public" | "private" | "anonymous"
}

export interface User {
  id: number
  name: string
  email: string
  profile_photo_url: string
}

// ===============================
// POST-RELATED TYPES
// ===============================

export interface PostImage {
  id?: number
  url: string
}

export interface PostLink {
  id?: number
  label?: string
  url: string
}

export interface PostAuthor {
  id: number
  name: string
  profile_photo_url: string
}

export interface Post {
  id: number
  title: string
  body: string
  tags: string | string[]
  visibility: "public" | "private" | "anonymous"

  // 👇 NEW (replaces author_id)
  author: PostAuthor

  folder_id: number | null
  created_at: string

  images: PostImage[]
  links: PostLink[]

  comments_count: number
  likes_count: number
  dislikes_count: number
  views_count: number
}

// ===============================
// SEARCH RESPONSE
// ===============================

export interface SearchResponse {
  query: string
  folders: Folder[]
  users: User[]
  posts: Post[]
}

// ===============================
// SEARCH API
// ===============================

export const searchContent = async (
  query: string
): Promise<SearchResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/search/all?q=${encodeURIComponent(query)}`
  )

  if (!response.ok) {
    throw new Error("Failed to fetch search results")
  }

  return response.json()
}

// ==========================================
// USER PROFILE (BY USER ID)
// ==========================================

export interface ProfileFolder {
  id: number
  name: string
  description: string
}

export interface ProfilePost {
  id: number
  title: string
  body: string
  tags: string | string[]
  visibility: "public" | "private" | "anonymous"
  created_at: string
  updated_at: string
  images: PostImage[]
  links: PostLink[]
}

export interface SocialLink {
  label: string
  url: string
}

export interface UserProfile extends User {
  bio: string
  created_at: string

  folders: ProfileFolder[]
  posts: ProfilePost[]

  followers: number
  is_follower: boolean

  social_links: SocialLink[]

  friendship_status:
    | "pending_recieved"
    | "none"
    | "pending_sent"
    | "friends"
}

// ===============================
// USER PROFILE API
// ===============================

export const getUserProfile = async (
  userId: string | number,
  token: string
): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch user profile")
  }

  return response.json()
}
