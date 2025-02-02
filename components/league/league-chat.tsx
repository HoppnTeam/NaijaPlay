'use client'

import { useEffect, useState, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { handleError, ErrorMessages } from '@/lib/error-utils'

interface Message {
  id: string
  league_id: string
  user_id: string
  content: string
  created_at: string
  profiles: {
    full_name: string
    avatar_url: string | null
  }
}

interface LeagueChatProps {
  leagueId: string
}

export function LeagueChat({ leagueId }: LeagueChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchMessages()
    subscribeToMessages()
  }, [leagueId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('league_messages')
        .select('*, profiles(full_name, avatar_url)')
        .eq('league_id', leagueId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data as Message[])
    } catch (error) {
      handleError(error, {
        title: "Failed to Load Messages",
        context: "League Chat"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('league_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'league_messages',
          filter: `league_id=eq.${leagueId}`
        },
        async (payload) => {
          // Fetch the complete message with user profile
          const { data, error } = await supabase
            .from('league_messages')
            .select('*, profiles(full_name, avatar_url)')
            .eq('id', payload.new.id)
            .single()

          if (!error && data) {
            setMessages(prev => [...prev, data as Message])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      handleError(ErrorMessages.AUTH.NOT_LOGGED_IN, {
        context: "League Chat",
        shouldLog: false
      })
      return
    }

    try {
      const { error } = await supabase
        .from('league_messages')
        .insert({
          league_id: leagueId,
          user_id: user.id,
          content: newMessage.trim()
        })

      if (error) throw error

      setNewMessage('')
    } catch (error) {
      handleError(error, {
        title: "Message Failed",
        context: "League Chat"
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>League Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading chat...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>League Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={message.profiles.avatar_url || undefined} />
                    <AvatarFallback>
                      {message.profiles.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{message.profiles.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
} 