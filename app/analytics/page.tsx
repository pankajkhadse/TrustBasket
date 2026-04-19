"use client"

import { useEffect, useState } from "react"
import { BarChart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getAnalytics } from "./actions"

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    getAnalytics().then(setData)
  }, [])

  if (!data) return null

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <BarChart className="mr-2" /> Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold">{data.totalOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">Delivered</p>
            <p className="text-2xl font-bold">{data.delivered}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">Total Value</p>
            <p className="text-2xl font-bold">₹{data.totalValue}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
