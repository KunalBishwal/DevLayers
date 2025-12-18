const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

/* =====================================================
   FOLLOW USER
   POST /follow?target_user_id=...
   ===================================================== */
export async function FollowTargetProfile(
  token: string,
  target_user_id: number
) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/follow?target_user_id=${target_user_id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || "Failed to follow profile")
    }

    return await res.json()
  } catch (error) {
    console.error("Follow failed:", error)
    throw error
  }
}

/* =====================================================
   UNFOLLOW USER
   DELETE /follow/{target_user_id}
   ===================================================== */
export async function UnfollowTargetProfile(
  token: string,
  target_user_id: number
) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/follow/${target_user_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || "Failed to unfollow profile")
    }

    return await res.json()
  } catch (error) {
    console.error("Unfollow failed:", error)
    throw error
  }
}
