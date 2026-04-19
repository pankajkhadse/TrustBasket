"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  ShoppingCart,
  Star,
  Plus,
  Minus,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import VendorNavbar from "@/components/vendor-navbar"
import { placeVendorOrder } from "@/lib/orders/vendor"

export default function VendorMarketplaceClient({ materials }: any) {
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<any[]>([])

  const filtered = materials.filter((m: any) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addToCart = (m: any) => {
    setCart((c) => {
      const existing = c.find((i) => i.id === m.id)
      if (existing)
        return c.map((i) =>
          i.id === m.id ? { ...i, qty: i.qty + 1 } : i
        )
      return [...c, { ...m, qty: 1 }]
    })
  }

  const placeOrder = async () => {
    await placeVendorOrder(
      "VENDOR_ID", // replace via auth on API route
      cart.map((i) => ({
        materialId: i.id,
        supplierId: i.supplier.id,
        quantity: i.qty,
        price: i.pricePerUnit,
      }))
    )
    setCart([])
    alert("Order placed successfully")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorNavbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Marketplace</h1>

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((item: any, idx: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    {item.supplier.name}
                  </p>
                  <p className="mt-2 font-bold text-green-600">
                    ₹{item.pricePerUnit}/{item.unit}
                  </p>
                  <Button
                    className="mt-3 w-full"
                    onClick={() => addToCart(item)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="fixed bottom-6 right-6 bg-white p-4 shadow-lg rounded">
            <p className="font-semibold">
              Cart: {cart.reduce((s, i) => s + i.qty, 0)} items
            </p>
            <Button className="mt-2 w-full" onClick={placeOrder}>
              Place Order
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
