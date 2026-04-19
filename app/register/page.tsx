"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  ShoppingCart,
  Package,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { useSignUp, useClerk } from "@clerk/nextjs"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

import { registerUserInDB } from "../actions/register-user"

type Role = "buyer" | "supplier"

export default function RegisterPage() {
  const router = useRouter()
  const clerk = useClerk()
  const { signUp, setActive, isLoaded } = useSignUp()

  const [selectedRole, setSelectedRole] = useState<Role>("buyer")
  const [showPassword, setShowPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    address: "",
    supplierType: "",
    shopName: "",
  })

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const [isVerifying, setIsVerifying] = useState(false)
  const [otp, setOtp] = useState("")
  const [pendingPhone, setPendingPhone] = useState<string | undefined>(undefined)

  /* ---------------- HELPERS ---------------- */
  const update = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))

  /* ---------------- VALIDATION ---------------- */
  const validateStep = (step: number): boolean => {
    const errors: string[] = []

    if (step === 1) {
      if (!formData.name.trim()) errors.push("Full name is required")
      if (!formData.email.trim())
        errors.push("Email is required")
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        errors.push("Invalid email address")
      if (formData.phone) {
        const raw = formData.phone.replace(/[\s\-\(\)]/g, "")
        if (!/^\+?\d{5,15}$/.test(raw))
          errors.push("Invalid phone number")
      }
      if (formData.password.length < 8)
        errors.push("Password must be at least 8 characters")
    }

    if (step === 2) {
      if (!formData.address.trim()) errors.push("Address is required")
      if (selectedRole === "supplier" && !formData.supplierType)
        errors.push("Supplier type is required")
    }

    if (errors.length) {
      toast.error(errors[0], { description: errors.slice(1).join(" | ") || undefined })
      return false
    }

    return true
  }

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (currentStep < totalSteps) {
      if (validateStep(currentStep)) setCurrentStep((s) => s + 1)
      return
    }

    if (!validateStep(currentStep) || !isLoaded || isSubmitting) return
    setIsSubmitting(true)

    try {
      // Format phone to E.164 if provided
      const rawPhone = (formData.phone || "").replace(/[\s\-\(\)]/g, "")
      const formattedPhone = rawPhone
        ? rawPhone.startsWith("+") ? rawPhone : `+91${rawPhone}`
        : undefined

      setPendingPhone(formattedPhone)

      // Create Clerk account with only email + password
      const result = await signUp!.create({
        emailAddress: formData.email,
        password: formData.password,
      })

      if (result.status === "complete") {
        // No email verification required (e.g. dev mode without verification)
        await setActive!({ session: result.createdSessionId })

        await registerUserInDB({
          name: formData.name,
          phone: formattedPhone,
          email: formData.email || undefined,
          role: selectedRole === "buyer" ? "BUYER" : "SUPPLIER",
          address: formData.address,
          supplierType: formData.supplierType as any || undefined,
          shopName: formData.shopName || undefined,
        })

        if (clerk.session) await clerk.session.reload()
        toast.success("Account created!", { description: "Waiting for admin approval." })
        router.push("/")
        router.refresh()
      } else if (result.status === "missing_requirements") {
        // Email verification required – send the OTP email
        await signUp!.prepareEmailAddressVerification({ strategy: "email_code" })
        setIsVerifying(true)
        setIsSubmitting(false)
        toast.success("Verification code sent!", { description: `Check your inbox at ${formData.email}` })
      } else {
        toast.error("Account creation incomplete. Please try again.")
        setIsSubmitting(false)
      }
    } catch (err: any) {
      if (isClerkAPIResponseError(err)) {
        const msg = err.errors[0]?.longMessage || err.errors[0]?.message || "Registration failed"
        toast.error(msg)
      } else {
        toast.error(err?.message || "Registration failed. Please try again.")
      }
      setIsSubmitting(false)
    }
  }

  /* ---------------- OTP VERIFY ---------------- */
  const handleVerifyEmail = async () => {
    if (!otp.trim() || otp.length < 6) {
      toast.error("Please enter the 6-digit code sent to your email")
      return
    }
    if (!isLoaded || isSubmitting) return
    setIsSubmitting(true)
    try {
      const result = await signUp!.attemptEmailAddressVerification({ code: otp })

      if (result.status !== "complete") {
        toast.error("Verification failed. Please check your code and try again.")
        setIsSubmitting(false)
        return
      }

      await setActive!({ session: result.createdSessionId })

      await registerUserInDB({
        name: formData.name,
        phone: pendingPhone,
        email: formData.email || undefined,
        role: selectedRole === "buyer" ? "BUYER" : "SUPPLIER",
        address: formData.address,
        supplierType: formData.supplierType as any || undefined,
        shopName: formData.shopName || undefined,
      })

      if (clerk.session) {
        await clerk.session.reload()
      }

      toast.success("Account created!", { description: "Waiting for admin approval." })
      router.push("/")
      router.refresh()
    } catch (err: any) {
      if (isClerkAPIResponseError(err)) {
        toast.error(err.errors[0]?.longMessage || err.errors[0]?.message || "Verification failed")
      } else {
        toast.error(err?.message || "Verification failed")
      }
      setIsSubmitting(false)
    }
  }


  const RoleCard = ({
    value,
    label,
    desc,
    icon,
  }: {
    value: Role
    label: string
    desc: string
    icon: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={() => setSelectedRole(value)}
      className={`p-5 rounded-xl border-2 flex gap-4 text-left transition-all ${
        selectedRole === value
          ? "border-green-600 bg-green-50"
          : "border-gray-200 bg-gray-50 hover:border-gray-300"
      }`}
    >
      <div className={`p-2 rounded-lg ${selectedRole === value ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{label}</h3>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </button>
  )

  /* ---------------- RENDER ---------------- */

  // Email verification screen
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-8 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="text-center bg-gradient-to-r from-green-600/10 to-orange-500/10 pb-4">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">✉</span>
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Verify Your Email</CardTitle>
                <CardDescription className="text-gray-600">
                  We sent a 6-digit code to <strong>{formData.email}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-medium text-gray-700">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    className="h-12 text-center text-xl font-mono tracking-widest"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>

                <Button
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleVerifyEmail}
                  disabled={isSubmitting || otp.length < 6}
                >
                  {isSubmitting ? (
                    <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Verifying...</>
                  ) : (
                    <><CheckCircle className="mr-2 h-4 w-4" /> Verify & Create Account</>
                  )}
                </Button>

                <p className="text-center text-sm text-gray-500">
                  Didn&apos;t receive the code?{" "}
                  <button
                    type="button"
                    className="text-green-600 hover:underline font-medium"
                    onClick={async () => {
                      await signUp!.prepareEmailAddressVerification({ strategy: "email_code" })
                      toast.success("Code resent!")
                    }}
                  >
                    Resend
                  </button>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="text-center bg-gradient-to-r from-green-600/10 to-orange-500/10">
              <div className="flex justify-between mb-4">
                <Link href="/" className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Link>
                <span className="text-sm text-gray-500">
                  Step {currentStep} / {totalSteps}
                </span>
              </div>

              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">V</span>
                </div>
              </div>

              <CardTitle className="text-3xl font-bold text-gray-900">
                Join Vyapar Mitra
              </CardTitle>
              <CardDescription className="text-gray-600">Create your account</CardDescription>
              <Progress value={progress} className="mt-4 h-2" />
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* STEP 1 — Credentials */}
              {currentStep === 1 && (
                <>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      I want to join as *
                    </Label>
                    <div className="grid gap-3">
                      <RoleCard
                        value="buyer"
                        label="Buyer / Vendor"
                        desc="Purchase raw materials for my street food stall"
                        icon={<ShoppingCart className="h-5 w-5" />}
                      />
                      <RoleCard
                        value="supplier"
                        label="Supplier"
                        desc="Supply ingredients and raw materials to vendors"
                        icon={<Package className="h-5 w-5" />}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="name" className="text-sm text-gray-700">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Rajesh Kumar"
                        value={formData.name}
                        onChange={update("name")}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-sm text-gray-700">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={update("email")}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-sm text-gray-700">Phone (optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={update("phone")}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="password" className="text-sm text-gray-700">Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          autoComplete="new-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 8 characters"
                          value={formData.password}
                          onChange={update("password")}
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">* Email is required for account creation. Phone is saved for your profile.</p>
                </>
              )}

              {/* STEP 2 — Location */}
              {currentStep === 2 && (
                <>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-700">Complete Address *</Label>
                    <Textarea
                      placeholder="Street, Area, City, State, PIN"
                      value={formData.address}
                      onChange={update("address")}
                      className="min-h-[100px]"
                      disabled={isSubmitting}
                    />
                  </div>

                  {selectedRole === "supplier" && (
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-700">Supplier Type *</Label>
                      <Select
                        value={formData.supplierType}
                        onValueChange={(v) =>
                          setFormData((prev) => ({ ...prev, supplierType: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FARMER">Farmer</SelectItem>
                          <SelectItem value="VENDOR">Wholesale Vendor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-sm text-gray-700">Shop / Business Name (optional)</Label>
                    <Input
                      placeholder="My Shop Name"
                      value={formData.shopName}
                      onChange={update("shopName")}
                      disabled={isSubmitting}
                    />
                  </div>
                </>
              )}

              {/* STEP 3 — Review */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Review Your Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Role</span><span className="font-medium capitalize">{selectedRole}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{formData.name}</span></div>
                    {formData.email && <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">{formData.email}</span></div>}
                    {formData.phone && <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">{formData.phone}</span></div>}
                    <div className="flex justify-between"><span className="text-gray-500">Address</span><span className="font-medium text-right max-w-[60%]">{formData.address}</span></div>
                    {formData.shopName && <div className="flex justify-between"><span className="text-gray-500">Shop</span><span className="font-medium">{formData.shopName}</span></div>}
                  </div>
                  <p className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded p-3">
                    ⚠️ Your account will be reviewed by our admin team before activation. You&apos;ll be notified once approved.
                  </p>
                </div>
              )}

              {/* NAVIGATION */}
              <div className="flex justify-between pt-2">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep((s) => s - 1)}
                    disabled={isSubmitting}
                  >
                    Previous
                  </Button>
                ) : (
                  <div />
                )}

                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isLoaded}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" /> Creating...
                    </>
                  ) : currentStep < totalSteps ? (
                    <>
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Create Account <CheckCircle className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-green-600 font-medium hover:underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Clerk CAPTCHA */}
      <div id="clerk-captcha" />
    </div>
  )
}
