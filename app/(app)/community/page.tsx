"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Loader2, 
  Search,
  RefreshCw,
  User as UserIcon,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useUser } from "@/context/user-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// --- API FUNCTIONS ---
import { 
  getUserFollowingFollowers, 
  getUserFriendsAndRequests,
  FollowingFollowersResponse,
  FriendFriendRequestResponse,
} from "@/app/lib/api/community_api"; 
import { UnfollowTargetProfile } from "@/app/lib/api/follow_api";
import { respondFriendRequest, deleteFriendRequest } from "@/app/lib/api/friends_api";

const CACHE_KEY_NETWORK = "community_network_cache";
const CACHE_KEY_FRIENDS = "community_friends_cache";
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

export default function CommunityPage() {
  const { user } = useUser();
  const userId = user?.id || 0;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [networkData, setNetworkData] = useState<FollowingFollowersResponse | null>(null);
  const [friendData, setFriendData] = useState<FriendFriendRequestResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const getValidCache = useCallback((key: string) => {
    if (typeof window === "undefined") return null;
    const cached = localStorage.getItem(`${key}_${userId}`);
    if (!cached) return null;
    try {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp > CACHE_EXPIRY_MS) return null;
      return parsed.data;
    } catch (e) {
      return null;
    }
  }, [userId]);

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

      const timestamp = Date.now();
      localStorage.setItem(`${CACHE_KEY_NETWORK}_${userId}`, JSON.stringify({ data: network, timestamp }));
      localStorage.setItem(`${CACHE_KEY_FRIENDS}_${userId}`, JSON.stringify({ data: friends, timestamp }));

      if (isManualRefresh) toast.success("Network Synced");
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
      setNetworkData(cachedNet);
      setFriendData(cachedFri);
      setLoading(false);
    } else {
      fetchData();
    }
  }, [fetchData, getValidCache]);

  const filteredFriends = useMemo(() => {
    return friendData?.friends_list?.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];
  }, [friendData, searchQuery]);

  const filteredFollowing = useMemo(() => {
    return networkData?.following_list?.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];
  }, [networkData, searchQuery]);

  // --- ACTION HANDLERS ---

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

  const accept_friend_request = async (id: number) => {
    try {
      await respondFriendRequest(id, "accept", token!);
      toast.success("Accepted");
      fetchData(true); // Hard refresh to update both lists/stats
    } catch (error) {
      toast.error("Failed to accept");
    }
  };

  const reject_friend_request = async (id: number) => {
    try {
      await deleteFriendRequest(id, token!);
      toast.success("Rejected");
      fetchData(true);
    } catch (error) {
      toast.error("Failed to reject");
    }
  };

  const handleUnfriend = async (friendshipId: number) => {
    if (!token) return;
    try {
      // Reusing deleteFriendRequest logic as unfriend
      await deleteFriendRequest(friendshipId, token);
      toast.success("Unfriended");
      fetchData(true);
    } catch (error) {
      toast.error("Failed to unfriend");
    }
  };

  if (loading && !networkData) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
        <p className="text-sm font-medium text-muted-foreground">Syncing network...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/50 pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-10 space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Community</h1>
            <p className="text-sm text-muted-foreground">Manage your connections</p>
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
              variant="outline"
              className="rounded-lg bg-background"
              onClick={() => fetchData(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </header>

        {/* Stats */}
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

          <TabsContent value="friends" className="space-y-8">
            {/* Pending Requests */}
            {friendData?.pending_requests && friendData.pending_requests.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending Requests</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {friendData.pending_requests.map((req) => (
                    <UserCard 
                      key={req.id} 
                      requestId={req.id}
                      targetUserId={req.sender_id === userId ? req.receiver_id : req.sender_id}
                      accept_friend_request={accept_friend_request}
                      reject_friend_request={reject_friend_request}
                      name={req.sender_id === userId ? req.receiver_name : req.sender_name} 
                      image={req.sender_id === userId ? req.receiver_profile_photo : req.sender_profile_photo}
                      isRequest={req.sender_id !== userId}
                      isOutgoing={req.sender_id === userId}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Friends List */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">All Friends</h3>
              {filteredFriends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-background/40 border-2 border-dashed rounded-3xl">
                  <UserIcon className="w-10 h-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No connections yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredFriends.map((friend) => (
                    <UserCard 
                      key={friend.id} 
                      targetUserId={friend.id} 
                      user={friend} 
                      isFriend={true}
                      onUnfriend={() => handleUnfriend(friend.friend_request_id)}
                    />
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
                  <UserCard key={u.id} targetUserId={u.id} user={u} showUnfollow onUnfollow={() => handleUnfollow(u.id)} />
                ))}
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Followers</h3>
                {networkData?.followers_list.map((u) => (
                  <UserCard key={u.id} targetUserId={u.id} user={u} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ label, count, highlight = false }: { label: string, count: number, highlight?: boolean }) {
  return (
    <Card className={`border-none shadow-sm transition-all hover:shadow-md ${highlight ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
      <CardContent className="p-4 flex flex-col items-center justify-center">
        <p className="text-2xl font-black leading-none mb-1">{count}</p>
        <p className="text-[10px] uppercase font-bold tracking-tighter opacity-80">{label}</p>
      </CardContent>
    </Card>
  );
}

function UserCard({ 
  requestId, 
  targetUserId, 
  accept_friend_request, 
  reject_friend_request, 
  user, 
  name, 
  image, 
  isRequest, 
  isOutgoing, 
  showUnfollow, 
  onUnfollow,
  isFriend,
  onUnfriend
}: any) {
  const router = useRouter();
  
  const finalUserId = targetUserId || user?.id;
  const displayName = user?.name || name;
  const displayImg = user?.profile_photo_url || image;

  const handleCardClick = () => {
    if (finalUserId) router.push(`/profile/${finalUserId}`);
  };

  return (
    <div 
      className="group relative flex items-center justify-between p-4 rounded-2xl border bg-background hover:border-primary/40 transition-all duration-300 cursor-pointer" 
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
          <AvatarImage src={displayImg || ""} alt={displayName} />
          <AvatarFallback className="bg-primary/5 text-primary font-bold">{displayName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-bold text-sm tracking-tight truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {isOutgoing ? "Pending invitation..." : user?.bio || "Community Member"}
          </p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {/* Friend Request Response */}
        {isRequest && (
          <div className="flex gap-1">
             <Button 
               size="icon" 
               variant="ghost" 
               className="text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full" 
               onClick={() => accept_friend_request(requestId)}
             >
               <CheckCircle2 className="w-5 h-5" />
             </Button>
             <Button 
               size="icon" 
               variant="ghost" 
               className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full" 
               onClick={() => reject_friend_request(requestId)}
             >
               <XCircle className="w-5 h-5" />
             </Button>
          </div>
        )}

        {/* Unfriend Option */}
        {isFriend && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onUnfriend} 
            className="h-8 text-xs font-bold text-muted-foreground hover:text-red-600 hover:bg-red-50"
          >
            Unfriend
          </Button>
        )}

        {/* Unfollow Option */}
        {showUnfollow && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onUnfollow} 
            className="h-8 text-xs font-bold text-muted-foreground hover:text-red-600 hover:bg-red-50"
          >
            Unfollow
          </Button>
        )}
      </div>
    </div>
  );
}