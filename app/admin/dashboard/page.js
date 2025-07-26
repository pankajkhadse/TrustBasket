"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Users,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import AdminNavbar from "@/components/admin-navbar"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalVendors: 1247,
    totalSuppliers: 523,
    totalOrders: 8934,
    totalRevenue: 2847650,
    activeDeliveries: 156,
    pendingApprovals: 23,
  })

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: "vendor_registration",
      message: "New vendor 'Tasty Bites' registered",
      time: "2 minutes ago",
      status: "pending",
    },
    {
      id: 2,
      type: "order_completed",
      message: "Order #ORD-8934 completed successfully",
      time: "15 minutes ago",
      status: "success",
    },
    {
      id: 3,
      type: "supplier_verification",
      message: "Supplier 'Fresh Farms' verification pending",
      time: "1 hour ago",
      status: "warning",
    },
    {
      id: 4,
      type: "payment_issue",
      message: "Payment dispute reported for order #ORD-8901",
      time: "2 hours ago",
      status: "error",
    },
  ])

  const [topPerformers, setTopPerformers] = useState([
    {
      name: "Rajesh's Street Food",
      type: "vendor",
      orders: 234,
      revenue: 45600,
      rating: 4.8,
      growth: "+12%",
    },
    {
      name: "Fresh Veggies Co.",
      type: "supplier",
      orders: 189,
      revenue: 78900,
      rating: 4.9,
      growth: "+8%",
    },
    {
      name: "Spice Masters",
      type: "supplier",
      orders: 156,
      revenue: 34500,
      rating: 4.7,
      growth: "+15%",
    },
  ])

  const adminStats = [
    {
      title: "Total Vendors",
      value: stats.totalVendors.toLocaleString(),
      change: "+12%",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Suppliers",
      value: stats.totalSuppliers.toLocaleString(),
      change: "+8%",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      change: "+23%",
      icon: ShoppingCart,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Platform Revenue",
      value: `₹${(stats.totalRevenue / 100000).toFixed(1)}L`,
      change: "+18%",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Active Deliveries",
      value: stats.activeDeliveries.toString(),
      change: "+5%",
      icon: MapPin,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals.toString(),
      change: "-3%",
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage the StreetServe platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {adminStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p
                        className={`text-sm font-medium ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                      >
                        {stat.change}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Platform Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-full ${
                            activity.status === "success"
                              ? "bg-green-100 text-green-600"
                              : activity.status === "warning"
                                ? "bg-yellow-100 text-yellow-600"
                                : activity.status === "error"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {activity.status === "success" && <CheckCircle className="h-4 w-4" />}
                          {activity.status === "warning" && <AlertTriangle className="h-4 w-4" />}
                          {activity.status === "error" && <AlertTriangle className="h-4 w-4" />}
                          {activity.status === "pending" && <Clock className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.message}</p>
                          <p className="text-sm text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          activity.status === "success"
                            ? "default"
                            : activity.status === "warning"
                              ? "secondary"
                              : activity.status === "error"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {activity.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Platform Health */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Server Performance</span>
                      <span>98%</span>
                    </div>
                    <Progress value={98} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>User Satisfaction</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Order Success Rate</span>
                      <span>96%</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((performer, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <Avatar>
                        <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={performer.name} />
                        <AvatarFallback>{performer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{performer.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{performer.type}</p>
                        <div className="flex items-center mt-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600 ml-1">{performer.rating}</span>
                          <span className="text-xs text-green-600 ml-2 font-medium">{performer.growth}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {performer.orders} orders • ₹{performer.revenue.toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Package className="h-4 w-4 mr-2" />
                    Review Approvals
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <MapPin className="h-4 w-4 mr-2" />
                    Delivery Tracking
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
