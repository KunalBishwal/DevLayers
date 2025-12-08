"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Bell, Palette, Shield, LinkIcon, Camera, Save } from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const [name, setName] = useState("Alex Rivera")
  const [username, setUsername] = useState("alexrivera")
  const [bio, setBio] = useState("Full-stack developer learning in public. Building cool stuff.")
  const [email, setEmail] = useState("alex@example.com")
  const [website, setWebsite] = useState("alexrivera.dev")
  const [github, setGithub] = useState("alexrivera")
  const [twitter, setTwitter] = useState("alexriveradev")

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [weeklyDigest, setWeeklyDigest] = useState(true)

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={undefined || "/placeholder.svg"} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">AR</AvatarFallback>
              </Avatar>
              <Button size="icon" className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full">
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <h3 className="font-medium">Profile Photo</h3>
              <p className="text-sm text-muted-foreground">Click the camera icon to upload a new photo</p>
            </div>
          </div>

          {/* Basic info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
          </div>

          {/* Social links */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Social Links
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="yoursite.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input id="github" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="username"
                />
              </div>
            </div>
          </div>

          <Button className="gap-2 glow-sm press-effect">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
              </div>
              <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium">Weekly Digest</p>
                <p className="text-sm text-muted-foreground">Get a weekly summary of your activity</p>
              </div>
              <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Theme</h3>
            <div className="grid grid-cols-3 gap-4">
              <button className="p-4 rounded-lg border-2 border-primary bg-card text-center">
                <div className="w-full h-12 rounded bg-[#1a1a1f] mb-2" />
                <span className="text-sm font-medium">Dark</span>
              </button>
              <button className="p-4 rounded-lg border border-border bg-card text-center hover:border-primary/50 transition-colors">
                <div className="w-full h-12 rounded bg-white border mb-2" />
                <span className="text-sm font-medium">Light</span>
              </button>
              <button className="p-4 rounded-lg border border-border bg-card text-center hover:border-primary/50 transition-colors">
                <div className="w-full h-12 rounded bg-gradient-to-r from-[#1a1a1f] to-white mb-2" />
                <span className="text-sm font-medium">System</span>
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-border">
              <h3 className="font-medium mb-2">Change Password</h3>
              <p className="text-sm text-muted-foreground mb-4">Update your password to keep your account secure</p>
              <Button variant="outline">Change Password</Button>
            </div>

            <div className="p-4 rounded-lg border border-border">
              <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account</p>
              <Button variant="outline">Enable 2FA</Button>
            </div>

            <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/5">
              <h3 className="font-medium mb-2 text-destructive">Delete Account</h3>
              <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all data</p>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
