"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Search, RefreshCcw, BookmarkX, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PostCard } from "@/components/devlayers/post-card";
import { 
  getMyBookmarks, 
  deleteBookmark, 
  BookmarkedPost 
} from "@/app/lib/api/bookmarks_api"; 
import { toast } from "sonner"; 

// Constants for Caching
const CACHE_KEY = "bookmarks_cache_data";
const CACHE_TIMESTAMP_KEY = "bookmarks_cache_time";
const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadBookmarks = async (forceRefresh = false) => {
    const now = Date.now();
    
    // 1. Check Cache Logic (only if not a manual refresh)
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cachedData && cachedTime) {
        const age = now - parseInt(cachedTime);
        if (age < TWO_HOURS_IN_MS) {
          setBookmarks(JSON.parse(cachedData));
          setLoading(false);
          return; // Exit early, use cache
        }
      }
    }

    // 2. Fetch Fresh Data
    if (!forceRefresh) setLoading(true);
    setIsRefreshing(true);

    try {
      const token = localStorage.getItem("token") || "";
      const data = await getMyBookmarks(token);
      
      // Update State
      setBookmarks(data);

      // Update Cache
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());

      if (forceRefresh) toast.success("Bookmarks updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to load bookmarks");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookmarks(false);
  }, []);

  const handleUnbookmark = async (bookmarkId: number) => {
    try {
      const token = localStorage.getItem("token") || "";
      await deleteBookmark(bookmarkId, token);
      
      const updatedList = bookmarks.filter((b) => b.bookmark_id !== bookmarkId);
      setBookmarks(updatedList);
      
      // Update cache so deleted item doesn't reappear on reload
      localStorage.setItem(CACHE_KEY, JSON.stringify(updatedList));
      
      alert("Bookmark removed");
    } catch (error: any) {
      alert("Failed to remove bookmark");
    }
  };

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.body.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bookmarks, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-muted-foreground">Loading your saved posts...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookmarks</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground text-sm">
              {bookmarks.length} saved posts found.
            </p>
            <button 
              onClick={() => loadBookmarks(true)} // Pass true to bypass cache
              disabled={isRefreshing}
              className={`${isRefreshing ? 'animate-spin' : ''} hover:bg-gray-100 p-1 rounded-full transition-colors disabled:opacity-50`}
            >
              <RefreshCcw className="w-3 h-3 text-blue-600" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookmarks..."
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsContent value="grid" className="mt-6">
          {filteredBookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookmarks.map((post) => (
                <PostCard
                  key={post.bookmark_id}
                  id={post.post_id.toString()}
                  day={post.post_id} 
                  title={post.title}
                  content={post.body}
                  // Assuming author data is nested as per your latest snippet
                  author={{ 
                    name: post.author?.name || "Anonymous", 
                    avatar: post.author?.profile_photo_url || "" 
                  }}
                  date={new Date(post.created_at).toLocaleDateString()}
                  tags={
                    Array.isArray(post.tags) 
                      ? post.tags 
                      : typeof post.tags === 'string' && post.tags.trim() !== ""
                        ? post.tags.split(',').map(t => t.trim()) 
                        : []
                  }
                  likes={post.likes_count || 0}
                  comments={post.comments_count || 0}
                  hasImage={post.images && post.images.length > 0}
                  imageUrl={post.images?.[0]?.url}
                  links={post.links || []}
                  showActions={true}
                  onDelete={() => handleUnbookmark(post.bookmark_id)}
                  folder_id={post.folder_id}
                  folder_name={post.folder_id ? "Go to Folder" : null}
                  isbookmark_card={true}
                  views={post.views_count || 0}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl">
      <div className=" p-4 rounded-full mb-4">
        <BookmarkX className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">No bookmarks found</h3>
      <p className="text-muted-foreground max-w-xs mx-auto">
        You haven't saved any posts yet. Items you bookmark will appear here.
      </p>
    </div>
  );
}