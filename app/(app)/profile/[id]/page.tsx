"use client"
/* this is result public page only show public posts */

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getUserProfile, type UserProfile } from "@/app/lib/api/search_api"
import { useRouter } from "next/navigation"
import { FolderCard } from "@/components/devlayers/folder-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FollowTargetProfile,UnfollowTargetProfile } from "@/app/lib/api/follow_api"
import { 
  Calendar, 
  BookOpen, 
  FileText, 
  Clock, 
  Hash, 
  Link as LinkIcon, 
  ImageIcon,
  Globe,
  Lock,
  Folder,
  Newspaper,
  Users
} from "lucide-react"

// 👇 1. Defined correct types for Images and Links based on your error
interface PostAttachment {
  id: number
  url: string
  label?: string
}

interface ExtendedPost {
  id: number
  title: string
  body: string
  tags: string // Assuming tags is a comma-separated string like "react, js"
  visibility: string
  created_at: string
  updated_at: string
  images: PostAttachment[] 
  links: PostAttachment[]  
}

interface ExtendedUserProfile extends Omit<UserProfile, 'posts'> {
  posts: ExtendedPost[]
}

export default function ProfilePage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [profile, setProfile] = useState<ExtendedUserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isOwnProfile =false /* currentUserId === profile.id*/
  const [isFollowing,setisFollowing] =useState(false) /* profile.is_following  */      // boolean
  const isFriend = true /* profile.is_friend         */     // boolean (mutual follow)
  


// to follow / unfollow users
async function handleFollowToggle() {
  const token = localStorage.getItem("token")
  if (!token) {
    alert("You must be logged in to follow users.")
    return
  }

  try {
    if (!isFollowing) {
      await FollowTargetProfile(token, Number(userId))
      alert(`You are now following ${profile===null?"this user":profile.name}`)
    } else {
      await UnfollowTargetProfile(token, Number(userId))
      alert(`You have unfollowed ${profile===null?"this user":profile.name}`)
    }

    // update UI ONLY if API succeeds
    setisFollowing((prev) => !prev)

  } catch (error: any) {
    console.error(error)

    // 👇 show backend message if available
    const message =
      error?.message ||
      "Something went wrong. Please try again."

    alert(message)
  }
}





  useEffect(() => {
    if (!userId) return

    const fetchData = async () => {
      try {
        const token=localStorage.getItem("token") || ""
        setLoading(true)
        const data = await getUserProfile(userId,token)
        setProfile(data as unknown as ExtendedUserProfile)
        setisFollowing(data.is_follower || false)
      } catch (err) {
        console.error(err)
        setError("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground animate-pulse">
        Loading profile data...
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-destructive">
        {error || "User not found"}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const joinDate = formatDate(profile.created_at)
  const initials = profile.name ? profile.name.substring(0, 2).toUpperCase() : "U"

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      
    {/* --- Profile Header --- */}
    <div className="relative">
      <div className="absolute top-0 left-0 w-full h-36 bg-gradient-to-r from-primary/5 to-transparent rounded-xl -z-10" />

      <div className="flex flex-col md:flex-row gap-8 items-start pt-8 px-6">
        {/* Avatar */}
        <Avatar className="w-32 h-32 border-4 border-background shadow-xl shrink-0">
          <AvatarImage
            src={profile.profile_photo_url || ""}
            alt={profile.name}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Right content */}
        <div className="flex-1 space-y-5">
          {/* Name + follow */}
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight capitalize text-foreground">
                {profile.name}
              </h1>
              <p className="text-muted-foreground font-medium text-sm">
                {(profile as any).email}
              </p>
            </div>

            {!isOwnProfile && (
              <button
                onClick={handleFollowToggle}
                className={`
                  h-8 px-4 rounded-full text-sm font-medium transition
                  ${isFollowing
                    ? "border border-border bg-background hover:bg-destructive/10 hover:text-destructive"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"}
                `}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-foreground/80 leading-relaxed max-w-3xl text-base">
              {profile.bio}
            </p>
          )}

          {/* Stats + Friend */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="text-muted-foreground">
              <span className="font-semibold text-foreground">
                {profile.followers}
              </span>{" "}
              followers
            </div>

            {isFriend && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Users className="w-3.5 h-3.5" />
                Friends
              </div>
            )}
          </div>

          {/* Social links */}
          {profile.social_links?.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {profile.social_links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition"
                >
                  <LinkIcon className="w-4 h-4" />
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* Joined */}
          <div className="flex items-center gap-2 bg-secondary/30 w-fit px-3 py-1 rounded-full text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            Joined {joinDate}
          </div>
        </div>
      </div>
    </div>



    {/* Public data notice */}
      <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Public profile · showing publicly available data
      </div>

      {/* --- Stats Grid --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/60">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profile.folders?.length || 0}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Folders</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-border/60">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/10 text-white-500">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profile.posts?.length || 0}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Posts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Content Tabs --- */}
      <div>
        <Tabs defaultValue="folders" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="folders" className="px-6">Folders</TabsTrigger>
              <TabsTrigger value="posts" className="px-6">Standalone Posts</TabsTrigger>
            </TabsList>
          </div>

          {/* Folders Tab */}
          <TabsContent value="folders">
            {profile.folders && profile.folders.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.folders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    id={folder.id.toString()}
                    title={folder.name}
                    description={folder.description}
                    isPublic={true} 
                    onClick={() => router.push(`/folders/${folder.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed rounded-xl text-muted-foreground">
                <p>No folders created yet.</p>
              </div>
            )}
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts">
            {profile.posts && profile.posts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {profile.posts.map((post) => {
                   // Safe Tag Parsing: Handle empty strings or nulls gracefully
                   const tagsList = post.tags && post.tags.trim() !== ""
                    ? post.tags.split(',').map(t => t.trim()).filter(Boolean) 
                    : [];

                   return (
                    <Card key={post.id} className="overflow-hidden border-border/60 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md">
                      <CardHeader className="bg-secondary/5 pb-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-1.5">
                            <CardTitle className="text-xl font-bold capitalize text-primary">
                              {post.title}
                            </CardTitle>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(post.created_at)}
                              </span>
                              {post.updated_at !== post.created_at && (
                                <span className="flex items-center gap-1 text-primary/80">
                                  <Clock className="w-3.5 h-3.5" />
                                  Updated {formatDate(post.updated_at)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <Badge 
                            variant={post.visibility === "public" ? "default" : "secondary"}
                            className="w-fit capitalize"
                          >
                            {post.visibility === "public" ? <Globe className="w-3 h-3 mr-1"/> : null}
                            {post.visibility}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-6 space-y-6">
                        {/* Body Text */}
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                            {post.body}
                          </p>
                        </div>

                        {/* Images Section - FIXED */}
                        {post.images && post.images.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              <ImageIcon className="w-4 h-4" /> Attached Images
                            </div>
                            <div className="grid  gap-4">
                              {post.images.map((img) => (
                                <div key={img.id || img.url} className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                                  {/* 👇 FIXED: Using img.url instead of img object */}
                                  <img 
                                    src={img.url} 
                                    alt={img.label || "Attachment"} 
                                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-500" 
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Links Section - FIXED */}
                        {post.links && post.links.length > 0 && (
                          <div className="space-y-2">
                             <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              <LinkIcon className="w-4 h-4" /> External Links
                            </div>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {post.links.map((link) => (
                                <li key={link.id || link.url}>
                                  {/* 👇 FIXED: Using link.url for href and link.label for text */}
                                  <a 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="flex items-center gap-2 p-2 rounded-md bg-secondary/20 hover:bg-secondary/40 transition-colors text-sm text-blue-500 hover:underline truncate"
                                  >
                                    <LinkIcon className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{link.label || link.url}</span>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>

                      {/* Footer for Tags */}
                      {tagsList.length > 0 && (
                        <>
                          <Separator />
                          <CardFooter className="bg-secondary/5 pt-4">
                            <div className="flex flex-wrap gap-2">
                              {tagsList.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs font-normal border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                                  <Hash className="w-3 h-3 mr-0.5 opacity-50" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardFooter>
                        </>
                      )}
                    </Card>
                   )
                })}
              </div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed rounded-xl text-muted-foreground">
                <p>No standalone posts found.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}