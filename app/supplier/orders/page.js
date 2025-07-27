"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Package, Clock, CheckCircle, XCircle, Eye, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import SupplierNavbar from "@/components/supplier-navbar"

export default function SupplierOrders() {
  const [orders, setOrders] = useState([
    {
      id: "ORD-001",
      vendorName: "Rajesh's Street Food",
      vendorPhone: "+91 98765 43210",
      vendorAddress: "Karol Bagh, New Delhi",
      items: [
        { name: "Fresh Tomatoes", quantity: 10, unit: "kg", price: 40, total: 400 },
        { name: "Green Chilies", quantity: 2, unit: "kg", price: 80, total: 160 },
      ],
      totalAmount: 560,
      status: "pending",
      orderDate: "2024-01-20T10:30:00Z",
      notes: "Need fresh vegetables for evening rush",
    },
    {
      id: "ORD-002",
      vendorName: "Mumbai Chaat House",
      vendorPhone: "+91 98765 43211",
      vendorAddress: "Civil Lines, New Delhi",
      items: [{ name: "Fresh Tomatoes", quantity: 15, unit: "kg", price: 40, total: 600 }],
      totalAmount: 600,
      status: "accepted",
      orderDate: "2024-01-19T14:15:00Z",
      acceptedDate: "2024-01-19T15:00:00Z",
      notes: "Regular weekly order",
    },
    {
      id: "ORD-003",
      vendorName: "Delhi Street Kitchen",
      vendorPhone: "+91 98765 43212",
      vendorAddress: "Lajpat Nagar, New Delhi",
      items: [{ name: "Green Chilies", quantity: 5, unit: "kg", price: 80, total: 400 }],
      totalAmount: 400,
      status: "rejected",
      orderDate: "2024-01-18T09:45:00Z",
      rejectedDate: "2024-01-18T10:30:00Z",
      rejectionReason: "Out of stock",
      notes: "Urgent requirement",
    },
    {
      id: "ORD-004",
      vendorName: "Tasty Bites Corner",
      vendorPhone: "+91 98765 43213",
      vendorAddress: "Connaught Place, New Delhi",
      items: [
        { name: "Fresh Tomatoes", quantity: 8, unit: "kg", price: 40, total: 320 },
        { name: "Green Chilies", quantity: 3, unit: "kg", price: 80, total: 240 },
      ],
      totalAmount: 560,
      status: "pending",
      orderDate: "2024-01-20T16:20:00Z",
      notes: "Please pack carefully",
    },
  ])

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)

  const handleAcceptOrder = (orderId) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: "accepted", acceptedDate: new Date().toISOString() } : order,
      ),
    )

    // In real app, this would trigger a notification to the vendor
    console.log(`Order ${orderId} accepted - notification sent to vendor`)
  }

  const handleRejectOrder = (orderId, reason) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "rejected",
              rejectedDate: new Date().toISOString(),
              rejectionReason: reason,
            }
          : order,
      ),
    )

    setIsRejectDialogOpen(false)
    setRejectionReason("")
    setSelectedOrder(null)

    // In real app, this would trigger a notification to the vendor
    console.log(`Order ${orderId} rejected - notification sent to vendor`)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return Clock
      case "accepted":
        return CheckCircle
      case "rejected":
        return XCircle
      default:
        return Package
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === "pending").length,
    acceptedOrders: orders.filter((order) => order.status === "accepted").length,
    rejectedOrders: orders.filter((order) => order.status === "rejected").length,
    totalRevenue: orders
      .filter((order) => order.status === "accepted")
      .reduce((sum, order) => sum + order.totalAmount, 0),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SupplierNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">Manage incoming orders from vendors</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                </div>
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold text-green-600">{stats.acceptedOrders}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejectedOrders}</p>
                </div>
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <XCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, index) => {
                    const StatusIcon = getStatusIcon(order.status)
                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{order.vendorName}</p>
                            <p className="text-sm text-gray-500">{order.vendorPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="text-sm">
                                {item.name} ({item.quantity} {item.unit})
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">₹{order.totalAmount}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{formatDate(order.orderDate)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedOrder(order)}
                                  className="bg-transparent"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                  <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
                                  <DialogDescription>Complete order information and vendor details</DialogDescription>
                                </DialogHeader>
                                {selectedOrder && (
                                  <div className="space-y-6">
                                    {/* Vendor Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Vendor Information</h4>
                                        <div className="space-y-2">
                                          <div className="flex items-center">
                                            <Avatar className="h-8 w-8 mr-3">
                                              <AvatarImage src="/placeholder.svg" alt={selectedOrder.vendorName} />
                                              <AvatarFallback>{selectedOrder.vendorName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <p className="font-medium">{selectedOrder.vendorName}</p>
                                              <p className="text-sm text-gray-500">{selectedOrder.vendorPhone}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-center text-sm text-gray-600">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            {selectedOrder.vendorAddress}
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Order Information</h4>
                                        <div className="space-y-2 text-sm">
                                          <div>
                                            <span className="text-gray-600">Order Date: </span>
                                            <span>{formatDate(selectedOrder.orderDate)}</span>
                                          </div>
                                          <div>
                                            <span className="text-gray-600">Status: </span>
                                            <Badge className={getStatusColor(selectedOrder.status)}>
                                              {selectedOrder.status}
                                            </Badge>
                                          </div>
                                          <div>
                                            <span className="text-gray-600">Total Amount: </span>
                                            <span className="font-medium">₹{selectedOrder.totalAmount}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Order Items */}
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                                      <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Item</TableHead>
                                              <TableHead>Quantity</TableHead>
                                              <TableHead>Price</TableHead>
                                              <TableHead>Total</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {selectedOrder.items.map((item, idx) => (
                                              <TableRow key={idx}>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell>
                                                  {item.quantity} {item.unit}
                                                </TableCell>
                                                <TableCell>₹{item.price}</TableCell>
                                                <TableCell>₹{item.total}</TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </div>

                                    {/* Notes */}
                                    {selectedOrder.notes && (
                                      <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Order Notes</h4>
                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                          {selectedOrder.notes}
                                        </p>
                                      </div>
                                    )}

                                    {/* Rejection Reason */}
                                    {selectedOrder.status === "rejected" && selectedOrder.rejectionReason && (
                                      <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Rejection Reason</h4>
                                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                          {selectedOrder.rejectionReason}
                                        </p>
                                      </div>
                                    )}

                                    {/* Action Buttons */}
                                    {selectedOrder.status === "pending" && (
                                      <div className="flex space-x-3 pt-4 border-t">
                                        <Button
                                          className="flex-1 bg-green-600 hover:bg-green-700"
                                          onClick={() => handleAcceptOrder(selectedOrder.id)}
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Accept Order
                                        </Button>
                                        <Button
                                          variant="outline"
                                          className="flex-1 text-red-600 hover:text-red-700 bg-transparent"
                                          onClick={() => {
                                            setIsRejectDialogOpen(true)
                                          }}
                                        >
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Reject Order
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            {order.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleAcceptOrder(order.id)}
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 bg-transparent"
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setIsRejectDialogOpen(true)
                                  }}
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Reject Order Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Reject Order</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this order. This will be sent to the vendor.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Rejection Reason *</Label>
                <Textarea
                  id="reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Out of stock, Quality issues, etc."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsRejectDialogOpen(false)
                    setRejectionReason("")
                    setSelectedOrder(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => handleRejectOrder(selectedOrder?.id, rejectionReason)}
                  disabled={!rejectionReason.trim()}
                >
                  Reject Order
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
