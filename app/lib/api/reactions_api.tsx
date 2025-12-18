// comments-api.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

/* =========================================================
   TYPES
   ========================================================= */

/* ---------------- COMMENTS TYPES ---------------- */

export interface Comment {
  id: number
  body: string
  author_id: number
  author_name?: string | null
  author_profile_image?: string | null
  created_at?: string
  updated_at?: string
}

export type CreateCommentResponse = Comment
export type EditCommentResponse = Comment

/* ---------------- REACTIONS TYPES ---------------- */

export type ReactionType = "like" | "dislike"

export interface ReactionResponse {
  id: number
  type: ReactionType
}

export interface PostReactionsSummary {
  likes: number
  dislikes: number
  total: number
}

/* =========================================================
   COMMENTS API
   ========================================================= */

/**
 * Create a comment on a post
 * POST /posts/{post_id}/comments?body=...
 */
export async function createComment(
  token: string,
  postId: number,
  commentText: string
): Promise<CreateCommentResponse | null> {
  try {
    const url = new URL(`${API_BASE_URL}/posts/${postId}/comments`)
    url.searchParams.append("body", commentText)

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      console.error("Failed to create comment:", await res.text())
      return null
    }

    return await res.json()
  } catch (err) {
    console.error("Create comment error:", err)
    return null
  }
}

/**
 * Edit a comment
 * PATCH /posts/{post_id}/comments/{comment_id}?body=...
 */
export async function editComment(
  token: string,
  postId: number,
  commentId: number,
  updatedText: string
): Promise<EditCommentResponse | null> {
  try {
    const url = new URL(
      `${API_BASE_URL}/posts/${postId}/comments/${commentId}`
    )
    url.searchParams.append("body", updatedText)

    const res = await fetch(url.toString(), {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      console.error("Failed to edit comment:", await res.text())
      return null
    }

    return await res.json()
  } catch (err) {
    console.error("Edit comment error:", err)
    return null
  }
}

/**
 * Delete a comment
 * DELETE /posts/{post_id}/comments/{comment_id}
 */
export async function deleteComment(
  token: string,
  postId: number,
  commentId: number
): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/posts/${postId}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!res.ok) {
      console.error("Failed to delete comment:", await res.text())
      return false
    }

    return true
  } catch (err) {
    console.error("Delete comment error:", err)
    return false
  }
}

/**
 * Get all comments for a post
 * GET /posts/{post_id}/comments
 */
export async function getPostComments(
  postId: number
): Promise<Comment[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/posts/${postId}/comments`
    )

    if (!res.ok) {
      console.error("Failed to fetch comments:", await res.text())
      return []
    }

    return await res.json()
  } catch (err) {
    console.error("Get comments error:", err)
    return []
  }
}

/* =========================================================
   REACTIONS API (LIKE / DISLIKE)
   ========================================================= */

/**
 * Add or update a reaction on a post
 * POST /posts/{post_id}/reactions?type=like|dislike
 */
export async function addReaction(
  token: string,
  postId: number,
  type: ReactionType
): Promise<ReactionResponse | null> {
  try {
    const url = new URL(`${API_BASE_URL}/posts/${postId}/reactions`)
    url.searchParams.append("type", type)

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      console.error("Failed to add reaction:", await res.text())
      return null
    }

    return await res.json()
  } catch (err) {
    console.error("Add reaction error:", err)
    return null
  }
}

/**
 * Remove current user's reaction from a post
 * DELETE /posts/{post_id}/reactions
 */
export async function removeReaction(
  token: string,
  postId: number
): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/posts/${postId}/reactions`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!res.ok) {
      console.error("Failed to remove reaction:", await res.text())
      return false
    }

    return true
  } catch (err) {
    console.error("Remove reaction error:", err)
    return false
  }
}

/**
 * Get reactions summary for a post
 * GET /posts/{post_id}/reactions
 */
export async function getPostReactions(
  postId: number
): Promise<PostReactionsSummary | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/posts/${postId}/reactions`
    )

    if (!res.ok) {
      console.error("Failed to fetch reactions:", await res.text())
      return null
    }

    return await res.json()
  } catch (err) {
    console.error("Get reactions error:", err)
    return null
  }
}
