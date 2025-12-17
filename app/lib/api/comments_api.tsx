// comments-api.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// ---------------- TYPES ----------------

export interface Comment {
  id: number
  body: string
  author_id: number
  created_at?: string
}

export interface CreateCommentResponse {
  id: number
  body: string
  author_id: number
}

// ---------------- API FUNCTIONS ----------------

/**
 * Create a comment on a post
 * POST /{post_id}/comments
 */
export async function createComment(
  token: string,
  postId: number,
  body: string
): Promise<CreateCommentResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ body }),
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
 * Delete a comment
 * DELETE /{post_id}/comments/{comment_id}
 */
export async function deleteComment(
  token: string,
  postId: number,
  commentId: number
): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/${postId}/comments/${commentId}`,
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
 * GET /{post_id}/comments
 */
export async function getPostComments(
  postId: number
): Promise<Comment[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/${postId}/comments`)

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