/**
 * Post Views API
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* =======================
   REQUEST TYPES
======================= */

export interface RecordPostViewsPayload {
  post_ids: number[];
}

/* =======================
   RESPONSE TYPES
======================= */

export interface RecordPostViewsResponse {
  message: string;
  count: number;
}

/* =======================
   API FUNCTIONS
======================= */

/**
 * Record multiple post views
 * POST /posts/views
 */
export const recordPostViews = async (
  postIds: number[],
  token: string
): Promise<RecordPostViewsResponse> => {
  if (!postIds.length) {
    return { message: "No posts to record", count: 0 };
  }

  const res = await fetch(`${API_BASE_URL}/posts/views`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      post_ids: postIds,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to record post views");
  }

  return res.json();
};
