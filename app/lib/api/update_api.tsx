// lib/api/update_api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// --- TYPES ---

export interface UpdateProfileData {
  name?: string
  bio?: string
  profile_photo_url?: string
  password?: string
}

export interface UpdateFolderData {
  name?: string
  description?: string
  visibility?: "public" | "private"
  tags?: string
}

export interface UpdatePostData {
  title?: string
  body?: string
  visibility?: "public" | "private"
  tags?: string
}

// --- UPDATE FUNCTIONS ---

/**
 * 1. Update Current User Profile
 * Endpoint: PATCH /users/me
 */
export async function updateUserProfile(token: string, data: UpdateProfileData) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.detail || "Failed to update profile")
    }

    return await res.json()
  } catch (error) {
    console.error("Update profile error:", error)
    throw error
  }
}

/**
 * 2. Update Folder
 * Endpoint: PATCH /folders/{folder_id}
 */
export async function updateFolder(token: string, folderId: string | number, data: UpdateFolderData) {
  try {
    const res = await fetch(`${API_BASE_URL}/folders/${folderId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.detail || "Failed to update folder")
    }

    return await res.json()
  } catch (error) {
    console.error("Update folder error:", error)
    throw error
  }
}

/**
 * 3. Update Post
 * Endpoint: PATCH /posts/{post_id}
 */
export async function updatePost(token: string, postId: string | number, data: UpdatePostData) {
  try {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.detail || "Failed to update post")
    }

    return await res.json()
  } catch (error) {
    console.error("Update post error:", error)
    throw error
  }
}