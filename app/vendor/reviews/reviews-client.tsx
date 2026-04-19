"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import VendorNavbar from "@/components/vendor-navbar"
import { getVendorOrdersForReview, submitReview } from "./actions"

export default function VendorReviewsPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")

  useEffect(() => {
    getVendorOrdersForReview().then(setOrders)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorNavbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Rate Suppliers</h1>

        {orders.length === 0 && (
          <p className="text-gray-500">No pending reviews 🎉</p>
        )}

        {orders.map((order) => (
          <Card key={order.id} className="mb-6">
            <CardHeader>
              <CardTitle>{order.supplier.name}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    onClick={() => setRating(s)}
                    className={`h-6 w-6 cursor-pointer ${
                      s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              <Textarea
                placeholder="Write your feedback (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <Button
                onClick={() =>
                  submitReview(order.id, order.supplierId, rating, comment)
                }
              >
                Submit Review
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
