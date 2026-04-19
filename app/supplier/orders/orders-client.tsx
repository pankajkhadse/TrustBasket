"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
} from "lucide-react"
import { toast } from "sonner"

import {
  acceptOrder,
  rejectOrder,
} from "@/lib/orders/supplier"

import SupplierNavbar from "@/components/supplier-navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function SupplierOrdersClient({ orders: initialOrders }: any) {
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectOpen, setRejectOpen] = useState(false)

  /* ---------- ACTIONS ---------- */

  const onAccept = async (id: string) => {
    await acceptOrder(id, orders[0].supplierId)
    setOrders(
      orders.map((o: any) =>
        o.id === id ? { ...o, status: "ACCEPTED" } : o
      )
    )
    toast.success("Order accepted")
  }

  const onReject = async () => {
    await rejectOrder(selectedOrder.id, orders[0].supplierId, rejectionReason)
    setOrders(
      orders.map((o: any) =>
        o.id === selectedOrder.id
          ? { ...o, status: "CANCELLED" }
          : o
      )
    )
    toast.error("Order rejected")
    setRejectOpen(false)
    setRejectionReason("")
    setSelectedOrder(null)
  }

  const getStatusColor = (status: string) =>
    status === "PENDING"
      ? "bg-yellow-100 text-yellow-800"
      : status === "ACCEPTED"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800"

  return (
    <div className="min-h-screen bg-gray-50">
      <SupplierNavbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Order Management</h1>

        <Card>
          <CardHeader>
            <CardTitle>Incoming Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {orders.map((order: any, idx: number) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <TableCell>{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.buyer.name}</p>
                        <p className="text-sm text-gray-500">
                          {order.buyer.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>₹{order.totalAmount}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      {order.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600"
                            onClick={() => onAccept(order.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => {
                              setSelectedOrder(order)
                              setRejectOpen(true)
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Reject Dialog */}
        <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Order</DialogTitle>
            </DialogHeader>

            <Label>Reason</Label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />

            <Button
              className="bg-red-600 mt-4"
              disabled={!rejectionReason.trim()}
              onClick={onReject}
            >
              Confirm Reject
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
