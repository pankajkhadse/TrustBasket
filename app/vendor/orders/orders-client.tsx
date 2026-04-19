"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Phone,
  MapPin,
  ShoppingCart,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

export default function VendorOrdersClient({ orders }: any) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "ACCEPTED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return Clock
      case "ACCEPTED":
        return CheckCircle
      case "CANCELLED":
        return XCircle
      default:
        return Package
    }
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-IN")

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o: any) => o.status === "PENDING").length,
    acceptedOrders: orders.filter((o: any) => o.status === "ACCEPTED").length,
    totalSpent: orders
      .filter((o: any) => o.status === "ACCEPTED")
      .reduce((s: number, o: any) => s + o.totalAmount, 0),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorNavbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Orders" value={stats.totalOrders} icon={Package} />
          <StatCard title="Pending" value={stats.pendingOrders} icon={Clock} />
          <StatCard title="Accepted" value={stats.acceptedOrders} icon={CheckCircle} />
          <StatCard title="Total Spent" value={`₹${stats.totalSpent}`} icon={ShoppingCart} />
        </div>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: any, i: number) => {
                  const Icon = getStatusIcon(order.status)
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <TableCell>{order.id.slice(0, 8)}</TableCell>
                      <TableCell>{order.supplier.name}</TableCell>
                      <TableCell>₹{order.totalAmount}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          <Icon className="h-3 w-3 mr-1" />
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <OrderDialog order={selectedOrder} />
                        </Dialog>
                      </TableCell>
                    </motion.tr>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({ title, value, icon: Icon }: any) {
  return (
    <Card>
      <CardContent className="p-6 flex justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="h-6 w-6 text-gray-500" />
      </CardContent>
    </Card>
  )
}

function OrderDialog({ order }: any) {
  if (!order) return null

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Order Details</DialogTitle>
        <DialogDescription>{order.id}</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Supplier</h4>
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>{order.supplier.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{order.supplier.name}</p>
              <p className="text-sm text-gray-500 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {order.supplier.address}
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <Phone className="h-3 w-3 mr-1" />
                {order.supplier.phone}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Items</h4>
          {order.items.map((i: any) => (
            <div key={i.id} className="text-sm flex justify-between">
              <span>
                {i.material.name} ({i.quantity} {i.material.unit})
              </span>
              <span>₹{i.priceAtPurchase * i.quantity}</span>
            </div>
          ))}
        </div>
      </div>
    </DialogContent>
  )
}
