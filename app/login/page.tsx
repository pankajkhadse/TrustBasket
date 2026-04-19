"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { useSignIn } from "@clerk/nextjs"
import { isClerkAPIResponseError } from "@clerk/nextjs/errors"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const { signIn, setActive, isLoaded } = useSignIn()

  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || isSubmitting) return

    const trimmedId = identifier.trim()
    const trimmedPass = password.trim()

    if (!trimmedId) {
      toast.error("Please enter your email or phone number")
      return
    }
    if (!trimmedPass) {
      toast.error("Please enter your password")
      return
    }

    // No phone formatting needed - Clerk is configured for email auth only
    const finalIdentifier = trimmedId

    setIsSubmitting(true)

    try {
      const result = await signIn!.create({
        identifier: finalIdentifier,
        password: trimmedPass,
      })

      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId })
        toast.success("Login successful!")
        router.push("/")
        router.refresh()
      } else {
        // Handle multi-factor or other incomplete states
        toast.error("Sign in requires additional verification")
      }
    } catch (err: any) {
      if (isClerkAPIResponseError(err)) {
        const msg = err.errors[0]?.longMessage || err.errors[0]?.message || "Sign in failed"
        toast.error(msg)
      } else {
        toast.error(err?.message || "Sign in failed. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-8 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="text-center pb-6 bg-gradient-to-r from-green-600/10 to-orange-500/10">
              <div className="flex items-center mb-4">
                <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </div>

              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">V</span>
                </div>
              </div>

              <CardTitle className="text-3xl font-bold text-gray-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to your Vyapar Mitra account
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="identifier"
                    type="email"
                    autoComplete="email"
                    className="h-12"
                    placeholder="you@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      autoComplete="current-password"
                      className="h-12 pr-12"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !isLoaded}
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-green-600 font-medium hover:underline">
                  Sign up here
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
