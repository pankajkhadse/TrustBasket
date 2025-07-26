"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

import { loginUser } from '@/apis/authApi';
import { useRouter } from "next/navigation"


export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<"admin" | "vendor" | "seller">("vendor")
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log(formData);
    // const res = await loginUser({ ...formData, role: selectedRole });
    // if (res.status) {
    if (selectedRole === 'vendor') {
      router.push('/vendor/dashboard')

    }
    if (selectedRole === 'seller') {
      router.push('/supplier/dashboard')

    }  
    if (selectedRole === 'admin') {
      router.push('/admin/dashboard')

    } 
         // }
    console.log("Login attempt:", { ...formData, role: selectedRole })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back to TrustBasket</CardTitle>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Select Your Role</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "admin", label: "Admin", color: "bg-purple-100 text-purple-700 border-purple-200" },
                    { value: "vendor", label: "Vendor", color: "bg-green-100 text-green-700 border-green-200" },
                    { value: "seller", label: "Seller", color: "bg-orange-100 text-orange-700 border-orange-200" },
                  ].map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value as any)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${selectedRole === role.value
                        ? role.color
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email/Phone Input */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email or Phone
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your email or phone number"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 h-12"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Remember me
                  </Label>
                </div>
                <Link href="/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium">
                Sign In
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-green-600 hover:text-green-700 font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
