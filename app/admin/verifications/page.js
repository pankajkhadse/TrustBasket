"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Users, Package, CheckCircle, XCircle, Eye, Clock, Phone, Mail, MapPin, Calendar, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminNavbar from "@/components/admin-navbar"

export default function AdminVerifications() {
  const [pendingUsers, setPendingUsers] = useState([
    {
      id: 1,
      name: "Rajesh Kumar",
      email: "rajesh@streetfood.com",
      phone: "+91 9876543210",
      type: "vendor",
      businessName: "Rajesh's Street Food",
      address: "MG Road, Bangalore",
      registrationDate: "2024-01-20",
      documents: ["business_license.pdf", "id_proof.pdf", "address_proof.pdf"],
      status: "pending",
      description: "Traditional South Indian street food vendor with 5 years experience",
    },
    {
      id: 2,
      name: "Priya Sharma",
      email: "priya@freshveggies.com",
      phone: "+91 9876543211",
      type: "supplier",
      businessName: "Fresh Veggies Co.",
      address: "Whitefield, Bangalore",
      registrationDate: "2024-01-19",
      documents: ["supplier_license.pdf", "quality_cert.pdf", "tax_registration.pdf"],
      status: "pending",
      description: "Organic vegetable supplier serving restaurants and vendors across Bangalore",
    },
    {
      id: 3,
      name: "Mohammed Ali",
      email: "ali@spicemaster.com",
      phone: "+91 9876543212",
      type: "supplier",
      businessName: "Spice Masters",
      address: "Commercial Street, Bangalore",
      registrationDate: "2024-01-18",
      documents: ["trade_license.pdf", "gst_certificate.pdf"],
      status: "pending",
      description: "Premium spice supplier with authentic Indian spices and seasonings",
    },
    {
      id: 4,
      name: "Sunita Devi",
      email: "sunita@homecooking.com",
      phone: "+91 9876543213",
      type: "vendor",
      businessName: "Sunita's Home Kitchen",
      address: "Koramangala, Bangalore",
      registrationDate: "2024-01-17",
      documents: ["food_license.pdf", "health_certificate.pdf"],
      status: "pending",
      description: "Home-style cooking specialist offering healthy and hygienic meals",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [selectedUser, setSelectedUser] = useState(null)
  const [verificationAction, setVerificationAction] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")

  const handleVerification = (userId, action, reason = "") => {
    setPendingUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, status: action, rejectionReason: reason } : user)),
    )
    setSelectedUser(null)
    setVerificationAction("")
    setRejectionReason("")
  }

  const filteredUsers = pendingUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || user.type === filterType
    const isPending = user.status === "pending"
    return matchesSearch && matchesFilter && isPending
  })

  const stats = {
    totalPending: pendingUsers.filter((u) => u.status === "pending").length,
    pendingVendors: pendingUsers.filter((u) => u.type === "vendor" && u.status === "pending").length,
    pendingSuppliers: pendingUsers.filter((u) => u.type === "supplier" && u.status === "pending").length,
    approvedToday: 5,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Verifications</h1>
          <p className="text-gray-600">Review and approve vendor and supplier registrations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPending}</p>
                  </div>
                  <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Vendors</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingVendors}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Suppliers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingSuppliers}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <Package className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved Today</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.approvedToday}</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search by name, business, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="vendor">Vendors Only</SelectItem>
                  <SelectItem value="supplier">Suppliers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Pending Verifications */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Verifications ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No pending verifications</p>
                <p className="text-gray-400">All registrations have been processed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`/placeholder.svg?height=48&width=48`} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                            <Badge variant={user.type === "vendor" ? "default" : "secondary"}>{user.type}</Badge>
                          </div>
                          <p className="text-sm font-medium text-gray-700 mb-1">{user.businessName}</p>
                          <p className="text-sm text-gray-600 mb-3">{user.description}</p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2" />
                              {user.email}
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2" />
                              {user.phone}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {user.address}
                            </div>
                          </div>

                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            Registered on {new Date(user.registrationDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Verification Details - {user.name}</DialogTitle>
                              <DialogDescription>
                                Review all information before approving or rejecting
                              </DialogDescription>
                            </DialogHeader>

                            <Tabs defaultValue="info" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="info">Basic Information</TabsTrigger>
                                <TabsTrigger value="documents">Documents</TabsTrigger>
                              </TabsList>

                              <TabsContent value="info" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                                    <p className="text-sm text-gray-900">{user.name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">User Type</label>
                                    <p className="text-sm text-gray-900 capitalize">{user.type}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Business Name</label>
                                    <p className="text-sm text-gray-900">{user.businessName}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Registration Date</label>
                                    <p className="text-sm text-gray-900">
                                      {new Date(user.registrationDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                    <p className="text-sm text-gray-900">{user.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Phone</label>
                                    <p className="text-sm text-gray-900">{user.phone}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Address</label>
                                  <p className="text-sm text-gray-900">{user.address}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Business Description</label>
                                  <p className="text-sm text-gray-900">{user.description}</p>
                                </div>
                              </TabsContent>

                              <TabsContent value="documents" className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Uploaded Documents
                                  </label>
                                  <div className="space-y-2">
                                    {user.documents.map((doc, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                      >
                                        <span className="text-sm text-gray-900">{doc}</span>
                                        <Button variant="outline" size="sm">
                                          <Eye className="h-4 w-4 mr-2" />
                                          View
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>

                            <div className="flex justify-end space-x-3 pt-4 border-t">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="destructive" onClick={() => setVerificationAction("reject")}>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reject Application</DialogTitle>
                                    <DialogDescription>
                                      Please provide a reason for rejecting this application
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Textarea
                                    placeholder="Enter rejection reason..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="min-h-[100px]"
                                  />
                                  <div className="flex justify-end space-x-3">
                                    <Button variant="outline" onClick={() => setRejectionReason("")}>
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleVerification(user.id, "rejected", rejectionReason)}
                                      disabled={!rejectionReason.trim()}
                                    >
                                      Reject Application
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Button
                                onClick={() => handleVerification(user.id, "approved")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          onClick={() => handleVerification(user.id, "approved")}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>

                        <Button
                          onClick={() => handleVerification(user.id, "rejected", "Quick rejection")}
                          variant="destructive"
                          size="sm"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
