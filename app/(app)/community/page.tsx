"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  Loader2, 
  Search,
  MoreHorizontal,
  UserMinus,
  RefreshCw,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useUser } from "@/context/user-context";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// --- API FUNCTIONS ---
import { 
  getUserFollowingFollowers, 
  getUserFriendsAndRequests,
  FollowingFollowersResponse,
  FriendFriendRequestResponse,
  UserBasicInfo
} from "@/app/lib/api/community_api"; 
import { UnfollowTargetProfile } from "@/app/lib/api/follow_api";

const CACHE_KEY_NETWORK = "community_network_cache";
const CACHE_KEY_FRIENDS = "community_friends_cache";
const TWO_HOURS_IN_MS = 30 * 60 * 1000;//set to 30 minutes caching

export default function CommunityPage() {
  const { user } = useUser();
  const userId = user?.id || 0;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [networkData, setNetworkData] = useState<FollowingFollowersResponse | null>(null);
  const [friendData, setFriendData] = useState<FriendFriendRequestResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);

  /**
   * Helper: Get cached data if it's not expired
   */
  const getValidCache = useCallback((key: string) => {
    const cached = localStorage.getItem(`${key}_${userId}`);
    if (!cached) return null;

    try {
      const parsed = JSON.parse(cached);
      const isExpired = Date.now() - parsed.timestamp > TWO_HOURS_IN_MS;
      
      if (isExpired) {
        console.log(`Cache for ${key} expired. Calling API...`);
        return null;
      }
      return parsed.data;
    } catch (e) {
      return null;
    }
  }, [userId]);

  /**
   * Core Fetch & Cache Logic
   */
  const fetchData = useCallback(async (isManualRefresh = false) => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return;
    
    if (isManualRefresh) setRefreshing(true);

    try {
      const [network, friends] = await Promise.all([
        getUserFollowingFollowers(userId, storedToken),
        getUserFriendsAndRequests(userId, storedToken)
      ]);
      
      setNetworkData(network);
      setFriendData(friends);

      // Save with Timestamp
      const timestamp = Date.now();
      localStorage.setItem(`${CACHE_KEY_NETWORK}_${userId}`, JSON.stringify({ data: network, timestamp }));
      localStorage.setItem(`${CACHE_KEY_FRIENDS}_${userId}`, JSON.stringify({ data: friends, timestamp }));

      if (isManualRefresh) toast.success("Data synced with server");
    } catch (error) {
      console.error("Sync error:", error);
      if (isManualRefresh) toast.error("Sync failed");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    const cachedNet = getValidCache(CACHE_KEY_NETWORK);
    const cachedFri = getValidCache(CACHE_KEY_FRIENDS);

    if (cachedNet && cachedFri) {
      // Use valid cache immediately
      setNetworkData(cachedNet);
      setFriendData(cachedFri);
      setLoading(false);
    } else {
      // Fetch fresh if no cache or cache expired
      fetchData();
    }
  }, [fetchData, getValidCache]);

  /**
   * Search Filters
   */
  const filteredFriends = useMemo(() => {
    if (!friendData?.friends_list) return [];
    return friendData.friends_list.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [friendData, searchQuery]);

  const filteredFollowing = useMemo(() => {
    if (!networkData?.following_list) return [];
    return networkData.following_list.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [networkData, searchQuery]);

  const handleUnfollow = async (targetId: number) => {
    if (!token) return;
    try {
      await UnfollowTargetProfile(token, targetId);
      setNetworkData(prev => prev ? ({
        ...prev,
        following_count: Math.max(0, prev.following_count - 1),
        following_list: prev.following_list.filter(u => u.id !== targetId)
      }) : null);
      toast.info("Unfollowed");
    } catch (error) {
      toast.error("Failed to unfollow");
    }
  };

  if (loading && !networkData) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Syncing your network...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/50 pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-10 space-y-8">
        
        {/* Header (Design Same as Prev) */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Community</h1>
              <p className="text-sm text-muted-foreground">Manage your connections</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                className="pl-9 bg-background border-none shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              size="icon" 
              className="rounded-lg bg-background"
              onClick={() => fetchData(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Friends" count={friendData?.friends_count || 0} />
          <StatCard label="Following" count={networkData?.following_count || 0} />
          <StatCard label="Followers" count={networkData?.followers_count || 0} />
          <StatCard label="Pending" count={friendData?.pending_requests_count || 0} highlight />
        </div>

        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
            <TabsTrigger value="friends" className="px-8 rounded-lg">Friends</TabsTrigger>
            <TabsTrigger value="network" className="px-8 rounded-lg">Network</TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            {friendData?.pending_requests && friendData.pending_requests.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending Requests</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {friendData.pending_requests.map((req) => (
                    <UserCard 
                      key={req.id} 
                      name={req.sender_id === userId ? req.receiver_name : req.sender_name} 
                      image={req.sender_id === userId ? req.receiver_profile_photo : req.sender_profile_photo}
                      isRequest={req.sender_id !== userId}
                      isOutgoing={req.sender_id === userId}
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">All Friends</h3>
              {filteredFriends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-background/40 border-2 border-dashed rounded-3xl">
                  <UserIcon className="w-10 h-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No matches found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredFriends.map((friend) => (
                    <UserCard key={friend.id} user={friend} />
                  ))}
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="network">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Following</h3>
                {filteredFollowing.map((u) => (
                  <UserCard key={u.id} user={u} showUnfollow onUnfollow={() => handleUnfollow(u.id)} />
                ))}
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Followers</h3>
                {networkData?.followers_list.map((u) => (
                  <UserCard key={u.id} user={u} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Sub-components kept identical to maintain design...
function StatCard({ label, count, highlight = false }: { label: string, count: number, highlight?: boolean }) {
  return (
    <Card className={`border-none shadow-sm ${highlight ? 'bg-primary text-primary-foreground' : 'bg-background'} transition-colors`}>
      <CardContent className="p-4 flex flex-col items-center justify-center">
        <p className="text-2xl font-black leading-none mb-1">{count}</p>
        <p className={`text-[10px] uppercase font-bold tracking-tighter opacity-80`}>{label}</p>
      </CardContent>
    </Card>
  );
}

function UserCard({ user, name, image, isRequest, isOutgoing, showUnfollow, onUnfollow }: any) {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const displayName = user?.name || name;
  const displayImg = user?.profile_photo_url || image;

  return (
    <div className="group relative flex items-center justify-between p-4 rounded-2xl border bg-background hover:border-primary/40 transition-all duration-300">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-background">
          <AvatarImage src={displayImg || ""} alt={displayName} />
          <AvatarFallback className="bg-primary/5 text-primary font-bold">{displayName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <p className="font-bold text-sm tracking-tight truncate">{displayName}</p>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {isOutgoing ? "Request Sent" : user?.bio || "Community Member"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isRequest && (
          <div className="flex gap-1">
             <Button size="icon" variant="ghost" className="text-primary"><CheckCircle2 className="w-5 h-5" /></Button>
             <Button size="icon" variant="ghost" className="text-white"><XCircle className="w-5 h-5" /></Button>
          </div>
        )}
        {showUnfollow && (
          <Button variant="ghost" size="sm" onClick={onUnfollow} className="h-8 text-xs font-bold text-muted-foreground">Unfollow</Button>
        )}
      </div>
    </div>
  );
}