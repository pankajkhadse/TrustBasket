"use client"

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

export default function SupplierDashboardClient({ data }: any) {
  const { stats, recentOrders, inventory } = data

  const supplierStats = [
    { title: "Total Products", value: stats.totalProducts, icon: Package },
    { title: "Total Orders", value: stats.totalOrders, icon: Users },
    {
      title: "Revenue",
      value: `₹${(stats.revenue / 1000).toFixed(0)}K`,
      icon: DollarSign,
    },
    { title: "Active Vendors", value: stats.activeVendors, icon: Users },
    { title: "Avg Rating", value: stats.rating, icon: Star },
    { title: "Delivery Rate", value: `${stats.deliveryRate}%`, icon: Truck },
  ]

  const getStockStatus = (qty: number) => {
    if (qty < 50) return "critical"
    if (qty < 150) return "low"
    return "good"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SupplierNavbar />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <h1 className="text-3xl font-bold">Supplier Dashboard</h1>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supplierStats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <CardContent className="p-6 flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{s.title}</p>
                    <p className="text-2xl font-bold">{s.value}</p>
                  </div>
                  <s.icon className="h-6 w-6 text-gray-400" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* RECENT ORDERS */}
        <Card>
          <CardHeader className="flex justify-between flex-row">
            <CardTitle>Recent Orders</CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders.map((order: any) => (
              <div key={order.id} className="p-4 bg-gray-100 rounded">
                <div className="flex justify-between">
                  <p className="font-semibold">{order.buyer.name}</p>
                  <Badge>{order.status}</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  ₹{order.totalAmount}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* INVENTORY */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inventory.map((m: any) => {
              const status = getStockStatus(m.stockAvailable || 0)
              return (
                <div
                  key={m.id}
                  className="flex justify-between bg-gray-100 p-3 rounded"
                >
                  <span>{m.name}</span>
                  <span className="text-sm">
                    {m.stockAvailable} {m.unit}
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* PERFORMANCE */}
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">{stats.deliveryRate}%</p>
              <Progress value={stats.deliveryRate} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.rating}</p>
              <Star className="mx-auto text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.activeVendors}</p>
              <Users className="mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
