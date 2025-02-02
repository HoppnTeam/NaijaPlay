'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import { PasswordRequirements } from "@/components/ui/password-requirements"
import { validatePassword } from "@/lib/utils/password"
import { AlertCircle } from "lucide-react"
import { SocialButton } from "@/components/ui/social-button"
import { Chrome } from "lucide-react"
import { handleError, ErrorMessages } from '@/lib/error-utils'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  })
  const [socialLoading, setSocialLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBlur = (field: "password" | "confirmPassword") => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const getPasswordError = () => {
    if (!touched.password) return null
    const { isValid, errors } = validatePassword(formData.password)
    return !isValid ? errors[0] : null
  }

  const getConfirmPasswordError = () => {
    if (!touched.confirmPassword) return null
    return formData.password !== formData.confirmPassword
      ? "Passwords do not match"
      : null
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate password
    const { isValid, errors } = validatePassword(formData.password)
    if (!isValid) {
      setError(errors[0])
      return
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(ErrorMessages.VALIDATION.PASSWORD_MISMATCH)
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      })

      if (signUpError) throw signUpError

      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: formData.email,
              full_name: formData.fullName,
              role: 'user',
            },
          ])

        if (profileError) throw profileError

        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      handleError(error, {
        title: "Sign Up Failed",
        context: "User Registration",
      })
      setError(error instanceof Error ? error.message : ErrorMessages.DATA.CREATE_ERROR)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
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
      console.error("Error with Google signup:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
      setSocialLoading(false)
    }
  }

  const passwordError = getPasswordError()
  const confirmPasswordError = getConfirmPasswordError()

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
        <CardDescription className="text-center">
          Enter your details to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur("password")}
              required
              disabled={loading}
            />
            {passwordError && (
              <div className="flex items-center text-sm text-red-500 mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {passwordError}
              </div>
            )}
            <PasswordRequirements password={formData.password} />
          </div>

          <div className="space-y-2">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={() => handleBlur("confirmPassword")}
              required
              disabled={loading}
            />
            {confirmPasswordError && (
              <div className="flex items-center text-sm text-red-500 mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {confirmPasswordError}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#008753] hover:bg-[#006B42]"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
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
            onClick={handleGoogleSignUp}
            disabled={socialLoading}
            loading={socialLoading}
          >
            Google
          </SocialButton>

          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-[#008753] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
