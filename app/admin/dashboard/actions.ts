"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function getAdminDashboardStats() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const admin = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!admin || admin.role !== "ADMIN") {
    throw new Error("Forbidden")
  }

  const [
    totalUsers,
    buyers,
    suppliers,
    pendingSuppliers,
    totalOrders,
    deliveredOrders,
    revenueAgg,
    groupOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.user.count({ where: { role: "SUPPLIER" } }),
    prisma.user.count({ where: { role: "SUPPLIER", status: "PENDING" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: "DELIVERED" },
    }),
    prisma.groupOrder.count(),
  ])

  return {
    totalUsers,
    buyers,
    suppliers,
    pendingSuppliers,
    totalOrders,
    deliveredOrders,
    totalRevenue: revenueAgg._sum.totalAmount ?? 0,
    groupOrders,
  }
}
