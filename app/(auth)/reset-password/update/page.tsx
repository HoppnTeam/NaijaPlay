"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"
import { PasswordRequirements } from "@/components/ui/password-requirements"
import { validatePassword } from "@/lib/utils/password"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    // Check if we have a session when the component mounts
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      // If no user, redirect to login
      if (!user) {
        router.push('/login')
      }
    }

    checkSession()
  }, [router])

  const handleBlur = () => {
    setTouched(true)
  }

  const getPasswordError = () => {
    if (!touched) return null
    const { isValid, errors } = validatePassword(password)
    return !isValid ? errors[0] : null
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate password
    const { isValid, errors } = validatePassword(password)
    if (!isValid) {
      setError(errors[0])
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      // Password updated successfully
      router.push('/login?message=Password updated successfully')
    } catch (error) {
      console.error("Error updating password:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const passwordError = getPasswordError()

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Set New Password</CardTitle>
        <CardDescription className="text-center">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Input
              id="password"
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={handleBlur}
              required
              disabled={loading}
            />
            {passwordError && (
              <div className="flex items-center text-sm text-red-500 mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {passwordError}
              </div>
            )}
            <PasswordRequirements password={password} />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#008753] hover:bg-[#006B42]"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 