"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Package, Clock, CheckCircle, XCircle, Eye, Phone, MapPin, ShoppingCart } from "lucide-react"
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
import VendorNavbar from "@/components/vendor-navbar"

export default function VendorOrders() {
  const [orders] = useState([
    {
      id: "ORD-001",
      supplierName: "Fresh Veggies Co.",
      supplierPhone: "+91 98765 43210",
      supplierAddress: "Connaught Place, New Delhi",
      items: [
        { name: "Fresh Tomatoes", quantity: 10, unit: "kg", price: 40, total: 400 },
        { name: "Green Chilies", quantity: 2, unit: "kg", price: 80, total: 160 },
      ],
      totalAmount: 560,
      status: "accepted",
      orderDate: "2024-01-20T10:30:00Z",
      acceptedDate: "2024-01-20T11:15:00Z",
      notes: "Need fresh vegetables for evening rush",
    },
    {
      id: "ORD-002",
      supplierName: "Spice Masters",
      supplierPhone: "+91 98765 43211",
      supplierAddress: "Chandni Chowk, New Delhi",
      items: [{ name: "Garam Masala", quantity: 1, unit: "kg", price: 200, total: 200 }],
      totalAmount: 200,
      status: "pending",
      orderDate: "2024-01-21T09:15:00Z",
      notes: "Regular weekly order",
    },
    {
      id: "ORD-003",
      supplierName: "Dairy Fresh",
      supplierPhone: "+91 98765 43212",
      supplierAddress: "Noida Sector 18",
      items: [
        { name: "Fresh Milk", quantity: 20, unit: "litre", price: 60, total: 1200 },
        { name: "Fresh Paneer", quantity: 2, unit: "kg", price: 300, total: 600 },
      ],
      totalAmount: 1800,
      status: "rejected",
      orderDate: "2024-01-19T16:45:00Z",
      rejectedDate: "2024-01-19T17:30:00Z",
      rejectionReason: "Out of stock for paneer",
      notes: "Urgent requirement for weekend",
    },
    {
      id: "ORD-004",
      supplierName: "Fresh Veggies Co.",
      supplierPhone: "+91 98765 43210",
      supplierAddress: "Connaught Place, New Delhi",
      items: [{ name: "Fresh Tomatoes", quantity: 5, unit: "kg", price: 40, total: 200 }],
      totalAmount: 200,
      status: "pending",
      orderDate: "2024-01-21T14:20:00Z",
      notes: "Small order for testing",
    },
  ])

  const [selectedOrder, setSelectedOrder] = useState(null)

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
    totalSpent: orders
      .filter((order) => order.status === "accepted")
      .reduce((sum, order) => sum + order.totalAmount, 0),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track your orders and order history</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-purple-600">₹{stats.totalSpent.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <ShoppingCart className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Supplier</TableHead>
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
                            <p className="font-medium text-gray-900">{order.supplierName}</p>
                            <p className="text-sm text-gray-500">{order.supplierPhone}</p>
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
                                <DialogDescription>Complete order information and supplier details</DialogDescription>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="space-y-6">
                                  {/* Supplier Information */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-2">Supplier Information</h4>
                                      <div className="space-y-2">
                                        <div className="flex items-center">
                                          <Avatar className="h-8 w-8 mr-3">
                                            <AvatarImage src="/placeholder.svg" alt={selectedOrder.supplierName} />
                                            <AvatarFallback>{selectedOrder.supplierName.charAt(0)}</AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <p className="font-medium">{selectedOrder.supplierName}</p>
                                            <p className="text-sm text-gray-500">{selectedOrder.supplierPhone}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                          <MapPin className="h-4 w-4 mr-2" />
                                          {selectedOrder.supplierAddress}
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
                                        {selectedOrder.acceptedDate && (
                                          <div>
                                            <span className="text-gray-600">Accepted: </span>
                                            <span>{formatDate(selectedOrder.acceptedDate)}</span>
                                          </div>
                                        )}
                                        {selectedOrder.rejectedDate && (
                                          <div>
                                            <span className="text-gray-600">Rejected: </span>
                                            <span>{formatDate(selectedOrder.rejectedDate)}</span>
                                          </div>
                                        )}
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

                                  {/* Contact Supplier */}
                                  <div className="flex space-x-3 pt-4 border-t">
                                    <Button variant="outline" className="flex-1 bg-transparent">
                                      <Phone className="h-4 w-4 mr-2" />
                                      Call Supplier
                                    </Button>
                                    <Button variant="outline" className="flex-1 bg-transparent">
                                      <Package className="h-4 w-4 mr-2" />
                                      Reorder Items
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
