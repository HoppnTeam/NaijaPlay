'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { SocialButton } from "@/components/ui/social-button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { AlertCircle, Chrome } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { handleError, ErrorMessages } from '@/lib/error-utils'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Show success/error messages from URL params
  useEffect(() => {
    const message = searchParams.get('message')
    const error = searchParams.get('error')

    if (message) {
      toast({
        title: "Success",
        description: message,
      })
    }

    if (error) {
      setError(error)
    }
  }, [searchParams, toast])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
      
      router.refresh()
    } catch (error) {
      handleError(error, {
        title: "Login Failed",
        context: "Authentication",
      })
      setError(error instanceof Error ? error.message : ErrorMessages.AUTH.INVALID_CREDENTIALS)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setSocialLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
    } catch (error) {
      console.error("Error with Google login:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
      setSocialLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link 
              href="/signup"
              className="text-[#008753] hover:underline"
            >
              Create an account
            </Link>
            <Link 
              href="/reset-password"
              className="text-[#008753] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#008753] hover:bg-[#006B42]"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <SocialButton
            icon={Chrome}
            onClick={handleGoogleLogin}
            disabled={socialLoading}
            loading={socialLoading}
          >
            Google
          </SocialButton>
        </form>
      </CardContent>
    </Card>
  )
}

