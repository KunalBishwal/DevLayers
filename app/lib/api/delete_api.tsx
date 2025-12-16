
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"


export async function delete_post(token: string, postId: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ post_id: postId }),
    })

    if (!res.ok) {
      console.error("Failed to delete post", await res.text())
      return null
    }

    return await res.json()
  } catch (error) {
    console.error("Network error deleting post post:", error)
    return null
  }
}



export async function delete_folder(token: string, folderId: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/folders/${folderId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ folder_id: folderId }),
    })

    if (!res.ok) {
      console.error("Failed to delete folder", await res.text())
      return null
    }

    return await res.json()
  } catch (error) {
    console.error("Network error deleting folder:", error)
    return null
  }
}

