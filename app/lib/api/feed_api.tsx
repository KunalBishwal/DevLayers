// lib/api/feed_api.ts

/* =======================
   BASE CONFIG
======================= */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

/* =======================
   TYPES
======================= */

/* ---------- Author ---------- */
export interface FeedPostAuthor {
  id: number
  name: string
  profile_photo_url: string | null
}

/* ---------- Images ---------- */
export interface FeedPostImage {
  id: number
  url: string
}

/* ---------- Links ---------- */
export interface FeedPostLink {
  id: number
  label: string
  url: string
}

/* ---------- Score Breakdown ---------- */
export interface FeedScoreBreakdown {
  relationship_score: number
  freshness_score: number
  engagement_score: number
  total_score: number
}

/* ---------- Feed Post ---------- */
export interface FeedPost {
  id: number
  title: string
  body: string | null
  tags: string[] | null
  visibility: "public" | "private" | "friends_only"
  folder_id: number | null
  created_at: string

  author: FeedPostAuthor

  images: FeedPostImage[]
  links: FeedPostLink[]

  comments_count: number
  likes_count: number
  dislikes_count: number
  views_count: number

  score_breakdown?: FeedScoreBreakdown
  total_score?: number
}

/* =======================
   API FUNCTIONS
======================= */

/**
 * Fetch personalized feed for logged-in user
 * GET /feed
 */
export async function fetchUserFeed(
  token: string,
  limit: number = 20,
  offset: number = 0
): Promise<FeedPost[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/feed?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: authHeaders(token),
      }
    )

    if (!res.ok) {
      console.error("Failed to fetch feed:", await res.text())
      return []
    }

    return await res.json()
  } catch (error) {
    console.error("Feed fetch error:", error)
    return []
  }
}

/**
 * Fetch trending posts
 * GET /feed/trending
 */
export async function fetchTrendingPosts(
  token: string,
  limit: number = 10,
  days: number = 30
): Promise<FeedPost[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/feed/trending?limit=${limit}&days=${days}`,
      {
        method: "GET",
        headers: authHeaders(token),
      }
    )

    if (!res.ok) {
      console.error("Failed to fetch trending posts:", await res.text())
      return []
    }

    return await res.json()
  } catch (error) {
    console.error("Trending fetch error:", error)
    return []
  }
}

/**
 * Mark a post as viewed (recommended for feed quality)
 * POST /feed/view/{post_id}
 */
export async function markPostAsViewed(
  token: string,
  postId: number
): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/feed/view/${postId}`,
      {
        method: "POST",
        headers: authHeaders(token),
      }
    )

    return res.ok
  } catch (error) {
    console.error("View tracking error:", error)
    return false
  }
}
