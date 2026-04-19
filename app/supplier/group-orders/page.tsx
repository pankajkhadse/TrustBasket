"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SupplierNavbar from "@/components/supplier-navbar"
import { getSupplierGroupOrders, closeGroupOrder } from "./actions"

export default function SupplierGroupOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    getSupplierGroupOrders().then(setOrders)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <SupplierNavbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Group Orders</h1>

        {orders.map((order) => (
          <Card key={order.id} className="mb-4">
            <CardHeader className="flex flex-row justify-between">
              <CardTitle>{order.material.name}</CardTitle>
              <Badge>{order.status}</Badge>
            </CardHeader>

            <CardContent className="flex justify-between items-center">
              <div>
                <p>Vendor: {order.vendor.name}</p>
                <p className="text-sm text-gray-500">
                  Price: ₹{order.material.pricePerUnit}/{order.material.unit}
                </p>
              </div>

              {order.status === "OPEN" && (
                <Button
                  variant="outline"
                  onClick={() => closeGroupOrder(order.id)}
                >
                  Close Order
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
