const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// --- TYPES (Payloads) ---

export interface CreateSocialLinkData {
  label: string
  url: string
}

export interface CreateFolderData {
  name: string
  description: string
  visibility: "public" | "private"
  tags?: string // Comma separated string
}

/**
 * Post link object
 */
export interface PostLink {
  label: string
  url: string
}

/**
 * Updated Post payload
 */
export interface CreatePostData {
  title: string
  content: string
  visibility: "public" | "private"
  img_url?: string
  tags?: string // "tag1,tag2,tag3"
  links?: PostLink[]
}

// --- API FUNCTIONS ---

/**
 * 1. Create Social Link
 * POST /users/me/social-links
 */
export async function createSocialLink(
  token: string,
  data: CreateSocialLinkData
) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/me/social-links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      console.error("Failed to create social link:", await res.text())
      return null
    }

    return await res.json()
  } catch (error) {
    console.error("Network error creating social link:", error)
    return null
  }
}

/**
 * 2. Create Folder (Project)
 * POST /folders
 */
export async function createFolder(
  token: string,
  data: CreateFolderData
) {
  try {
    const res = await fetch(`${API_BASE_URL}/folders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      console.error("Failed to create folder:", await res.text())
      return null
    }

    return await res.json()
  } catch (error) {
    console.error("Network error creating folder:", error)
    return null
  }
}

/**
 * 3. Create Standalone Post
 * POST /posts
 */
export async function createPost(
  token: string,
  data: CreatePostData
) {
  try {
    const res = await fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: data.title,
        content: data.content,
        visibility: data.visibility,
        img_url: data.img_url,
        tags: data.tags,
        links: data.links,
      }),
    })

    if (!res.ok) {
      console.error("Failed to create post:", await res.text())
      return null
    }

    return await res.json()
  } catch (error) {
    console.error("Network error creating post:", error)
    return null
  }
}

/**
 * 4. Create Post INSIDE a Folder
 * POST /folders/{folder_id}/posts
 */
export async function createPostInFolder(
  token: string,
  folderId: string | number,
  data: CreatePostData
) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/folders/${folderId}/posts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          visibility: data.visibility,
          img_url: data.img_url,
          tags: data.tags,
          links: data.links,
        }),
      }
    )

    if (!res.ok) {
      console.error(
        "Failed to create folder post:",
        await res.text()
      )
      return null
    }

    return await res.json()
  } catch (error) {
    console.error(
      "Network error creating folder post:",
      error
    )
    return null
  }
}
