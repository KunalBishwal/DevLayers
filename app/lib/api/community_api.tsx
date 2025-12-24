/**
 * Friends, Following & Followers API
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* =======================
   ENUMS
======================= */

export type FriendRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

/* =======================
   BASE USER TYPES
======================= */

export interface UserBasicInfo {
  id: number;
  friend_request_id: number;
  name: string;
  email: string;
  bio: string | null;
  profile_photo_url: string | null;
}

/* =======================
   FRIEND REQUEST TYPES
======================= */

export interface FriendRequestInfo {
  id: number;

  sender_id: number;
  sender_name: string;
  sender_profile_photo: string | null;

  receiver_id: number;
  receiver_name: string;
  receiver_profile_photo: string | null;

  status: FriendRequestStatus;
  created_at: string;
}

/* =======================
   RESPONSE TYPES
======================= */

export interface FollowingFollowersResponse {
  following_count: number;
  followers_count: number;
  following_list: UserBasicInfo[];
  followers_list: UserBasicInfo[];
}

export interface FriendFriendRequestResponse {
  friends_count: number;
  pending_requests_count: number;
  friends_list: UserBasicInfo[];
  pending_requests: FriendRequestInfo[];
}

/* =======================
   API FUNCTIONS
======================= */

/**
 * Get following and followers for a specific user
 * GET /profile/{user_id}/following-followers
 */
export const getUserFollowingFollowers = async (
  userId: number,
  token: string
): Promise<FollowingFollowersResponse> => {
  const res = await fetch(
    `${API_BASE_URL}/profile/${userId}/following-followers`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData.detail || "Failed to fetch following/followers"
    );
  }

  return res.json();
};

/**
 * Get friends and pending friend requests for a specific user
 * GET /profile/{user_id}/friends-requests
 */
export const getUserFriendsAndRequests = async (
  userId: number,
  token: string
): Promise<FriendFriendRequestResponse> => {
  const res = await fetch(
    `${API_BASE_URL}/profile/${userId}/friends-requests`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData.detail || "Failed to fetch friends and requests"
    );
  }

  return res.json();
};
