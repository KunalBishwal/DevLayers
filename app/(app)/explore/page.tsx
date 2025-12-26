"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { PostCard } from "@/components/devlayers/post-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button" 
import { recordPostViews } from "@/app/lib/api/postview_api"
import {useRouter } from "next/navigation"
import {
  TrendingUp,
  Clock,
  Loader2,
  RefreshCcw,
  Inbox,
  Sparkles,
  Zap,
} from "lucide-react"
import {
  fetchUserFeed,
  fetchTrendingPosts,
  FeedPost,
} from "@/app/lib/api/feed_api"

/* =======================
   SUB-COMPONENT: EMPTY STATE
======================= */
const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: { 
  icon: any, 
  title: string, 
  description: string, 
  action?: React.ReactNode 
}) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-muted rounded-xl bg-muted/10">
    <div className="p-4 bg-background rounded-full shadow-sm mb-4">
      <Icon className="w-8 h-8 text-muted-foreground" />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground max-w-xs mb-6">
      {description}
    </p>
    {action}
  </div>
)

/* =======================
   CACHE CONFIG
======================= */
const CACHE_KEY = "devlayers_explore_cache_v4"
const TRENDING_TTL = 5 * 60 * 1000
const FEED_TTL = 30 * 60 * 1000
const PAGE_SIZE = 10

interface ExploreCache {
  trending: { posts: FeedPost[]; fetchedAt: number }
  feed: {
    posts: FeedPost[]
    offset: number
    hasMore: boolean
    fetchedAt: number
  }
}

export default function ExplorePage() {
  const router = useRouter()
  const [trendingPosts, setTrendingPosts] = useState<FeedPost[]>([])
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([])
  const [feedOffset, setFeedOffset] = useState(0)
  const [feedHasMore, setFeedHasMore] = useState(true)

  const [activeTab, setActiveTab] = useState("trending")
  const [loadingTrending, setLoadingTrending] = useState(false)
  const [loadingFeed, setLoadingFeed] = useState(false)

  const observerRef = useRef<HTMLDivElement | null>(null)
  const fetchingRef = useRef(false)
  const mountedRef = useRef(false)

  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""

  const readCache = (): ExploreCache | null => {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }

  const writeCache = (cache: ExploreCache) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  }

  const loadTrending = useCallback(async (force = false) => {
    if (!token) return
    const cache = readCache()
    const now = Date.now()

    if (!force && cache?.trending.posts.length && now - cache.trending.fetchedAt < TRENDING_TTL) {
      setTrendingPosts(cache.trending.posts)
      return
    }

    setLoadingTrending(true)
    const posts = await fetchTrendingPosts(token, 10)
    writeCache({
      trending: { posts, fetchedAt: now },
      feed: cache?.feed ?? { posts: [], offset: 0, hasMore: true, fetchedAt: 0 },
    })
    setTrendingPosts(posts)
    setLoadingTrending(false)
  }, [token])

  const loadFeed = useCallback(async (offset: number, force = false) => {
    if (!token) return
    if (fetchingRef.current) return
    if (!force && !feedHasMore) return

    const cache = readCache()
    const now = Date.now()

    if (!force && offset === 0 && cache?.feed.posts.length && now - cache.feed.fetchedAt < FEED_TTL) {
      setFeedPosts(cache.feed.posts)
      setFeedOffset(cache.feed.offset)
      setFeedHasMore(cache.feed.hasMore)
      return
    }

    fetchingRef.current = true
    setLoadingFeed(true)
    const newPosts = await fetchUserFeed(token, PAGE_SIZE, offset)

    setFeedPosts(prev => {
      const ids = new Set(prev.map(p => p.id))
      return [...prev, ...newPosts.filter(p => !ids.has(p.id))]
    })

    const nextOffset = offset + PAGE_SIZE
    const hasMore = newPosts.length > 0

    writeCache({
      trending: cache?.trending ?? { posts: [], fetchedAt: 0 },
      feed: {
        posts: [...(cache?.feed.posts ?? []), ...newPosts],
        offset: nextOffset,
        hasMore,
        fetchedAt: now,
      },
    })

    setFeedOffset(nextOffset)
    setFeedHasMore(hasMore)
    setLoadingFeed(false)
    fetchingRef.current = false
  }, [token, feedHasMore])

  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true
    const cache = readCache()
    const now = Date.now()

    if (cache) {
      setTrendingPosts(cache.trending.posts)
      setFeedPosts(cache.feed.posts)
      setFeedOffset(cache.feed.offset)
      setFeedHasMore(cache.feed.hasMore)
    }

    if (!cache || now - cache.trending.fetchedAt > TRENDING_TTL) loadTrending()
    if (!cache || now - cache.feed.fetchedAt > FEED_TTL) loadFeed(0)
  }, [loadTrending, loadFeed])

  useEffect(() => {
    if (activeTab !== "recent" || !feedHasMore) return
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !fetchingRef.current) loadFeed(feedOffset)
    })
    if (observerRef.current) observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [activeTab, feedOffset, feedHasMore, loadFeed])

  const handleRefresh = async () => {
    localStorage.removeItem(CACHE_KEY)
    setTrendingPosts([])
    setFeedPosts([])
    setFeedOffset(0)
    setFeedHasMore(true)
    await loadTrending(true)
    await loadFeed(0, true)
  }

  const renderPost = (post: FeedPost) => (

  <div key={post.id} className="post-observer-target" data-post-id={post.id}>{/* for tracking if post seen by user for views  */}

    <PostCard
      day={post.id}
      key={post.id}
      id={post.id.toString()}
      title={post.title}
      content={post.body || ""}
      author={{
        name: post.author?.name || "Anonymous",
        avatar: post.author?.profile_photo_url || "",
      }}
      date={new Date(post.created_at).toLocaleDateString()}
      tags={Array.isArray(post.tags) ? post.tags : []}
      likes={post.likes_count}
      dislikes={post.dislikes_count}
      comments={post.comments_count}
      views={post.views_count}
      hasImage={post.images?.length > 0}
      imageUrl={post.images?.[0]?.url}
      links={post.links}
      folder_id={post.folder_id}
    />
    
  </div>
  )



    // --- Post View Tracking Logic ---
    const [pendingViews, setPendingViews] = useState<number[]>([]);
    const viewedPostIds = useRef<Set<number>>(new Set());
    const observerRefer = useRef<IntersectionObserver | null>(null);
  
    useEffect(() => {
      if (pendingViews.length === 0) return;
  
      const timeoutId = setTimeout(async () => {
        try {
          const token = localStorage.getItem("token") || ""; 
          await recordPostViews(pendingViews, token);
          setPendingViews([]); 
        } catch (err) {
          console.error("Failed to record post views:", err);
        }
      }, 6000);//every 6 seconds if there are pending views and no new post scrolled into view then send the request
  
      return () => clearTimeout(timeoutId);
    }, [pendingViews]);
  
    useEffect(() => {
      if (observerRefer.current) observerRefer.current.disconnect();
  
      observerRefer.current = new IntersectionObserver((entries) => {
        const visibleIds: number[] = [];
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const postId = Number(entry.target.getAttribute("data-post-id"));
            if (postId && !viewedPostIds.current.has(postId)) {
              viewedPostIds.current.add(postId);
              visibleIds.push(postId);
            }
          }
        });
  
        if (visibleIds.length > 0) {
          setPendingViews((prev) => [...prev, ...visibleIds]);
        }
      }, { threshold: 0.5 });
  
      const targets = document.querySelectorAll(".post-observer-target");
      targets.forEach((t) => observerRefer.current?.observe(t));
  
      return () => observerRefer.current?.disconnect();
    }, [trendingPosts, feedPosts]); 
    // --- End View Tracking Logic ---


  

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
          <p className="text-muted-foreground">Discover what the community is building.
               <button 
                  onClick={() => handleRefresh()} // Pass true to bypass cache
                  disabled={loadingTrending || loadingFeed}
                  className={`${loadingTrending || loadingFeed ? 'animate-spin' : ''} hover:bg-gray-100 p-1 rounded-full transition-colors disabled:opacity-50`}>
                  <RefreshCcw className="w-3 h-3 text-blue-600" />
                </button>
          </p>
        </div>
      </div>

      <Tabs defaultValue="trending" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="trending" className="gap-2">
            <TrendingUp className="w-4 h-4" /> Trending
          </TabsTrigger>
          <TabsTrigger value="recent" className="gap-2">
            <Clock className="w-4 h-4" /> Feed
          </TabsTrigger>
        </TabsList>

        {/* TRENDING CONTENT */}
        <TabsContent value="trending" className="mt-6 space-y-4">
          {loadingTrending ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
          ) : trendingPosts.length > 0 ? (
            trendingPosts.map(renderPost)
          ) : (
            <EmptyState 
              icon={Sparkles}
              title="Nothing's trending yet"
              description="Be the first to create a post that captures the community's attention."
              action={<Button onClick={()=>{router.push("/create")}}>Create Post</Button>}
            />
          )}
        </TabsContent>

        {/* FEED CONTENT */}
        <TabsContent value="recent" className="mt-6 space-y-4">
          {feedPosts.length > 0 ? (
            <>
              {feedPosts.map(renderPost)}
              <div ref={observerRef} className="py-10 text-center">
                {loadingFeed ? (
                  <Loader2 className="animate-spin mx-auto w-6 h-6 text-muted-foreground" />
                ) : !feedHasMore && (
                  <p className="text-sm text-muted-foreground">You&apos;ve reached the end of the feed.</p>
                )}
              </div>
            </>
          ) : !loadingFeed ? (
            <EmptyState 
              icon={Inbox}
              title="Your feed is quiet"
              description="Follow other developers to see their latest updates and projects here."
              action={<Button variant="secondary" onClick={() => { router.push("/search"); }}>Find People to Follow</Button>}
            />
          ) : (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}