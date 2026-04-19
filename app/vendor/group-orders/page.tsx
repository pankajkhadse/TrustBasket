"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Package,
  Clock,
  CheckCircle,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import VendorNavbar from "@/components/vendor-navbar"
import { getVendorGroupOrders } from "./actions"

type GroupOrderStatus = "OPEN" | "CLOSED" | "DELIVERED"

type GroupOrder = {
  id: string
  status: GroupOrderStatus
  createdAt: Date   // ✅ FIX HERE
  material: {
    name: string
    pricePerUnit: number
    unit: string
  }
  supplier: {
    name: string
    phone: string
    ratingStars: number
  }
}

export default function VendorGroupOrdersPage() {
  const [orders, setOrders] = useState<GroupOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getVendorGroupOrders()
        setOrders(data)
      } catch (error) {
        console.error("Failed to load group orders:", error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  const getStatusColor = (status: GroupOrderStatus) => {
    switch (status) {
      case "OPEN":
        return "bg-yellow-100 text-yellow-800"
      case "CLOSED":
        return "bg-blue-100 text-blue-800"
      case "DELIVERED":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: GroupOrderStatus) => {
    switch (status) {
      case "OPEN":
        return Clock
      case "DELIVERED":
        return CheckCircle
      default:
        return Package
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <VendorNavbar />
        <div className="p-10 text-center text-gray-500">
          Loading group orders...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorNavbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Group Orders
          </h1>
          <p className="text-gray-600">
            Orders created collaboratively with other vendors
          </p>
        </div>

        {orders.length === 0 && (
          <Card>
            <CardContent className="p-10 text-center text-gray-500">
              <Users className="mx-auto mb-4 h-10 w-10" />
              No group orders created yet
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {orders.map((order, index) => {
            const StatusIcon = getStatusIcon(order.status)

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">
                      {order.material.name}
                    </CardTitle>

                    <Badge
                      className={`flex items-center gap-1 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {order.status}
                    </Badge>
                  </CardHeader>

                  <CardContent className="grid gap-4 text-sm md:grid-cols-3">
                    <div>
                      <p className="text-gray-500">Supplier</p>
                      <p className="font-medium">
                        {order.supplier.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        ⭐ {order.supplier.ratingStars}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Price</p>
                      <p className="font-medium">
                        ₹{order.material.pricePerUnit}/
                        {order.material.unit}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
