"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function getAnalytics() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) throw new Error("User not found")

  const orders = await prisma.order.findMany({
    where:
      user.role === "SUPPLIER"
        ? { supplierId: user.id }
        : { buyerId: user.id },
  })

  return {
    totalOrders: orders.length,
    totalValue: orders.reduce((s: any, o: { totalAmount: any }) => s + o.totalAmount, 0),
    delivered: orders.filter((o: { status: string }) => o.status === "DELIVERED").length,
  }
}
