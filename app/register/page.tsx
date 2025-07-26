"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowLeft, Upload, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<"vendor" | "seller">("vendor")
  const [showPassword, setShowPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Common fields
    fullName: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    // Vendor specific
    stallName: "",
    foodType: "",
    stallImage: null as File | null,
    // Seller specific
    businessName: "",
    fssaiLicense: "",
    certificate: null as File | null,
    productImage: null as File | null,
    businessType: "",
  })

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    // Handle registration logic here
    console.log("Registration data:", { ...formData, role: selectedRole })
  }

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData({ ...formData, [field]: file })
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-6">
              <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
              <CardTitle className="text-2xl font-bold text-gray-900">Join TrustBasket</CardTitle>
              <p className="text-gray-600 mt-2">Create your account and start connecting</p>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>
                    Step {currentStep} of {totalSteps}
                  </span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Role Selection & Basic Info */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Role Selection */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">I want to join as a</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          {
                            value: "vendor",
                            label: "Vendor",
                            desc: "I sell street food",
                            color: "bg-green-100 text-green-700 border-green-200",
                          },
                          {
                            value: "seller",
                            label: "Seller",
                            desc: "I supply raw materials",
                            color: "bg-orange-100 text-orange-700 border-orange-200",
                          },
                        ].map((role) => (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => setSelectedRole(role.value as any)}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                              selectedRole === role.value
                                ? role.color
                                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            <div className="font-medium">{role.label}</div>
                            <div className="text-sm opacity-75">{role.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="mt-1 h-12"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="mt-1 h-12"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="mt-1 h-12"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <div className="relative mt-1">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="h-12 pr-12"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Address & Role-Specific Info */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <Label htmlFor="address">Complete Address *</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="mt-1"
                        rows={3}
                        required
                      />
                    </div>

                    {selectedRole === "vendor" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="stallName">Stall/Shop Name *</Label>
                            <Input
                              id="stallName"
                              value={formData.stallName}
                              onChange={(e) => setFormData({ ...formData, stallName: e.target.value })}
                              className="mt-1 h-12"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="foodType">Type of Food *</Label>
                            <Select
                              value={formData.foodType}
                              onValueChange={(value) => setFormData({ ...formData, foodType: value })}
                            >
                              <SelectTrigger className="mt-1 h-12">
                                <SelectValue placeholder="Select food type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="north-indian">North Indian</SelectItem>
                                <SelectItem value="south-indian">South Indian</SelectItem>
                                <SelectItem value="chinese">Chinese</SelectItem>
                                <SelectItem value="fast-food">Fast Food</SelectItem>
                                <SelectItem value="beverages">Beverages</SelectItem>
                                <SelectItem value="sweets">Sweets & Desserts</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </>
                    )}

                    {selectedRole === "seller" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="businessName">Business Name *</Label>
                            <Input
                              id="businessName"
                              value={formData.businessName}
                              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                              className="mt-1 h-12"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="fssaiLicense">FSSAI License Number *</Label>
                            <Input
                              id="fssaiLicense"
                              value={formData.fssaiLicense}
                              onChange={(e) => setFormData({ ...formData, fssaiLicense: e.target.value })}
                              className="mt-1 h-12"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="businessType">Business Type *</Label>
                          <Select
                            value={formData.businessType}
                            onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                          >
                            <SelectTrigger className="mt-1 h-12">
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="retailer">Retailer</SelectItem>
                              <SelectItem value="wholesaler">Wholesaler</SelectItem>
                              <SelectItem value="distributor">Distributor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* Step 3: File Uploads */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {selectedRole === "vendor" && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Stall Image (Optional)</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-sm text-gray-600 mb-2">Upload an image of your stall</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload("stallImage", e.target.files?.[0] || null)}
                            className="hidden"
                            id="stallImage"
                          />
                          <Label htmlFor="stallImage" className="cursor-pointer">
                            <Button type="button" variant="outline" className="mt-2 bg-transparent">
                              Choose File
                            </Button>
                          </Label>
                          {formData.stallImage && (
                            <p className="text-sm text-green-600 mt-2 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {formData.stallImage.name}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedRole === "seller" && (
                      <>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">FSSAI Certificate *</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-sm text-gray-600 mb-2">Upload your FSSAI certificate</p>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload("certificate", e.target.files?.[0] || null)}
                              className="hidden"
                              id="certificate"
                              required
                            />
                            <Label htmlFor="certificate" className="cursor-pointer">
                              <Button type="button" variant="outline" className="mt-2 bg-transparent">
                                Choose File
                              </Button>
                            </Label>
                            {formData.certificate && (
                              <p className="text-sm text-green-600 mt-2 flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {formData.certificate.name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Product Image (Optional)
                          </Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-sm text-gray-600 mb-2">Upload an image of your products</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload("productImage", e.target.files?.[0] || null)}
                              className="hidden"
                              id="productImage"
                            />
                            <Label htmlFor="productImage" className="cursor-pointer">
                              <Button type="button" variant="outline" className="mt-2 bg-transparent">
                                Choose File
                              </Button>
                            </Label>
                            {formData.productImage && (
                              <p className="text-sm text-green-600 mt-2 flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {formData.productImage.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Previous
                    </Button>
                  )}

                  {currentStep < totalSteps ? (
                    <Button type="button" onClick={nextStep} className="ml-auto bg-green-600 hover:bg-green-700">
                      Next Step
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting} className="ml-auto bg-green-600 hover:bg-green-700">
                      {isSubmitting ? "Creating Account..." : "Create Account"}
                    </Button>
                  )}
                </div>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
                    Sign in here
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
