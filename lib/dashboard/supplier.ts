import { prisma } from "@/lib/prisma"

export async function getSupplierDashboardData(userId: string) {
  const [
    totalProducts,
    totalOrders,
    revenueAgg,
    activeVendors,
    ratingAgg,
    recentOrders,
    inventory,
  ] = await Promise.all([
    prisma.material.count({ where: { supplierId: userId } }),

    prisma.order.count({ where: { supplierId: userId } }),

    prisma.order.aggregate({
      where: { supplierId: userId },
      _sum: { totalAmount: true },
    }),

    prisma.groupOrder.count({
      where: { supplierId: userId },
    }),

    prisma.review.aggregate({
      where: { supplierId: userId },
      _avg: { rating: true },
    }),

    prisma.order.findMany({
      where: { supplierId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        buyer: true,
        items: { include: { material: true } },
      },
    }),

    prisma.material.findMany({
      where: { supplierId: userId },
      take: 5,
    }),
  ])

  return {
    stats: {
      totalProducts,
      totalOrders,
      revenue: revenueAgg._sum.totalAmount || 0,
      activeVendors,
      rating: Number(ratingAgg._avg.rating || 0).toFixed(1),
      deliveryRate: 96, // can be calculated later
    },
    recentOrders,
    inventory,
  }
}
