const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// ===============================
// TYPES
// ===============================

export type FriendRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED"

export interface FriendRequest {
  id: number
  sender_id: number
  receiver_id?: number
  status: FriendRequestStatus
}

// response for GET /friends/requests
export interface IncomingFriendRequest {
  id: number
  sender_id: number
  status: FriendRequestStatus
}

// ===============================
// API FUNCTIONS
// ===============================

/**
 * Send friend request
 * POST /friends/request?target_user_id=ID
 */
export const sendFriendRequest = async (
  targetUserId: number,
  token: string
): Promise<{ id: number; status: FriendRequestStatus }> => {
  const res = await fetch(
    `${API_BASE_URL}/friends/request?target_user_id=${targetUserId}`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok) {
    throw new Error("Failed to send friend request")
  }

  return res.json()
}

/**
 * Respond to friend request
 * POST /friends/respond?request_id=ID&action=accept|reject
 */
export const respondFriendRequest = async (
  requestId: number,
  action: "accept" | "reject",
  token: string
): Promise<{ message: string }> => {
  const res = await fetch(
    `${API_BASE_URL}/friends/respond?request_id=${requestId}&action=${action}`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok) {
    throw new Error("Failed to respond to friend request")
  }

  return res.json()
}

/**
 * Get incoming pending friend requests
 * GET /friends/requests
 */
export const getFriendRequests = async (
  token: string
): Promise<IncomingFriendRequest[]> => {
  const res = await fetch(`${API_BASE_URL}/friends/requests`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch friend requests")
  }

  return res.json()
}
