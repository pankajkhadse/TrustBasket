"use client"

import React from "react"
import { useState, useRef } from "react"
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

import { useUser, useClerk } from "@clerk/nextjs"

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

export default function OnboardPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const clerk = useClerk()
  const formRef = useRef<HTMLFormElement>(null)

  const [selectedRole, setSelectedRole] =
    useState<"BUYER" | "SUPPLIER">("BUYER")
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    supplierType: "",
    shopName: "",
  })

  // Prefill data once user is loaded
  React.useEffect(() => {
    if (isLoaded && user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.fullName || "",
        phone: prev.phone || user.primaryPhoneNumber?.phoneNumber || "",
      }))
    }
  }, [isLoaded, user])

  // ...

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  // ---------------- AUTH GUARD ----------------
  if (!isLoaded) return null
  if (!user) {
    router.push("/sign-up")
    return null
  }

  /* ---------------- VALIDATION ---------------- */

  const validateStep = (step: number): boolean => {
    const errors: string[] = []

    if (step === 1) {
      if (!formData.name.trim()) errors.push("Full name is required")
      // Phone is optional, but if entered it must be valid
      if (formData.phone) {
        const rawPhone = formData.phone.replace(/[\s\-\(\)]/g, '')
        if (!/^\+?\d{5,15}$/.test(rawPhone))
          errors.push("Phone number can only contain digits")
      }
    }

    if (step === 2) {
      if (!formData.address.trim()) errors.push("Address is required")
      if (selectedRole === "SUPPLIER" && !formData.supplierType)
        errors.push("Supplier type is required")
    }

    if (errors.length) {
      toast.error("Validation Error", {
        description: errors.join(" | "),
      })
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

    if (!validateStep(currentStep) || isSubmitting) return

    setIsSubmitting(true)

    try {
      const rawPhone = formData.phone.replace(/[\s\-\(\)]/g, '')
      const formattedPhone = rawPhone.startsWith("+") 
        ? rawPhone 
        : `+91${rawPhone}`

      await registerUserInDB({
        name: formData.name,
        phone: formattedPhone,
        email: user.primaryEmailAddress?.emailAddress,
        role: selectedRole,
        address: formData.address,
        supplierType:
          selectedRole === "SUPPLIER"
            ? (formData.supplierType as "FARMER" | "VENDOR")
            : undefined,
        shopName: formData.shopName || undefined,
      })

      if (clerk.session) {
        await clerk.session.reload()
      }

      toast.success("Profile completed", {
        description: "Waiting for admin approval",
      })

      router.push("/")
    } catch (err: any) {
      toast.error("Onboarding failed", {
        description: err.message || "Something went wrong",
      })
      setIsSubmitting(false)
    }
  }

  /* ---------------- UI HELPERS ---------------- */

  const RoleCard = ({
    value,
    label,
    desc,
    icon,
  }: {
    value: "BUYER" | "SUPPLIER"
    label: string
    desc: string
    icon: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={() => setSelectedRole(value)}
      className={`p-6 rounded-xl border-2 flex gap-4 text-left ${
        selectedRole === value
          ? "border-primary bg-primary/10"
          : "border-muted bg-muted/50"
      }`}
    >
      <div className="p-2 rounded bg-primary/10 text-primary">{icon}</div>
      <div>
        <h3 className="font-semibold">{label}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </button>
  )

  /* ---------------- RENDER ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="text-center">
              <div className="flex justify-between mb-4">
                <Link href="/" className="text-primary flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Link>
                <span className="text-sm text-muted-foreground">
                  Step {currentStep} / {totalSteps}
                </span>
              </div>

              <CardTitle className="text-3xl font-bold">
                Complete Your Profile
              </CardTitle>

              <CardDescription>Tell us about yourself</CardDescription>
              <Progress value={progress} className="mt-6 h-2" />
            </CardHeader>

            <CardContent className="p-6 space-y-8">
              {/* STEP 1 */}
              {currentStep === 1 && (
                <>
                  <Label>I want to join as *</Label>
                  <div className="grid gap-4">
                    <RoleCard
                      value="BUYER"
                      label="Buyer"
                      desc="Purchase products"
                      icon={<ShoppingCart />}
                    />
                    <RoleCard
                      value="SUPPLIER"
                      label="Supplier"
                      desc="Supply products"
                      icon={<Package />}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Phone *"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <>
                  <Textarea
                    placeholder="Complete Address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />

                  {selectedRole === "SUPPLIER" && (
                    <Select
                      value={formData.supplierType}
                      onValueChange={(v) =>
                        setFormData({ ...formData, supplierType: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Supplier Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FARMER">Farmer</SelectItem>
                        <SelectItem value="VENDOR">Vendor</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  <Input
                    placeholder="Shop Name (optional)"
                    value={formData.shopName}
                    onChange={(e) =>
                      setFormData({ ...formData, shopName: e.target.value })
                    }
                  />
                </>
              )}

              {/* ACTIONS */}
              <div className="flex justify-between pt-4">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep((s) => s - 1)}
                  >
                    Previous
                  </Button>
                )}

                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2" /> Saving...
                    </>
                  ) : currentStep < totalSteps ? (
                    <>
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Submit <CheckCircle className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
