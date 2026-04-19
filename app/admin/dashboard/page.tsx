"use client"

import { useEffect, useState } from "react"
import {
  Users,
  UserCheck,
  Package,
  Clock,
  IndianRupee,
  Layers,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import AdminNavbar from "@/components/admin-navbar"
import { getAdminDashboardStats } from "./actions"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    getAdminDashboardStats().then(setStats)
  }, [])

  if (!stats) return null

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users },
    { label: "Buyers", value: stats.buyers, icon: UserCheck },
    { label: "Suppliers", value: stats.suppliers, icon: Package },
    {
      label: "Pending Approvals",
      value: stats.pendingSuppliers,
      icon: Clock,
      highlight: true,
    },
    {
      label: "Orders Delivered",
      value: stats.deliveredOrders,
      icon: Package,
    },
    {
      label: "Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
    },
    {
      label: "Group Orders",
      value: stats.groupOrders,
      icon: Layers,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <Card
              key={i}
              className={card.highlight ? "border-red-300" : ""}
            >
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
                <card.icon className="h-8 w-8 text-gray-400" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
