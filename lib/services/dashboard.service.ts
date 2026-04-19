import { prisma } from "../prisma"

export async function getBuyerDashboard(userId: string) {
    const [orders, reviews] = await Promise.all([
        prisma.order.findMany({
            where: { buyerId: userId },
            include: { items: true, supplier: true },
            orderBy: { createdAt: "desc" },
        }),
        prisma.review.findMany({
            where: { reviewerId: userId },
        }),
    ])

    return { orders, reviews }
}
export async function getSupplierDashboard(userId: string) {
    const [materials, orders, groupOrders] = await Promise.all([
        prisma.material.findMany({
            where: { supplierId: userId },
        }),
        prisma.order.findMany({
            where: { supplierId: userId },
            include: { buyer: true },
        }),
        prisma.groupOrder.findMany({
            where: { supplierId: userId },
            include: { vendor: true, material: true },
        }),
    ])

    return { materials, orders, groupOrders }
}
export async function getAdminDashboard() {
    const [pendingUsers, stats] = await Promise.all([
        prisma.user.findMany({
            where: { status: "PENDING" },
        }),
        prisma.user.groupBy({
            by: ["role"],
            _count: true,
        }),
    ])

    return { pendingUsers, stats }
}
