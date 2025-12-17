// use-comments.ts
import { useState, useEffect, useCallback } from "react"
import { 
  Comment, 
  getPostComments, 
  createComment, 
  deleteComment 
} from "../app/lib/api/comments_api"

interface UseCommentsProps {
  postId: number
  token?: string
  autoFetch?: boolean
}

interface UseCommentsReturn {
  comments: Comment[]
  isLoading: boolean
  error: string | null
  addComment: (body: string) => Promise<boolean>
  removeComment: (commentId: number) => Promise<boolean>
  refreshComments: () => Promise<void>
}

export function useComments({
  postId,
  token,
  autoFetch = true
}: UseCommentsProps): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await getPostComments(postId)
      setComments(data)
    } catch (err) {
      setError("Failed to load comments")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  const addComment = async (body: string): Promise<boolean> => {
    if (!token) {
      setError("Authentication required")
      return false
    }

    setError(null)
    
    try {
      const newComment = await createComment(token, postId, body)
      
      if (newComment) {
        // Optimistically add to local state
        setComments(prev => [newComment as Comment, ...prev])
        return true
      }
      
      setError("Failed to post comment")
      return false
    } catch (err) {
      setError("Failed to post comment")
      console.error(err)
      return false
    }
  }

  const removeComment = async (commentId: number): Promise<boolean> => {
    if (!token) {
      setError("Authentication required")
      return false
    }

    setError(null)
    
    try {
      const success = await deleteComment(token, postId, commentId)
      
      if (success) {
        // Optimistically remove from local state
        setComments(prev => prev.filter(c => c.id !== commentId))
        return true
      }
      
      setError("Failed to delete comment")
      return false
    } catch (err) {
      setError("Failed to delete comment")
      console.error(err)
      return false
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchComments()
    }
  }, [autoFetch, fetchComments])

  return {
    comments,
    isLoading,
    error,
    addComment,
    removeComment,
    refreshComments: fetchComments
  }
}