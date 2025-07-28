"use client"

import type React from "react"
import { toast } from "sonner"
import { useCallback, useState } from "react"
import { motion } from "framer-motion"
import { ShoppingCart, Package, User, MapPin, Briefcase, FileImage, ArrowRight, ArrowLeft, Eye, EyeOff, CheckCircle, Loader2, Info, Upload } from "lucide-react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { registerUser } from "@/apis/authApi"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<"buyer" | "supplier">("buyer")
  const [showPassword, setShowPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "buyer",
    location: {
      address: "",
      lng: 0,
      lat: 0,
    },
    supplierType: "",
    samplePhotoUrl: null as File | null,
    shopName: "",
    documents: {
      shopImgUrl: null as File | null,
      idProofUrl: null as File | null,
      gstNumber: "",
    },
  })

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100
  const router = useRouter();

  const showRequirements = (field: string) => {
    switch (field) {
      case 'phone':
        toast("Phone Number Requirements", {
          description: "Must be 10–15 digits only",
        });
        break;
      case 'password':
        toast("Password Requirements", {
          description: "Must be at least 6 characters",
        });
        break;
      case 'supplier':
        toast("Supplier Requirements", {
          description: "Please provide all required documents for verification",
        });
        break;
      default:
        break;
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: string[] = [];

    if (step === 1) {
      if (!formData.name.trim()) errors.push("Full name is required");
      if (!formData.phone.trim()) errors.push("Phone number is required");
      else if (!/^\d{10,15}$/.test(formData.phone)) errors.push("Phone must be 10-15 digits");
      if (!formData.password) errors.push("Password is required");
      else if (formData.password.length < 6) errors.push("Password must be at least 6 characters");
    }

    if (step === 2) {
      if (!formData.location.address.trim()) errors.push("Address is required");
      if (selectedRole === "supplier" && !formData.supplierType) {
        errors.push("Supplier type is required");
      }
    }

    if (step === 3 && selectedRole === "supplier") {
      if (!formData.samplePhotoUrl) errors.push("Sample product photo is required");
      if (!formData.documents.idProofUrl) errors.push("ID proof is required");
    }

    if (errors.length > 0) {
      toast.error("Validation Error", {
        description: errors.join(" | "),
      });
      return false;
    }

    return true;
  };
  const handleSubmit = async () => {
    if (currentStep < totalSteps) {
      // Not on the last step yet
      const isValid = validateStep(currentStep);
      if (isValid) {
        setCurrentStep(currentStep + 1); // Move to next step
      }
      return;
    }

    // Last step — perform final validation
    if (!validateStep(currentStep)) return;

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          form.append(key, value);
        } else if (typeof value === "object" && value !== null) {
          Object.entries(value).forEach(([subKey, subVal]) => {
            if (subVal instanceof File) {
              form.append(`${key}.${subKey}`, subVal);
            } else {
              form.append(`${key}.${subKey}`, subVal ?? "");
            }
          });
        } else {
          form.append(key, value as string);
        }
      });

      const response = await registerUser(formData);

      toast.success("Account created successfully!", {
        description: "Your account is under review.",
      });
      router.push('/login')

      // redirect or reset form
    } catch (err: any) {
      console.log(err.message);
      toast.error("Registration error", {
        description: err.response?.data?.message || err.message || "Something went wrong.",
      });
    }
  };

  const handleFileUpload = useCallback((field: string, file: File | null) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      requestIdleCallback(() => {
        toast.error("File too large", {
          description: "Maximum file size is 5MB",
        });
      });
      return;
    }

    if (!file.type.match(/image.*/)) {
      requestIdleCallback(() => {
        toast.error("Invalid file type", {
          description: "Only image files are allowed",
        });
      });
      return;
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, any>),
          [child]: file
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: file }));
    }

    requestIdleCallback(() => {
      toast.success("File uploaded", {
        description: `${file.name} was successfully selected`,
      });
    });
  }, []);

  const handleLocationChange = (field: keyof typeof formData.location, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    requestAnimationFrame(() => {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    });
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const RoleCard = ({ value, label, desc, icon }: { value: string, label: string, desc: string, icon: React.ReactNode }) => (
    <button
      type="button"
      onClick={() => setSelectedRole(value as any)}
      className={`p-6 rounded-xl border-2 text-left transition-all flex items-start gap-4 ${selectedRole === value
        ? "bg-primary/10 border-primary text-primary"
        : "bg-muted/50 border-muted hover:bg-muted"
        }`}
    >
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-lg">{label}</h3>
        <p className="text-sm text-muted-foreground mt-1">{desc}</p>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
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
                <div className="text-sm text-muted-foreground">
                  Step {currentStep} of {totalSteps}
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Join Vyapar Mitra
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Create your account and start connecting with the community
              </CardDescription>

              <Progress
                value={progress}
                className="h-2 mt-6 bg-muted/20 relative overflow-hidden"
              >
                <Progress
                  className="h-full w-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-in-out"
                  style={{ transform: `translateX(-${100 - progress}%)` }}
                />
              </Progress>
            </CardHeader>

            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-3 block">
                        I want to join as a *
                      </Label>
                      <div className="grid grid-cols-1 gap-4">
                        <RoleCard
                          value="buyer"
                          label="Buyer"
                          desc="I want to purchase products"
                          icon={<ShoppingCart className="h-5 w-5" />}
                        />
                        <RoleCard
                          value="supplier"
                          label="Supplier"
                          desc="I want to supply products"
                          icon={<Package className="h-5 w-5" />}
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Personal Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="flex items-center gap-1">
                            Full Name *
                            <button
                              type="button"
                              onClick={() => toast.info("Name Requirements", {
                                description: "Please enter your full legal name as per government ID",
                              })}
                              className="text-muted-foreground hover:text-primary"
                            >
                              <Info className="h-4 w-4" />
                            </button>
                          </Label>
                          <Input
                            id="name"
                            autoComplete="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="h-12"
                            placeholder="John Doe"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="flex items-center gap-1">
                            Phone Number *
                            <button
                              type="button"
                              onClick={() => showRequirements('phone')}
                              className="text-muted-foreground hover:text-primary"
                            >
                              <Info className="h-4 w-4" />
                            </button>
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            autoComplete="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="h-12"
                            placeholder="9876543210"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="h-12"
                            placeholder="john@example.com"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password" className="flex items-center gap-1">
                            Password *
                            <button
                              type="button"
                              onClick={() => showRequirements('password')}
                              className="text-muted-foreground hover:text-primary"
                            >
                              <Info className="h-4 w-4" />
                            </button>
                          </Label>
                          <div className="relative">
                            <Input
                              id="password"
                              autoComplete="new-password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              className="h-12 pr-12"
                              placeholder="••••••••"
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
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Business Location
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="flex items-center gap-1">
                          Complete Address *
                          <button
                            type="button"
                            onClick={() => toast.info("Address Requirements", {
                              description: "Please provide your complete business address for verification",
                            })}
                            className="text-muted-foreground hover:text-primary"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                        </Label>
                        <Textarea
                          id="address"
                          autoComplete="street-address"
                          value={formData.location.address}
                          onChange={(e) => handleLocationChange('address', e.target.value)}
                          rows={4}
                          placeholder="Street, City, State, Pincode"
                          required
                        />
                      </div>
                    </div>

                    {selectedRole === "supplier" && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-primary" />
                          Supplier Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="supplierType" className="flex items-center gap-1">
                              Supplier Type *
                              <button
                                type="button"
                                onClick={() => toast.info("Supplier Type", {
                                  description: "Select whether you're a farmer or vendor",
                                })}
                                className="text-muted-foreground hover:text-primary"
                              >
                                <Info className="h-4 w-4" />
                              </button>
                            </Label>
                            <Select
                              value={formData.supplierType}
                              onValueChange={(value) => setFormData({ ...formData, supplierType: value })}
                            >
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select supplier type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="farmer">Farmer</SelectItem>
                                <SelectItem value="vendor">Vendor</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="shopName">Business Name</Label>
                            <Input
                              id="shopName"
                              autoComplete="organization"
                              value={formData.shopName}
                              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                              className="h-12"
                              placeholder="Your business name"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                            <Input
                              id="gstNumber"
                              value={formData.documents.gstNumber}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                documents: {
                                  ...prev.documents,
                                  gstNumber: e.target.value
                                }
                              }))}
                              className="h-12"
                              placeholder="22AAAAA0000A1Z5"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedRole === "buyer" && (
                      <div className="space-y-2">
                        <Label htmlFor="shopName">Shop Name (Optional)</Label>
                        <Input
                          id="shopName"
                          autoComplete="organization"
                          value={formData.shopName}
                          onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                          className="h-12"
                          placeholder="Your shop name"
                        />
                      </div>
                    )}
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    {selectedRole === "buyer" && (
                      <div className="space-y-2">
                        <Label htmlFor="shopImgUrl">
                          Shop Image (Optional)
                        </Label>
                        <div className="border-2 border-dashed border-muted rounded-xl p-6 text-center hover:border-primary transition-colors relative">
                          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground mb-2">Upload an image of your shop</p>
                          <input
                            type="file"
                            accept="image/*"
                            id="shopImgUrl"
                            onChange={(e) => handleFileUpload("shopImgUrl", e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => document.getElementById("shopImgUrl")?.click()}
                          >
                            Choose File
                          </Button>
                          {formData.documents?.shopImgUrl && (
                            <p className="text-sm text-green-600 mt-3 flex items-center justify-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              {formData.documents.shopImgUrl.name}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="flex justify-between pt-8">
                  {currentStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </Button>
                  ) : (
                    <div />
                  )}

                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="ml-auto bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="ml-auto bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>

              <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary font-medium hover:underline">
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