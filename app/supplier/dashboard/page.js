"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Package,
  TrendingUp,
  DollarSign,
  Users,
  Star,
  Plus,
  Clock,
  Truck,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import SupplierNavbar from "@/components/supplier-navbar"

export default function SupplierDashboard() {
  const [stats] = useState({
    totalProducts: 156,
    totalOrders: 1247,
    revenue: 234500,
    activeVendors: 89,
    rating: 4.8,
    deliveryRate: 96,
  })

  const [recentOrders] = useState([
    {
      id: "ORD-001",
      vendor: "Rajesh's Street Food",
      items: "Onions (10kg), Tomatoes (5kg)",
      amount: 1250,
      status: "Delivered",
      time: "2 hours ago",
      deliveryType: "self",
    },
    {
      id: "ORD-002",
      vendor: "Tasty Bites Corner",
      items: "Potatoes (15kg), Carrots (3kg)",
      amount: 850,
      status: "In Transit",
      time: "4 hours ago",
      deliveryType: "third_party",
    },
    {
      id: "ORD-003",
      vendor: "Mumbai Chaat House",
      items: "Green Chilies (2kg), Coriander (1kg)",
      amount: 450,
      status: "Pickup Ready",
      time: "6 hours ago",
      deliveryType: "pickup",
    },
    {
      id: "ORD-004",
      vendor: "Delhi Street Kitchen",
      items: "Ginger (2kg), Garlic (3kg)",
      amount: 650,
      status: "Processing",
      time: "8 hours ago",
      deliveryType: "self",
    },
  ])

  const [inventory] = useState([
    { name: "Onions", stock: 500, unit: "kg", price: 25, status: "good" },
    { name: "Tomatoes", stock: 200, unit: "kg", price: 40, status: "low" },
    { name: "Potatoes", stock: 800, unit: "kg", price: 20, status: "good" },
    { name: "Green Chilies", stock: 50, unit: "kg", price: 80, status: "critical" },
    { name: "Coriander", stock: 30, unit: "kg", price: 120, status: "low" },
  ])

  const supplierStats = [
    {
      title: "Total Products",
      value: stats.totalProducts.toString(),
      change: "+5",
      icon: Package,
      color: "text-green-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Revenue",
      value: `₹${(stats.revenue / 1000).toFixed(0)}K`,
      change: "+18%",
      icon: DollarSign,
      color: "text-purple-600",
    },
    {
      title: "Active Vendors",
      value: stats.activeVendors.toString(),
      change: "+8",
      icon: Users,
      color: "text-orange-600",
    },
    {
      title: "Avg Rating",
      value: stats.rating.toString(),
      change: "+0.2",
      icon: Star,
      color: "text-yellow-600",
    },
    {
      title: "Delivery Rate",
      value: `${stats.deliveryRate}%`,
      change: "+2%",
      icon: Truck,
      color: "text-green-600",
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800"
      case "In Transit":
        return "bg-blue-100 text-blue-800"
      case "Pickup Ready":
        return "bg-orange-100 text-orange-800"
      case "Processing":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDeliveryTypeLabel = (type) => {
    switch (type) {
      case "self":
        return "Self Delivery"
      case "third_party":
        return "Third Party"
      case "pickup":
        return "Vendor Pickup"
      default:
        return "Unknown"
    }
  }

  const getStockStatus = (status) => {
    switch (status) {
      case "good":
        return { color: "text-green-600", bg: "bg-green-100" }
      case "low":
        return { color: "text-yellow-600", bg: "bg-yellow-100" }
      case "critical":
        return { color: "text-red-600", bg: "bg-red-100" }
      default:
        return { color: "text-gray-600", bg: "bg-gray-100" }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SupplierNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Fresh Veggies Co.!</h1>
          <p className="text-gray-600">Manage your inventory and track orders efficiently</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {supplierStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{order.id}</h4>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{order.vendor}</p>
                        <p className="text-sm text-gray-500 mb-2">{order.items}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">₹{order.amount.toLocaleString()}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {getDeliveryTypeLabel(order.deliveryType)}
                            </Badge>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {order.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Status */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventory.map((item, index) => {
                    const statusStyle = getStockStatus(item.status)
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.color}`}
                            >
                              {item.status === "critical" && <AlertCircle className="h-3 w-3 inline mr-1" />}
                              {item.status === "good" && <CheckCircle className="h-3 w-3 inline mr-1" />}
                              {item.status}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {item.stock} {item.unit} available
                          </p>
                          <p className="text-sm text-gray-500">
                            ₹{item.price}/{item.unit}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delivery Performance */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">96%</div>
                  <p className="text-sm text-gray-600">On-time Delivery</p>
                  <Progress value={96} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">4.8</div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <div className="flex justify-center mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">89</div>
                  <p className="text-sm text-gray-600">Active Vendors</p>
                  <Progress value={75} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button className="h-16 bg-green-600 hover:bg-green-700 text-white">
                  <Package className="h-6 w-6 mr-2" />
                  Manage Inventory
                </Button>
                <Button variant="outline" className="h-16 bg-transparent">
                  <Users className="h-6 w-6 mr-2" />
                  View Vendors
                </Button>
                <Button variant="outline" className="h-16 bg-transparent">
                  <Truck className="h-6 w-6 mr-2" />
                  Track Deliveries
                </Button>
                <Button variant="outline" className="h-16 bg-transparent">
                  <TrendingUp className="h-6 w-6 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
