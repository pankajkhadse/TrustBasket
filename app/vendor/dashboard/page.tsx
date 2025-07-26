"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ShoppingCart, TrendingUp, Package, Users, Star, Plus, Clock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import VendorNavbar from "@/components/vendor-navbar"

export default function VendorDashboard() {
  const [searchQuery, setSearchQuery] = useState("")

  const stats = [
    { title: "Total Orders", value: "156", change: "+12%", icon: ShoppingCart, color: "text-green-600" },
    { title: "Revenue", value: "₹45,230", change: "+8%", icon: DollarSign, color: "text-blue-600" },
    { title: "Active Suppliers", value: "23", change: "+3", icon: Users, color: "text-orange-600" },
    { title: "Avg Rating", value: "4.8", change: "+0.2", icon: Star, color: "text-yellow-600" },
  ]

  const recentOrders = [
    {
      id: "ORD-001",
      supplier: "Fresh Veggies Co.",
      items: "Onions, Tomatoes",
      amount: "₹1,250",
      status: "Delivered",
      time: "2 hours ago",
    },
    {
      id: "ORD-002",
      supplier: "Spice Masters",
      items: "Garam Masala, Turmeric",
      amount: "₹850",
      status: "In Transit",
      time: "4 hours ago",
    },
    {
      id: "ORD-003",
      supplier: "Dairy Fresh",
      items: "Milk, Paneer",
      amount: "₹650",
      status: "Processing",
      time: "6 hours ago",
    },
  ]

  const topSuppliers = [
    {
      name: "Fresh Veggies Co.",
      category: "Vegetables",
      rating: 4.9,
      orders: 45,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Spice Masters",
      category: "Spices",
      rating: 4.8,
      orders: 32,
      image: "/placeholder.svg?height=40&width=40",
    },
    { name: "Dairy Fresh", category: "Dairy", rating: 4.7, orders: 28, image: "/placeholder.svg?height=40&width=40" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Rajesh!</h1>
          <p className="text-gray-600">Here's what's happening with your business today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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
                  New Order
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
                          <Badge
                            variant={
                              order.status === "Delivered"
                                ? "default"
                                : order.status === "In Transit"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={
                              order.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "In Transit"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{order.supplier}</p>
                        <p className="text-sm text-gray-500">{order.items}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-medium text-gray-900">{order.amount}</span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {order.time}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Suppliers */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Top Suppliers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topSuppliers.map((supplier, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <Avatar>
                        <AvatarImage src={supplier.image || "/placeholder.svg"} alt={supplier.name} />
                        <AvatarFallback>{supplier.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{supplier.name}</p>
                        <p className="text-sm text-gray-500">{supplier.category}</p>
                        <div className="flex items-center mt-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600 ml-1">{supplier.rating}</span>
                          <span className="text-xs text-gray-500 ml-2">{supplier.orders} orders</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-16 bg-green-600 hover:bg-green-700 text-white">
                  <Package className="h-6 w-6 mr-2" />
                  Browse Products
                </Button>
                <Button variant="outline" className="h-16 bg-transparent">
                  <Users className="h-6 w-6 mr-2" />
                  Find Suppliers
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
