'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Star, Bell, Settings2, Upload, X, Camera } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { Database } from '@/lib/database.types'
import { handleError, ErrorMessages } from '@/lib/error-utils'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earned_at: string | null
}

interface NotificationPreference {
  league_updates: boolean
  team_performance: boolean
  transfer_deadlines: boolean
  match_reminders: boolean
  achievement_alerts: boolean
}

interface UserProfile {
  id: string
  full_name: string
  username: string
  avatar_url: string | null
  bio: string | null
  favorite_team: string | null
  notifications_enabled: boolean
  notification_preferences: NotificationPreference
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    fetchProfile()
    fetchAchievements()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      
      // Set avatar preview if exists
      if (data.avatar_url) {
        const { data: avatarData } = await supabase
          .storage
          .from('avatars')
          .getPublicUrl(data.avatar_url)
        
        setAvatarPreview(avatarData.publicUrl)
      }
      
      setProfile(data)
    } catch (error) {
      handleError(error, {
        title: "Failed to Load Profile",
        context: "Profile Page"
      })
    }
  }

  const fetchAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        handleError(ErrorMessages.AUTH.NOT_LOGGED_IN, {
          context: "Achievements"
        })
        return
      }

      const { data, error } = await supabase
        .from('user_achievements')
        .select('*, achievements(*)')
        .eq('user_id', user.id)

      if (error) throw error
      setAchievements(data?.map(ua => ({
        ...ua.achievements,
        earned_at: ua.earned_at
      })) || [])
    } catch (error) {
      handleError(error, {
        title: "Failed to Load Achievements",
        context: "Achievements"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        handleError(ErrorMessages.AUTH.NOT_LOGGED_IN, {
          context: "Profile Update"
        })
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      setProfile(prev => prev ? { ...prev, ...updates } : null)
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
    } catch (error) {
      handleError(error, {
        title: "Profile Update Failed",
        context: "Profile"
      })
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      handleError(ErrorMessages.VALIDATION.INVALID_FORMAT("File size"), {
        title: "Invalid File",
        context: "Avatar Upload",
        shouldLog: false
      })
      return
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const uploadAvatar = async () => {
    if (!avatarFile || !profile) return

    try {
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `${profile.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile)

      if (uploadError) throw uploadError

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', profile.id)

      if (updateError) throw updateError

      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      })

      setAvatarFile(null)
    } catch (error) {
      handleError(error, {
        title: "Avatar Upload Failed",
        context: "Profile Picture"
      })
    }
  }

  const updateNotificationPreference = async (key: keyof NotificationPreference, value: boolean) => {
    if (!profile) return

    try {
      const newPreferences = {
        ...profile.notification_preferences,
        [key]: value
      }

      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: newPreferences })
        .eq('id', profile.id)

      if (error) throw error

      setProfile(prev => prev ? {
        ...prev,
        notification_preferences: newPreferences
      } : null)

      toast({
        title: "Success",
        description: "Notification preferences updated!",
      })
    } catch (error) {
      handleError(error, {
        title: "Preference Update Failed",
        context: "Notification Settings"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload Section */}
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarPreview || profile?.avatar_url || ''} />
                  <AvatarFallback>
                    {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Profile Picture</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      className="w-[200px]"
                      onChange={handleAvatarChange}
                    />
                    {avatarFile && (
                      <>
                        <Button onClick={uploadAvatar} size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAvatarFile(null)
                            setAvatarPreview(null)
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recommended: Square image, max 2MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile?.full_name || ''}
                    onChange={(e) => updateProfile({ full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profile?.username || ''}
                    onChange={(e) => updateProfile({ username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={profile?.bio || ''}
                    onChange={(e) => updateProfile({ bio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favoriteTeam">Favorite Team</Label>
                  <Input
                    id="favoriteTeam"
                    value={profile?.favorite_team || ''}
                    onChange={(e) => updateProfile({ favorite_team: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Track your progress and accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border ${
                      achievement.earned_at ? 'bg-accent/50' : 'opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {achievement.icon === 'trophy' && <Trophy className="h-5 w-5 text-yellow-500" />}
                      {achievement.icon === 'medal' && <Medal className="h-5 w-5 text-blue-500" />}
                      {achievement.icon === 'star' && <Star className="h-5 w-5 text-purple-500" />}
                      <div>
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        {achievement.earned_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Earned on {new Date(achievement.earned_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Customize how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Master Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-accent/50">
                <div>
                  <h3 className="font-semibold">Enable All Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Master switch for all notification types
                  </p>
                </div>
                <Switch
                  checked={profile?.notifications_enabled}
                  onCheckedChange={(checked) => updateProfile({ notifications_enabled: checked })}
                />
              </div>

              {/* Individual Notification Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h3 className="font-semibold">League Updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Get notified about league standings and results
                    </p>
                  </div>
                  <Switch
                    disabled={!profile?.notifications_enabled}
                    checked={profile?.notification_preferences.league_updates}
                    onCheckedChange={(checked) => 
                      updateNotificationPreference('league_updates', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h3 className="font-semibold">Team Performance</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about your team's performance
                    </p>
                  </div>
                  <Switch
                    disabled={!profile?.notifications_enabled}
                    checked={profile?.notification_preferences.team_performance}
                    onCheckedChange={(checked) => 
                      updateNotificationPreference('team_performance', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h3 className="font-semibold">Transfer Deadlines</h3>
                    <p className="text-sm text-muted-foreground">
                      Get reminded about upcoming transfer windows
                    </p>
                  </div>
                  <Switch
                    disabled={!profile?.notifications_enabled}
                    checked={profile?.notification_preferences.transfer_deadlines}
                    onCheckedChange={(checked) => 
                      updateNotificationPreference('transfer_deadlines', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h3 className="font-semibold">Match Reminders</h3>
                    <p className="text-sm text-muted-foreground">
                      Get notified before your players' matches
                    </p>
                  </div>
                  <Switch
                    disabled={!profile?.notifications_enabled}
                    checked={profile?.notification_preferences.match_reminders}
                    onCheckedChange={(checked) => 
                      updateNotificationPreference('match_reminders', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h3 className="font-semibold">Achievement Alerts</h3>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you earn new achievements
                    </p>
                  </div>
                  <Switch
                    disabled={!profile?.notifications_enabled}
                    checked={profile?.notification_preferences.achievement_alerts}
                    onCheckedChange={(checked) => 
                      updateNotificationPreference('achievement_alerts', checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 