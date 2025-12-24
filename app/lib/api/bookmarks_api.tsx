/**
 * Bookmarks API
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* =======================
   SHARED TYPES
======================= */

export interface PostImage {
  id: number;
  url: string;
}

export interface PostLink {
  id: number;
  label: string;
  url: string;
}

export interface PostAuthor {
  id: number
  name: string
  profile_photo_url: string
}

/* =======================
   BOOKMARKED POST TYPE
======================= */

export interface BookmarkedPost {
  bookmark_id: number;
  post_id: number;

  title: string;
  body: string;
  visibility: "public" | "private" | "anonymous";

  author: PostAuthor;
  folder_id: number | null;
  tags: string | null;

  images: PostImage[];
  links: PostLink[];

  comments_count: number;
  likes_count: number;
  dislikes_count: number;

  created_at: string;
  updated_at: string;
  bookmarked_at: string;
  views_count: number;
}

/* =======================
   RESPONSE TYPES
======================= */

export interface CreateBookmarkResponse {
  id: number;
}

export interface DeleteBookmarkResponse {
  message: string;
}

export type GetMyBookmarksResponse = BookmarkedPost[];

/* =======================
   API FUNCTIONS
======================= */

/**
 * Create a bookmark
 * POST /bookmarks?post_id={post_id}
 */
export const createBookmark = async (
  postId: number,
  token: string
): Promise<CreateBookmarkResponse> => {
  const res = await fetch(
    `${API_BASE_URL}/bookmarks?post_id=${postId}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to create bookmark");
  }

  return res.json();
};

/**
 * Delete a bookmark
 * DELETE /bookmarks/{bookmark_id}
 */
export const deleteBookmark = async (
  bookmarkId: number,
  token: string
): Promise<DeleteBookmarkResponse> => {
  const res = await fetch(
    `${API_BASE_URL}/bookmarks/${bookmarkId}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to delete bookmark");
  }

  return res.json();
};

/**
 * Get current user's bookmarked posts (FULL DATA)
 * GET /users/me/bookmarks
 */
export const getMyBookmarks = async (
  token: string
): Promise<GetMyBookmarksResponse> => {
  const res = await fetch(
    `${API_BASE_URL}/users/me/bookmarks`,
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
    throw new Error(errorData.detail || "Failed to fetch bookmarks");
  }

  return res.json();
};
