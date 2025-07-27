"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowLeft, Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { loginUser } from '@/apis/authApi'
import { toast } from "sonner"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  })

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const identifier = formData.identifier.trim()
    const password = formData.password.trim()

    if (!identifier || !password) {
      toast.error("Validation Error", {
        description: "Please enter both email/phone and password",
      });
      setIsSubmitting(false)
      return
    }

    try {
      const res = await loginUser({
        identifier,
        password
      })

      if (res?.token) {
        toast.success("Login Successful", {
          description: "Redirecting to your dashboard...",
        });

        if (formData.rememberMe) {
          localStorage.setItem('token', res.token)
        }

        setTimeout(() => {
          if (res.role === 'admin') {
            router.push('/admin/dashboard')
          } else if (res.role === 'vendor') {
            router.push('/vendor/dashboard')
          } else if (res.role === 'seller') {
            router.push('/supplier/dashboard')
          } else {
            router.push('/')
          }
        }, 1500)
      } else {
        toast.error("Login Failed", {
        description: res?.message || "An error occurred during login",
      });
        throw new Error(res?.message || "Invalid credentials")
      }
    } catch (err: any) {
      console.error("Login error:", err?.message || err); // better for debugging

toast.error("Login Failed", {
  description:
    err?.response?.data?.message ||
    err?.message ||
    "An unexpected error occurred during login.",
});

    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 py-8 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="text-center pb-6 bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex justify-between items-center mb-4">
                <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </div>
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Sign in to your TrustBasket account
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Identifier Input */}
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="flex items-center gap-1">
                    Email or Phone *
                    <button
                      type="button"
                      onClick={() => toast("Login Identifier", {
                        description: "Enter your registered email address or phone number",
                      })}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </Label>
                  <Input
                    id="identifier"
                    type="text"
                    autoComplete="email"
                    placeholder="john@example.com or 9876543210"
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    className="h-12"
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-1">
                    Password *
                    <button
                      type="button"
                      onClick={() => toast("Password Requirements", {
                        description: "Enter your account password (minimum 6 characters)",
                      })}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="h-12 pr-12"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked as boolean })}
                    />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground">
                      Remember me
                    </Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
       
             {/* Register Link */}
              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>
                  Don't have an account?{" "}
                  <Link href="/register" className="text-primary font-medium hover:underline">
                    Sign up here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}